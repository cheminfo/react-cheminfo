/**
 * What a highlight on a 3D molecule is, without React and without molstar: a
 * bonded path of atoms a site points at — the two atoms of a bond, the three of
 * an angle, the four of a dihedral — for the model to emphasise.
 *
 * Atoms are named by position, as measurements name them, so a row of a table
 * read off one conformer lands on the same atoms of every other conformer of
 * the same molecule.
 */

import type { AtomReference } from './measurement.ts';
import { sameAtoms } from './measurement.ts';

/** One bonded path of atoms to emphasise on the model. */
export interface Molecule3DHighlight {
  /**
   * The atoms in the order they are bonded: two for a bond, three for the two
   * bonds of an angle, four for the three bonds of a dihedral. One atom
   * emphasises that atom alone.
   */
  atoms: readonly AtomReference[];
}

/** Two consecutive atoms of a path: the bond a highlight emphasises. */
export type HighlightedBond = readonly [AtomReference, AtomReference];

/** Everything a list of highlights emphasises, each atom and bond once. */
export interface HighlightedParts {
  /** Every atom of every path, in the order the paths first name them. */
  atoms: readonly AtomReference[];
  /** Every pair of consecutive atoms, in the order the paths first name them. */
  bonds: readonly HighlightedBond[];
}

/**
 * The atoms and the bonds a list of highlights emphasises.
 *
 * A bond is a pair of consecutive atoms of one path, and nothing else: two
 * atoms that are both highlighted, but by different paths or not next to each
 * other in one, are not a bond of the highlight — so six C–H paths never
 * emphasise the C–C bond between two of their carbons. An atom the structure
 * lacks is left out, with the two pairs it stands in; the atoms on either side
 * of it are not joined in its place.
 * @param highlights - The paths, as a site passes them.
 * @param hasAtom - Whether the structure on screen has an atom; asked only of
 * references whose two numbers are whole and not negative.
 * @default () => true
 * @returns The atoms and the bonds, each once, in the order first named.
 */
export function highlightedParts(
  highlights: readonly Molecule3DHighlight[],
  hasAtom: (atom: AtomReference) => boolean = isAnyAtom,
): HighlightedParts {
  const atoms: AtomReference[] = [];
  const bonds: HighlightedBond[] = [];
  const atomKeys = new Set<string>();
  const bondKeys = new Set<string>();
  for (const highlight of highlights) {
    let previous: AtomReference | undefined;
    for (const atom of highlight.atoms) {
      const present = isAtomReference(atom) && hasAtom(atom);
      if (present && !atomKeys.has(atomKey(atom))) {
        atomKeys.add(atomKey(atom));
        atoms.push({ unit: atom.unit, element: atom.element });
      }
      if (present && previous !== undefined) {
        const key = bondKey(previous, atom);
        if (key !== null && !bondKeys.has(key)) {
          bondKeys.add(key);
          bonds.push([
            { unit: previous.unit, element: previous.element },
            { unit: atom.unit, element: atom.element },
          ]);
        }
      }
      previous = present ? atom : undefined;
    }
  }
  return { atoms, bonds };
}

/**
 * Whether two lists of highlights name the same atoms, in the same paths and
 * the same order — what decides that the model needs no repainting.
 * @param first - One list.
 * @param second - The other.
 * @returns True when every path of one is the path of the other at its place.
 */
export function sameHighlights(
  first: readonly Molecule3DHighlight[],
  second: readonly Molecule3DHighlight[],
): boolean {
  if (first === second) return true;
  if (first.length !== second.length) return false;
  for (let index = 0; index < first.length; index++) {
    const one = first[index]?.atoms;
    const other = second[index]?.atoms;
    if (one === undefined || other === undefined) return false;
    if (!sameAtoms(one, other)) return false;
  }
  return true;
}

function isAnyAtom(): boolean {
  return true;
}

function isAtomReference(atom: AtomReference): boolean {
  return (
    Number.isInteger(atom.unit) &&
    atom.unit >= 0 &&
    Number.isInteger(atom.element) &&
    atom.element >= 0
  );
}

function atomKey(atom: AtomReference): string {
  return `${atom.unit}:${atom.element}`;
}

// One key for a pair whichever way round, and none for an atom with itself.
function bondKey(first: AtomReference, second: AtomReference): string | null {
  const one = atomKey(first);
  const other = atomKey(second);
  if (one === other) return null;
  return one < other ? `${one}-${other}` : `${other}-${one}`;
}
