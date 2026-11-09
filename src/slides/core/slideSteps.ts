/**
 * A slide that teaches a procedure: its list is walked one item at a time,
 * and the tool framed beside it does each item as it is reached.
 *
 * The player moves through the steps of such a slide before it moves on to
 * the next one, the way a presenter's remote reveals the next line of a build.
 */

import { splitEmbedAddress } from './embedAddress.ts';
import type { Slide, Talk } from './talk.ts';

/** The layout whose list is walked one item at a time, beside the tool. */
export const STEPS_LAYOUT = 'steps';

/** What a steps slide is made of. */
export interface SlideSteps {
  /** What comes before the list: the heading, a line of context. */
  intro: string;
  /** Each item of the list, as Markdown, in order. */
  steps: string[];
  /** What follows the list. */
  outro: string;
  /** The address of the tool framed beside the list, or `null`. */
  src: string | null;
}

/** Where the presentation stands: a slide, and a step of it. */
export interface SlidePosition {
  /** The slide, zero-based. */
  slide: number;
  /** The step of that slide, zero-based; `0` on a slide with no steps. */
  step: number;
}

/**
 * Split a steps slide into its prose, its list and its address.
 *
 * The first list of the body, ordered or not, is the procedure; an item may
 * run onto indented lines. Whatever comes after the list stays prose, and the
 * last bare URL of the body is the tool, as on an embed slide.
 * @param body - The slide body.
 * @returns Its parts.
 */
export function splitSteps(body: string): SlideSteps {
  const { prose, src } = splitEmbedAddress(body);
  const lines = prose.split('\n');
  let start = 0;
  while (start < lines.length && !ITEM_RE.test(lines[start] ?? '')) start++;
  if (start === lines.length) {
    return { intro: prose, steps: [], outro: '', src };
  }

  const steps: string[] = [];
  let index = start;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    const item = ITEM_RE.exec(line);
    if (item !== null) {
      steps.push(item.groups?.text?.trim() ?? '');
    } else if (line.trim() === '') {
      const next = nextFilledLine(lines, index);
      if (!continuesList(lines[next])) break;
      index = next;
      continue;
    } else if (CONTINUATION_RE.test(line)) {
      steps[steps.length - 1] = `${steps.at(-1) ?? ''} ${line.trim()}`;
    } else {
      break;
    }
    index++;
  }

  return {
    intro: lines.slice(0, start).join('\n').trim(),
    steps,
    outro: lines.slice(index).join('\n').trim(),
    src,
  };
}

/**
 * How many steps a slide is walked through.
 * @param slide - The slide.
 * @returns The number of items of a steps slide's list, `0` for any other.
 */
export function slideStepCount(slide: Slide): number {
  if (slide.layout !== STEPS_LAYOUT) return 0;
  return splitSteps(slide.body).steps.length;
}

/**
 * How many steps each slide of a talk is walked through.
 * @param talk - The talk.
 * @returns One count per slide, in order.
 */
export function talkStepCounts(talk: Talk): number[] {
  const counts = new Array<number>(talk.slides.length);
  for (let index = 0; index < talk.slides.length; index++) {
    const slide = talk.slides[index];
    counts[index] = slide === undefined ? 0 : slideStepCount(slide);
  }
  return counts;
}

/**
 * Where a step forward leads: the next step of the slide, or the first of
 * the next slide once its steps are all shown.
 * @param position - Where the presentation stands.
 * @param counts - How many steps each slide has, from {@link talkStepCounts}.
 * @returns The new position; the same one at the end of the talk.
 */
export function nextPosition(
  position: SlidePosition,
  counts: readonly number[],
): SlidePosition {
  const steps = counts[position.slide] ?? 0;
  if (position.step < steps - 1) {
    return { slide: position.slide, step: position.step + 1 };
  }
  if (position.slide >= counts.length - 1) return position;
  return { slide: position.slide + 1, step: 0 };
}

/**
 * Where a step back leads: the previous step of the slide, or the last step
 * of the slide before, so going back retraces what going forward showed.
 * @param position - Where the presentation stands.
 * @param counts - How many steps each slide has, from {@link talkStepCounts}.
 * @returns The new position; the same one at the start of the talk.
 */
export function previousPosition(
  position: SlidePosition,
  counts: readonly number[],
): SlidePosition {
  if (position.step > 0) {
    return { slide: position.slide, step: position.step - 1 };
  }
  if (position.slide <= 0) return position;
  const slide = position.slide - 1;
  return { slide, step: Math.max((counts[slide] ?? 0) - 1, 0) };
}

function nextFilledLine(lines: readonly string[], from: number): number {
  let next = from + 1;
  while (next < lines.length && (lines[next] ?? '').trim() === '') next++;
  return next;
}

function continuesList(line: string | undefined): boolean {
  return (
    line !== undefined && (ITEM_RE.test(line) || CONTINUATION_RE.test(line))
  );
}

const ITEM_RE = /^ {0,3}(?:[*+-]|\d{1,9}[.)])[\t ]+(?<text>.*)$/;
const CONTINUATION_RE = /^(?: {2,}|\t)\S/;
