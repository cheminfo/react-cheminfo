/**
 * The numbers of a document's referents: each kind counted on its own, in the
 * order the document first shows or cites them, a member reading its
 * compound's number and its row's letter — 5b.
 *
 * Two referents with the same structure are one compound, and a structure
 * drawn in full that is a member of a series (the methyl compound of 5) reads
 * as that member.
 */

import { seriesLetter } from './seriesLetter.ts';
import type {
  FigureReferent,
  ReferentMention,
  ReferentSeries,
} from './types.ts';

/** How numbers are written. */
export interface ReferentNumberingOptions {
  /**
   * Written before every number, as a supporting information writes `S`.
   * @default ''
   */
  prefix?: string;
  /**
   * The first number of each kind, so a supporting information can continue
   * the numbers of its paper.
   * @default 1
   */
  start?: number;
  /**
   * Numbers fixed by the author, by referent key. The others take the numbers
   * left free, in order.
   * @default {}
   */
  pins?: Readonly<Record<string, number>>;
}

/** What a document's referents read. */
export interface ReferentNumbering {
  /**
   * What a label or a reference reads.
   * @param mention - The referent, or one of its members.
   * @returns `5`, `5b`, or `?` for one the document does not hold.
   */
  label: (mention: ReferentMention) => string;
  /**
   * The number a referent has.
   * @param key - The referent.
   * @returns Its number, or `undefined` for one the document does not hold.
   */
  numberOf: (key: string) => number | undefined;
}

/** What the document holds, and where it shows or cites it. */
export interface ReferentNumberingInput {
  /** The referents of every figure, figures in the order placed. */
  referents: readonly FigureReferent[];
  /** The series of every figure: the first one of a key is the one used. */
  series: readonly ReferentSeries[];
  /**
   * Every place a referent is shown or cited, in reading order: each figure's
   * referents where the figure stands, each reference where it is written.
   */
  order: readonly ReferentMention[];
}

/** The label of a referent the document does not hold. */
export const MISSING_LABEL = '?';

/**
 * Number a document's referents.
 * @param input - What the document holds, and in what order.
 * @param options - How numbers are written.
 * @returns What each one reads.
 */
export function numberReferents(
  input: ReferentNumberingInput,
  options: ReferentNumberingOptions = {},
): ReferentNumbering {
  const { prefix = '', start = 1, pins = {} } = options;
  const identity = identify(input.referents);
  const numbers = new Map<string, number>();
  const counters = new Map<string, Counter>();
  for (const mention of input.order) {
    const owner = identity.owner(mention);
    if (owner === undefined || numbers.has(owner.key)) continue;
    const kind = owner.kind ?? 'compound';
    let counter = counters.get(kind);
    if (counter === undefined) {
      counter = { next: start, pinned: pinnedOf(input.referents, kind, pins) };
      counters.set(kind, counter);
    }
    numbers.set(owner.key, pins[owner.key] ?? take(counter));
  }
  const series = new Map<string, ReferentSeries>();
  for (const one of input.series) {
    if (!series.has(one.key)) series.set(one.key, one);
  }

  function letterOf(owner: FigureReferent, row: string): string | undefined {
    const rows = series.get(owner.series ?? '')?.rows;
    const index = rows?.findIndex((candidate) => candidate.id === row) ?? -1;
    return index === -1 ? undefined : seriesLetter(index);
  }

  return {
    label: (mention) => {
      const owner = identity.owner(mention);
      const number = owner && numbers.get(owner.key);
      if (owner === undefined || number === undefined) return MISSING_LABEL;
      const row = mention.row ?? identity.memberRow(mention.key);
      if (row === undefined) return `${prefix}${number}`;
      const letter = letterOf(owner, row);
      return letter === undefined
        ? MISSING_LABEL
        : `${prefix}${number}${letter}`;
    },
    numberOf: (key) => {
      const owner = identity.owner({ key });
      return owner && numbers.get(owner.key);
    },
  };
}

interface Counter {
  next: number;
  pinned: ReadonlySet<number>;
}

function take(counter: Counter): number {
  while (counter.pinned.has(counter.next)) counter.next++;
  return counter.next++;
}

function pinnedOf(
  referents: readonly FigureReferent[],
  kind: string,
  pins: Readonly<Record<string, number>>,
): Set<number> {
  const pinned = new Set<number>();
  for (const referent of referents) {
    const pin = pins[referent.key];
    if (pin !== undefined && (referent.kind ?? 'compound') === kind) {
      pinned.add(pin);
    }
  }
  return pinned;
}

interface Identity {
  /** The referent that carries the number of what a mention names. */
  owner: (mention: ReferentMention) => FigureReferent | undefined;
  /** The row a referent drawn in full is a member of, when it is one. */
  memberRow: (key: string) => string | undefined;
}

function identify(referents: readonly FigureReferent[]): Identity {
  const byKey = new Map<string, FigureReferent>();
  const byStructure = new Map<string, FigureReferent>();
  const members = new Map<string, { owner: FigureReferent; row: string }>();
  for (const referent of referents) {
    if (byKey.has(referent.key)) continue;
    const same =
      referent.idCode === undefined
        ? undefined
        : byStructure.get(referent.idCode);
    byKey.set(referent.key, same ?? referent);
    if (same === undefined && referent.idCode !== undefined) {
      byStructure.set(referent.idCode, referent);
    }
    for (const member of referent.members ?? []) {
      if (member.idCode !== undefined && !members.has(member.idCode)) {
        members.set(member.idCode, {
          owner: same ?? referent,
          row: member.row,
        });
      }
    }
  }
  const memberOf = (key: string) => {
    const idCode = byKey.get(key)?.idCode;
    return idCode === undefined ? undefined : members.get(idCode);
  };
  return {
    owner: ({ key }) => memberOf(key)?.owner ?? byKey.get(key),
    memberRow: (key) => memberOf(key)?.row,
  };
}
