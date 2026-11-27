/**
 * What moves in glassware, and how a figure carries it: the timing of a
 * rising bubble and of a run along water, the stylesheet that sets them
 * going, and whether a scene has anything to move at all.
 *
 * A figure is written held still, `data-motion="still"` on its root, so every
 * program that opens it draws it as a file is drawn; a page showing it — draw's
 * canvas, write's page — sets it moving by writing `moving` there instead.
 */

import { MOTION_CSS } from './motionCss.ts';
import type { PathPrimitive, Scene } from './primitives.ts';

/** How long a bubble takes to rise, in seconds, as {@link MOTION_CSS} says. */
const BUBBLE_RISE = 1.4;

/** How far behind the bubble under it a bubble sets off, in seconds. */
const BUBBLE_STEP = 0.35;

/** The attribute that says whether a figure moves: `still` or `moving`. */
export const MOTION_ATTRIBUTE = 'data-motion';

/** The attribute, with the value it holds: `still` or `moving`. */
const MOTION = /\sdata-motion\s*=\s*(?:"(?:still|moving)"|'(?:still|moving)')/;

/** How a run fades in where it starts and out where it ends. */
export const RUN_FADE = { values: '0;1;1;0', keyTimes: '0;0.1;0.9;1' };

/**
 * The stylesheet a figure carries: {@link MOTION_CSS}, its comments and
 * spaces taken out.
 */
export const MOTION_STYLE = compactCss(MOTION_CSS);

/**
 * How far into its rise a bubble starts, so the stream is never still and no
 * two bubbles of it rise in step.
 * @param bubble - The bubble's place in its stream, from the bottom.
 * @returns The CSS `animation-delay`, negative.
 */
export function bubbleDelay(bubble: number): string {
  return `${(-((bubble * BUBBLE_STEP) % BUBBLE_RISE)).toFixed(2)}s`;
}

/**
 * The SMIL timing of a run: its own clock, so drawing it again never
 * restarts it.
 * @param flow - The run.
 * @returns The `begin`, `dur` and `repeatCount` attributes.
 */
export function runTiming(flow: NonNullable<PathPrimitive['flow']>): {
  begin: string;
  dur: string;
  repeatCount: string;
} {
  return {
    begin: `${flow.begin.toFixed(2)}s`,
    dur: `${flow.duration.toFixed(2)}s`,
    repeatCount: 'indefinite',
  };
}

/**
 * Whether a scene has anything that moves: a bubble, a run, a turning piece,
 * a spinning rotor, a piece an orbital shaker swirls.
 * @param scene - The scene.
 * @returns True when a figure of it can be set moving.
 */
export function sceneMoves(scene: Scene): boolean {
  for (const item of scene.items) {
    if (item.turning !== undefined || item.swirling !== undefined) return true;
    for (const primitive of item.primitives) {
      if (
        primitive.kind === 'path' &&
        (primitive.flow !== undefined ||
          primitive.bubble !== undefined ||
          primitive.spins !== undefined ||
          primitive.swirls !== undefined)
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Whether a figure has something that moves.
 * @param svg - The figure's text.
 * @returns True when its root says it can be set moving.
 */
export function figureMoves(svg: string): boolean {
  return MOTION.test(rootTag(svg));
}

/**
 * A figure set moving.
 * @param svg - The figure's text, one that moves.
 * @returns The same figure, its root saying `moving`; the figure as it came
 * when it has nothing that moves.
 */
export function movingFigure(svg: string): string {
  const root = rootTag(svg);
  if (!MOTION.test(root)) return svg;
  const moving = root.replace(MOTION, ` ${MOTION_ATTRIBUTE}="moving"`);
  return svg.replace(root, () => moving);
}

function rootTag(svg: string): string {
  return /<svg\b[^>]*>/i.exec(svg)?.[0] ?? '';
}

// Comments out, every run of spaces one space, none around punctuation: a
// descendant combinator keeps its one space.
function compactCss(css: string): string {
  return css
    .replaceAll(/\/\*[\s\S]*?\*\//g, '')
    .replaceAll(/\s+/g, ' ')
    .replaceAll(/\s*(?<mark>[{};,])\s*/g, '$<mark>')
    .trim();
}
