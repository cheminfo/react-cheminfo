/**
 * Where a query fragment sits in a molecule, as the atoms and bonds to paint.
 *
 * **Not exported from `core/index.ts`**: it value-imports `openchemlib`, so a
 * barrel carrying it would pull the whole library into every site that imports
 * `react-cheminfo/core`. Only the lazily loaded depiction calls it.
 */

import { Molecule, SSSearcher } from 'openchemlib';

import { isEmptyIdCode, splitIdCode } from './editorValue.ts';

/** The atoms and bonds of a molecule that a query covers. */
export interface SubstructureMatch {
  /** Atom indices, ascending, as openchemlib counts atoms from 0. */
  atoms: number[];
  /** Bond indices, ascending, as openchemlib counts bonds from 0. */
  bonds: number[];
}

/**
 * Find every match of a query in a molecule, merged into one set of atoms and
 * bonds.
 *
 * Every match is painted, not only the first: a query for a phenyl ring that a
 * molecule carries twice is shown twice. A bond is painted only when it is a
 * bond of the query, so a ring closing between two matched atoms that the
 * query leaves open stays unpainted. The query is read as a fragment whether
 * or not it was drawn as one — a molecule not flagged as a fragment only ever
 * matches itself, which is never what a substructure search asked.
 * @param molecule - The molecule the depiction draws; its atom order is the
 * one the indices refer to.
 * @param query - The query as an openchemlib idCode, coordinates included or
 * not.
 * @returns The covered atoms and bonds, both empty when nothing matches.
 */
export function substructureMatch(
  molecule: Molecule,
  query: string,
): SubstructureMatch {
  if (isEmptyIdCode(query)) return { atoms: [], bonds: [] };
  const fragment = Molecule.fromIDCode(splitIdCode(query).idCode);
  fragment.setFragment(true);

  const searcher = new SSSearcher();
  searcher.setMol(fragment, molecule);
  if (searcher.findFragmentInMolecule({ countMode: 'overlapping' }) === 0) {
    return { atoms: [], bonds: [] };
  }

  const atomCovered = new Uint8Array(molecule.getAllAtoms());
  const bondCovered = new Uint8Array(molecule.getAllBonds());
  const fragmentBonds = fragment.getAllBonds();
  for (const match of searcher.getMatchList()) {
    for (const target of match) {
      // An exclude group of the query maps onto nothing.
      if (target >= 0) atomCovered[target] = 1;
    }
    for (let bond = 0; bond < fragmentBonds; bond++) {
      const first = match[fragment.getBondAtom(0, bond)] ?? -1;
      const second = match[fragment.getBondAtom(1, bond)] ?? -1;
      if (first < 0 || second < 0) continue;
      const target = molecule.getBond(first, second);
      if (target >= 0) bondCovered[target] = 1;
    }
  }

  return {
    atoms: coveredIndices(atomCovered),
    bonds: coveredIndices(bondCovered),
  };
}

/**
 * The positions of a flag array that are set, in ascending order.
 * @param flags - One flag per atom or bond.
 * @returns The indices whose flag is set.
 */
function coveredIndices(flags: Uint8Array): number[] {
  const indices: number[] = [];
  for (let index = 0; index < flags.length; index++) {
    if (flags[index] === 1) indices.push(index);
  }
  return indices;
}
