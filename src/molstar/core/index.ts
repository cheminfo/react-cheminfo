/**
 * The molstar layer under the 3D views: the plugin lifecycle, the camera, the
 * hover labels, the measurements and the picture of a scene.
 *
 * Three of our sites mount a headless molstar canvas — the molecule viewer
 * here, lcao's orbitals and symmetry's crystals — and each of them had its own
 * copy of the lifecycle, the spec and the spin. This is that one copy; what
 * stays in a site is the scene it draws.
 *
 * **Importing this pulls molstar in statically**, which is why it is reached
 * through the `./molstar/*` pattern rather than a plain subpath: molstar is an
 * optional peer, so a plain subpath would be one the package test imports —
 * in a project that installs no optional peer — and it cannot succeed there.
 * A site that only wants `<MoleculeViewer3D>` imports `react-cheminfo/molecule3d`,
 * whose canvas is lazy and whose barrel stays molstar-free.
 */

export type { CameraPose, CameraReference, PoseOptions } from './cameraPose.ts';
export { cameraToPose, poseToCamera } from './cameraPose.ts';
export {
  DEFAULT_CAMERA_DURATION,
  DEFAULT_SPIN_SPEED,
  FRAMING_MARGIN,
  MINIMUM_FRAMING_RADIUS,
  framedRadius,
  setSpin,
} from './camera.ts';
export { atomName, atomText, lociText, subscribeHover } from './hover.ts';
export type { MolstarPluginOptions } from './plugin.ts';
export { MolstarPlugin } from './plugin.ts';
export { captureScene } from './captureScene.ts';
export type { MoleculeStructureSource } from './measurements.ts';
export {
  MeasurementPicker,
  atomReferenceOf,
  clearMeasurements,
  renderMeasurements,
} from './measurements.ts';
