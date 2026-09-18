import type { ReactNode } from 'react';

import type { ViewerCapability } from '../../orbital/ui/capability.ts';
import type { Molecule3DCamera } from '../core/camera.ts';
import type { Measurement } from '../core/measurement.ts';
import type {
  Molecule3DFile,
  Molecule3DSettings,
  Molecule3DTools,
} from '../core/settings.ts';

/**
 * Props of `MoleculeViewer3D`.
 *
 * Settings, spin and measurements are each either owned by the site — pass
 * the value and its `on…Change` — or left to the component, which then starts
 * from the `default…` value.
 */
export interface MoleculeViewer3DProps {
  /** The molecule to draw, with 3D coordinates, or `null` for none. */
  molfile: Molecule3DFile | null;
  /**
   * How the camera meets a new molecule. `keep` glides to it along the current
   * direction, which suits conformers of one molecule; `front` jumps to it
   * looking down -z with y up, so unrelated molecules, each laid out in its
   * file the way it reads best, never swing in from the previous view.
   * @default 'keep'
   */
  frameNewMolecule?: 'keep' | 'front';
  /**
   * Which buttons the toolbar over the canvas shows; tools not named stay on.
   * @default every tool
   */
  tools?: Partial<Molecule3DTools>;
  /**
   * How the model is drawn, when the site owns it.
   * @default undefined
   */
  settings?: Molecule3DSettings;
  /**
   * Starting settings when the component owns them.
   * @default DEFAULT_MOLECULE_3D_SETTINGS
   */
  defaultSettings?: Partial<Molecule3DSettings>;
  /**
   * Called with the new settings after any change from the toolbar.
   * @default undefined
   */
  onSettingsChange?: (settings: Molecule3DSettings) => void;
  /**
   * Whether the model turns on its own, when the site owns it.
   * @default undefined
   */
  spinning?: boolean;
  /**
   * Starting spin when the component owns it.
   * @default false
   */
  defaultSpinning?: boolean;
  /**
   * Called when the spin toggle is pressed.
   * @default undefined
   */
  onSpinningChange?: (spinning: boolean) => void;
  /**
   * Turn rate, in molstar's own spin unit.
   * @default 1 / 3
   */
  spinSpeed?: number;
  /**
   * The measurements drawn over the model, when the site owns them. They name
   * atoms by position, so they carry over to another conformer of the same
   * molecule; a site showing an unrelated molecule should clear them.
   * @default undefined
   */
  measurements?: readonly Measurement[];
  /**
   * Called with the whole list after a measurement is added or cleared.
   * @default undefined
   */
  onMeasurementsChange?: (measurements: readonly Measurement[]) => void;
  /**
   * Where the camera stands when the first molecule is framed — what a shared
   * link carries. The camera belongs to whoever is dragging it afterwards, so
   * this is read once and a later change is ignored; the viewer reports every
   * move through `onCameraChange` instead.
   * @default null — the molecule is framed as `frameNewMolecule` says
   */
  initialCamera?: Molecule3DCamera | null;
  /**
   * Called once the camera has come to rest, with where it stands. Not called
   * while the model is spinning: a spinning camera has no orientation to keep.
   * @default undefined
   */
  onCameraChange?: (camera: Molecule3DCamera) => void;
  /**
   * How long the camera must be still before `onCameraChange` is called,
   * milliseconds, so one drag is one report rather than one per frame.
   * @default 400
   */
  cameraSettleDelay?: number;
  /**
   * Name of an exported image, without its extension.
   * @default 'molecule'
   */
  fileName?: string;
  /**
   * Scene background, as `#rrggbb`.
   * @default '#ffffff'
   */
  background?: string;
  /**
   * Smallest height of the canvas, pixels.
   * @default 320
   */
  minHeight?: number;
  /**
   * What to show while molstar is downloading.
   * @default 'Loading the 3D viewer…'
   */
  fallback?: ReactNode;
  /**
   * What to show when the machine cannot render at all.
   * @default undefined — `capability.message` is written
   */
  renderUnsupported?: (capability: ViewerCapability) => ReactNode;
}
