/**
 * The published core-level binding energies, sorted once so they can be
 * searched.
 *
 * `xps-analysis` ships the table in the order it was typed in — by orbital and
 * then by element — the order it is read in a book, and the worst possible one
 * for the question actually asked of it: *what sits at 284 eV*. Sorting it
 * by energy turns that question into a binary search, and doing so at module
 * load rather than per lookup is what keeps a survey scan of two hundred peaks
 * from walking two thousand rows two hundred times on every re-render.
 *
 * The table is a starting point and not an answer. It carries one energy per
 * level, while a real C 1s runs from 284.4 eV in graphite to 289 eV in a
 * carbonate, so a match here is a candidate the reader judges — which is why
 * the window it is searched in is a setting rather than a constant.
 */

import { references } from 'xps-analysis';

/** One published core level. */
export interface ReferenceLevel {
  /** Element symbol. */
  element: string;
  /** The core level, as a chemist writes it: `1s`, `2p3/2`. */
  orbital: string;
  /** Where the level sits, in eV of binding energy. */
  bindingEnergy: number;
}

/** Every published core level, by ascending binding energy. */
export const referenceLevels: readonly ReferenceLevel[] = sortByEnergy();

/**
 * The same energies alone, as the ascending axis a lookup searches.
 *
 * Parallel to `referenceLevels` and the same length: index `i` of one is index
 * `i` of the other, which is what lets the search run over a typed array and
 * still hand back the element it landed on.
 */
export const referenceEnergies: Float64Array = energyAxis(referenceLevels);

/**
 * Every element symbol the table knows.
 *
 * Used wherever a token has to be judged to be an element or not — the leading
 * word of a fitted component's label is the usual one — because a shape test
 * for a capital and an optional lower-case letter accepts `Xy` as readily as
 * `Mo`.
 */
export const referenceElements: ReadonlySet<string> =
  elementSymbols(referenceLevels);

/**
 * The table as this package holds it, by ascending binding energy.
 *
 * Each level appears once. The published array carries almost every row twice —
 * it is one table concatenated with itself — and a candidate list drawn from it
 * unfiltered offers the same level as its own second-best answer.
 * @returns The distinct levels, sorted, with `be` renamed to what it means.
 */
function sortByEnergy(): ReferenceLevel[] {
  const levels: ReferenceLevel[] = [];
  const seen = new Set<string>();
  for (const row of references) {
    const key = `${row.element} ${row.orbital} ${row.be}`;
    if (seen.has(key)) continue;
    seen.add(key);
    levels.push({
      element: row.element,
      orbital: row.orbital,
      bindingEnergy: row.be,
    });
  }
  return levels.toSorted(
    (left, right) => left.bindingEnergy - right.bindingEnergy,
  );
}

/**
 * The energies of a sorted table, as an axis.
 * @param levels - The levels, by ascending binding energy.
 * @returns Their energies, in the same order.
 */
function energyAxis(levels: readonly ReferenceLevel[]): Float64Array {
  const energies = new Float64Array(levels.length);
  for (let index = 0; index < levels.length; index++) {
    energies[index] = (levels[index] as ReferenceLevel).bindingEnergy;
  }
  return energies;
}

/**
 * The distinct elements of a table.
 * @param levels - The levels.
 * @returns Their element symbols.
 */
function elementSymbols(levels: readonly ReferenceLevel[]): Set<string> {
  const symbols = new Set<string>();
  for (const level of levels) symbols.add(level.element);
  return symbols;
}
