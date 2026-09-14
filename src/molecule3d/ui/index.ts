/**
 * What a site imports to show a molecule in 3D.
 *
 * **Nothing exported here may pull molstar in statically.** The canvas and the
 * viewer class are deliberately absent: re-exporting either would defeat the
 * `React.lazy` boundary inside `MoleculeViewer3D`. Type-only re-exports are
 * erased and so are safe.
 */

export { MoleculeViewer3D } from './MoleculeViewer3D.tsx';
export type { MoleculeViewer3DProps } from './moleculeViewer3DProps.ts';
