/**
 * Several compound numbers cited together, written as a chemist writes them:
 * in order, a run of three or more as a range — 1–4 — and the members of one
 * compound after its number once — 5a–c,e.
 */

/** The label of a referent the document does not hold. */
export const MISSING_LABEL = '?';

/**
 * The numbers of compounds cited together, as one text.
 * @param labels - What each compound reads, as the numbering writes it: `4`,
 * `5b`, `S12`, or `?` for one the document does not hold.
 * @returns The list: sorted, each once, runs of three or more shortened to a
 * range, and members of one compound after its number — `1–4, 5a–c,e, ?`.
 */
export function joinReferentLabels(labels: readonly string[]): string {
  const parsed = [...new Set(labels)].map(parseLabel).toSorted(compareLabels);
  const parts: string[] = [];
  let index = 0;
  while (index < parsed.length) {
    const first = parsed[index] as Label;
    if (first.number === undefined) {
      parts.push(first.text);
      index++;
    } else if (first.letters === '') {
      let last = index;
      while (follows(parsed[last + 1], parsed[last] as Label, 'number')) last++;
      parts.push(...runOf(parsed.slice(index, last + 1), ', '));
      index = last + 1;
    } else {
      let last = index;
      while (sameCompound(parsed[last + 1], first)) last++;
      const members = parsed.slice(index, last + 1);
      parts.push(`${first.prefix}${first.number}${lettersOf(members)}`);
      index = last + 1;
    }
  }
  return parts.join(', ');
}

/** A label read into its parts; a label that is not a number keeps its text. */
interface Label {
  text: string;
  prefix: string;
  number?: number;
  letters: string;
}

const LABEL = /^(?<prefix>\D*?)(?<number>\d+)(?<letters>[a-z]*)$/;

function parseLabel(text: string): Label {
  const groups = text === MISSING_LABEL ? undefined : LABEL.exec(text)?.groups;
  if (!groups) return { text, prefix: '', letters: '' };
  return {
    text,
    prefix: groups.prefix ?? '',
    number: Number(groups.number),
    letters: groups.letters ?? '',
  };
}

function compareLabels(first: Label, second: Label): number {
  // What is not a number, `?`, comes last.
  if (first.number === undefined || second.number === undefined) {
    return (
      Number(first.number === undefined) - Number(second.number === undefined)
    );
  }
  return (
    first.prefix.localeCompare(second.prefix) ||
    first.number - second.number ||
    letterIndex(first.letters) - letterIndex(second.letters)
  );
}

// Whether `next` continues a run ending in `previous`: the next number, or the
// next member of the same compound.
function follows(
  next: Label | undefined,
  previous: Label,
  by: 'number' | 'letter',
): next is Label {
  if (next?.number === undefined || next.prefix !== previous.prefix) {
    return false;
  }
  if (by === 'number') {
    return next.letters === '' && next.number === (previous.number ?? 0) + 1;
  }
  return (
    next.number === previous.number &&
    letterIndex(next.letters) === letterIndex(previous.letters) + 1
  );
}

function sameCompound(next: Label | undefined, first: Label): boolean {
  return (
    next !== undefined &&
    next.number === first.number &&
    next.prefix === first.prefix &&
    next.letters !== ''
  );
}

// A run of three or more as a range, a shorter one as it is.
function runOf(run: Label[], separator: string): string[] {
  const first = run[0] as Label;
  const last = run.at(-1) as Label;
  if (run.length < 3) return [run.map(({ text }) => text).join(separator)];
  return [`${first.text}–${last.text}`];
}

// The letters of the members of one compound: runs of three or more as a
// range, joined by commas, as in 5a–c,e.
function lettersOf(members: Label[]): string {
  const parts: string[] = [];
  let index = 0;
  while (index < members.length) {
    let last = index;
    while (follows(members[last + 1], members[last] as Label, 'letter')) last++;
    const run = members
      .slice(index, last + 1)
      .map(({ letters }) => ({ ...(members[0] as Label), text: letters }));
    parts.push(...runOf(run, ','));
    index = last + 1;
  }
  return parts.join(',');
}

// The place of a series letter: a is 1, z 26, aa 27, as seriesLetter writes them.
function letterIndex(letters: string): number {
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + (letter.codePointAt(0) ?? 96) - 96;
  }
  return index;
}
