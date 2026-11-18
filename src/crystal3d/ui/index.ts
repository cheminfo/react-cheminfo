/**
 * What a page imports to show a crystal in 3D.
 *
 * **Nothing exported here may pull molstar in statically.** The canvas, the
 * viewer class and the bond rule are reached through `React.lazy` only;
 * type-only re-exports are erased and so are safe.
 */

export type {
  CrystalScene,
  CrystalViewHandle,
  OperationPlayback,
} from './crystalScene.ts';
export type { CrystalStructureViewerProps } from './crystalStructureViewerProps.ts';
export { CrystalStructureViewer } from './CrystalStructureViewer.tsx';
export type { CrystalViewControlsProps } from './CrystalViewControls.tsx';
export { CrystalViewControls } from './CrystalViewControls.tsx';
export type { CrystalViewer3DProps } from './CrystalViewer3D.tsx';
export { CrystalViewer3D } from './CrystalViewer3D.tsx';
export { useCrystalCaption } from './useCrystalCaption.ts';
