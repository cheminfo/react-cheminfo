import { parseMol } from 'molstar/lib/mol-io/reader/mol/parser.js';
import { Structure } from 'molstar/lib/mol-model/structure.js';
import { trajectoryFromMol } from 'molstar/lib/mol-model-formats/structure/mol.js';
import { Task } from 'molstar/lib/mol-task/index.js';

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

/**
 * The conformer as molstar reads it, the way the viewer loads a molfile.
 * @returns Its structure: one unit, the atoms in the file's order.
 */
export async function acetoneStructure(): Promise<Structure> {
  const parsed = await parseMol(ACETONE).run();
  if (parsed.isError) throw new Error(parsed.message);
  const trajectory = await trajectoryFromMol(parsed.result).run();
  const model = await Task.resolveInContext(trajectory.getFrameAtIndex(0));
  return Structure.ofModel(model);
}
