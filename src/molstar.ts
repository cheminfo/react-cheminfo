/**
 * The molstar layer under the 3D views: the plugin lifecycle, the camera, the
 * hover labels, the measurements and the picture of a scene.
 *
 * Three of our sites mount a headless molstar canvas — the molecule viewer
 * here, lcao's orbitals and symmetry's crystals — and each of them had its own
 * copy of the lifecycle, the spec and the spin. This is that one copy; what
 * stays in a site is the scene it draws.
 *
 * **Importing this pulls molstar in statically.** A site that only wants
 * `<MoleculeViewer3D>` imports `react-cheminfo/molecule3d`, whose canvas is
 * lazy.
 */

export * from './molstar/core/index.ts';
export { captureScene } from './molecule3d/ui/captureScene.ts';
export type { MoleculeStructureSource } from './molecule3d/ui/measurements.ts';
export {
  atomReferenceOf,
  clearMeasurements,
  renderMeasurements,
} from './molecule3d/ui/measurements.ts';
