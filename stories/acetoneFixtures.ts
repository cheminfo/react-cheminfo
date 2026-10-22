import type { Molecule3DHighlight } from '../src/molecule3d/core/highlight.ts';
import type { AtomReference } from '../src/molecule3d/core/measurement.ts';

/**
 * One acetone conformer, as OpenChemLib's conformer generator wrote it and
 * MMFF94s+ minimised it: C1, the carbonyl C2 and its O3, the other methyl C4,
 * then the hydrogens H5–H7 on C1 and H8–H10 on C4.
 */
export const ACETONE = `acetone
OCL MolfileCreator  3D

 10  9  0  0  0  0  0  0  0  0999 V2000
    3.2536   -1.3365    2.4418 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.0458   -0.7612    1.7529 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.7765   -1.0376    0.5849 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.1837    0.1689    2.5629 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7939   -1.9918    1.7529 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.9178   -0.5268    2.7536 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.9368   -1.9203    3.3096 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.3443    0.5172    1.9547 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.7925   -0.3607    3.4350 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.7735    1.0328    2.8790 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  2  0  0  0  0
  2  4  1  0  0  0  0
  1  5  1  0  0  0  0
  1  6  1  0  0  0  0
  1  7  1  0  0  0  0
  4  8  1  0  0  0  0
  4  9  1  0  0  0  0
  4 10  1  0  0  0  0
M  END
`;

/** One row of a geometry card: what it says, and the atoms it stands for. */
export interface GeometryRow {
  /** The row, as the card writes it. */
  label: string;
  /** Its bonds, angles or dihedrals, atoms by their place in the molfile. */
  highlights: readonly Molecule3DHighlight[];
}

/**
 * The geometry of {@link ACETONE} by kind, as a 3D answer card lists it, after
 * a row that highlights nothing and before one naming the two methyl carbons
 * alone, as a question about atoms would.
 */
export const ACETONE_GEOMETRY: readonly GeometryRow[] = [
  { label: 'None', highlights: [] },
  { label: 'C–C 1.505 Å ×2', highlights: paths([0, 1], [1, 3]) },
  { label: 'C=O 1.230 Å', highlights: paths([1, 2]) },
  {
    label: 'C–H 1.093 Å ×6',
    highlights: paths([0, 4], [0, 5], [0, 6], [3, 7], [3, 8], [3, 9]),
  },
  { label: 'C–C–C 116.7°', highlights: paths([0, 1, 3]) },
  { label: 'C–C=O 121.6° ×2', highlights: paths([0, 1, 2], [3, 1, 2]) },
  { label: 'C1 and C4', highlights: paths([0], [3]) },
];

function paths(
  ...elements: ReadonlyArray<readonly number[]>
): Molecule3DHighlight[] {
  const highlights: Molecule3DHighlight[] = [];
  for (const path of elements) {
    const atoms: AtomReference[] = [];
    for (const element of path) atoms.push({ unit: 0, element });
    highlights.push({ atoms });
  }
  return highlights;
}
