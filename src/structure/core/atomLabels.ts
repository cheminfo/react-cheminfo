/**
 * Text written on a depiction next to, or in place of, an atom's symbol.
 *
 * openchemlib stores such text as a custom atom label, and reads a label that
 * begins with `]` as "draw this above the atom" rather than "draw this instead
 * of it". That one character is the whole difference between numbering a
 * structure and relabelling its atoms, which is why it is written here once.
 */

/**
 * Where a label goes: beside the element symbol, as a small superscript, or in
 * place of it.
 */
export type AtomLabelPlacement = 'beside' | 'instead';

/** The two methods of an openchemlib `Molecule` a label is written through. */
export interface LabelledMolecule {
  /** How many atoms the molecule holds, hydrogens included. */
  getAllAtoms(): number;
  /** Replace the custom label of one atom; `null` removes it. */
  setAtomCustomLabel(atom: number, label: string | null): unknown;
}

/**
 * The custom label openchemlib draws where it is asked to.
 * @param text - What is written, without any marker.
 * @param placement - Beside the symbol or instead of it.
 * @returns The label to store on the atom.
 */
export function customAtomLabel(
  text: string,
  placement: AtomLabelPlacement = 'beside',
): string {
  return placement === 'beside' ? `]${text}` : text;
}

/**
 * Write labels onto the atoms of a molecule.
 *
 * The molecule is changed in place, so a caller holding a structure other
 * code also reads passes a copy (`getCompactCopy()`). An empty text, and an
 * index the molecule has no atom at, are skipped.
 * @param molecule - The molecule to label.
 * @param labels - What to write, keyed by atom index as openchemlib counts
 * atoms, from 0.
 * @param placement - Beside the symbols or instead of them.
 * @returns How many labels were written.
 */
export function applyAtomLabels(
  molecule: LabelledMolecule,
  labels: ReadonlyMap<number, string>,
  placement: AtomLabelPlacement = 'beside',
): number {
  const atomCount = molecule.getAllAtoms();
  let written = 0;
  for (const [atom, text] of labels) {
    if (text === '' || !Number.isInteger(atom)) continue;
    if (atom < 0 || atom >= atomCount) continue;
    molecule.setAtomCustomLabel(atom, customAtomLabel(text, placement));
    written++;
  }
  return written;
}
