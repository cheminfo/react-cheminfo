/** A molecule of a `molecules` slide, and the name written under it. */
export interface NamedMolecule {
  /** What is written under the structure; `''` for nothing. */
  label: string;
  /** The structure. */
  smiles: string;
}

/** How many structures one slide draws. */
export const MAXIMUM_MOLECULES = 6;

/** How a number of structures is laid out. */
export interface MoleculeGridShape {
  /** Structures side by side. */
  columns: number;
  /** Rows of them. */
  rows: number;
}

/**
 * Read the marker of a `molecules` slide: one molecule per line, the SMILES the
 * last word of the line and the words before it its name.
 *
 * ```
 * <!-- molecules:
 * Aspirin CC(=O)Oc1ccccc1C(=O)O
 * Caffeine Cn1cnc2c1c(=O)n(C)c(=O)n2C
 * -->
 * ```
 * @param value - What the marker says; `undefined` when the slide has none.
 * @returns The molecules, at most {@link MAXIMUM_MOLECULES}; blank lines are
 *   skipped and the lines past the sixth left out.
 */
export function parseMoleculeList(value: string | undefined): NamedMolecule[] {
  const molecules: NamedMolecule[] = [];
  for (const line of (value ?? '').split('\n')) {
    const words = line.trim().split(/\s+/);
    const smiles = words.pop() ?? '';
    if (smiles === '') continue;
    molecules.push({ label: words.join(' '), smiles });
    if (molecules.length === MAXIMUM_MOLECULES) break;
  }
  return molecules;
}

/**
 * Lay a number of structures out on the figure: one alone takes all of it, up
 * to three stand in a row, four make a square and five or six two rows of
 * three.
 * @param count - How many structures.
 * @returns The columns and rows.
 */
export function moleculeGridShape(count: number): MoleculeGridShape {
  if (count <= 3) return { columns: Math.max(1, count), rows: 1 };
  if (count === 4) return { columns: 2, rows: 2 };
  return { columns: 3, rows: 2 };
}
