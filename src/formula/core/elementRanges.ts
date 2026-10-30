/** One element a formula search may use, and how many of its atoms. */
export interface ElementRange {
  /** The element symbol: `C`, `Cl`. */
  readonly element: string;
  /** Fewest atoms of it a formula carries. */
  readonly min: number;
  /** Most atoms of it a formula carries; `0` leaves the element out. */
  readonly max: number;
}

/**
 * The elements a formula lookup offers, with the range it opens on. Carbon and
 * hydrogen are wide because every organic molecule holds both, and the
 * heteroatoms open wide enough that a molecule carrying four of one of them is
 * listed without the reader having to suspect it first.
 */
export const DEFAULT_ELEMENT_RANGES: readonly ElementRange[] = [
  { element: 'C', min: 1, max: 30 },
  { element: 'H', min: 1, max: 30 },
  { element: 'O', min: 0, max: 6 },
  { element: 'N', min: 0, max: 4 },
  { element: 'S', min: 0, max: 4 },
  { element: 'F', min: 0, max: 4 },
  { element: 'Cl', min: 0, max: 4 },
  { element: 'Br', min: 0, max: 4 },
];

/**
 * The ranges as `mf-finder` reads them: `C1-30 H1-30 O0-6`. An element whose
 * upper bound is zero is left out rather than written `F0-0`, and a bound below
 * zero or past the other one is brought back inside it.
 * @param ranges - The element ranges.
 * @returns The range string, empty when no element is left.
 */
export function formatElementRanges(ranges: readonly ElementRange[]): string {
  const parts: string[] = [];
  for (const range of ranges) {
    const max = Math.max(0, Math.trunc(range.max));
    if (max === 0) continue;
    const min = Math.min(Math.max(0, Math.trunc(range.min)), max);
    parts.push(`${range.element}${min}-${max}`);
  }
  return parts.join(' ');
}
