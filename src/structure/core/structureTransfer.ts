/**
 * What a paste or a drop carried that a structure can be read from — a
 * structure file, or a SMILES, an idCode, a molfile as text: the family's
 * drop transfer (`dropzone/core/dropTransfer.ts`), under the names the
 * structure pages read.
 */

export type {
  DropTransfer as StructureTransfer,
  DropTransferSource as StructureTransferSource,
} from '../../dropzone/core/dropTransfer.ts';
export {
  carriesFilesOrText as carriesStructure,
  readDropTransfer as readStructureTransfer,
} from '../../dropzone/core/dropTransfer.ts';
