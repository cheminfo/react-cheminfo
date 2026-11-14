/**
 * What the molstar canvas of one atomic orbital is told.
 */

import type { Molecule3DCapture } from '../../molecule3d/ui/moleculeViewer3DProps.ts';
import type { ResolutionLimits } from '../core/atomicGrid.ts';
import type { PhasePalette } from '../core/palette.ts';
import type { AtomicSampler } from '../core/sample.ts';

/** Props of `AtomicOrbitalCanvas`. */
export interface AtomicOrbitalCanvasProps {
  /** Proton count of the element on screen. */
  atomicNumber: number;
  /** Which orbital of it, e.g. `3dz2`. */
  orbitalId: string;
  /**
   * Colours the two phases are drawn in.
   * @default PHASE_PALETTES.textbook
   */
  palette?: PhasePalette;
  /**
   * Samples along each edge of the cube; the cost is the cube of it.
   *
   * A number fixes it. A {@link ResolutionLimits} pair lets each orbital's own
   * shape pick a resolution between the two, which is what the orbitals with
   * inner shells packed against the nucleus need.
   * @default 56
   */
  resolution?: number | ResolutionLimits;
  /**
   * Whether the labelled x, y, z frame is drawn through the nucleus when the
   * canvas opens. A `3d_xz` is only `3d_xz` because of where its lobes sit
   * against those axes, and a lone isosurface says nothing about that, so the
   * frame is on unless a site says otherwise.
   *
   * The canvas owns the state from then on: the button in its corner flips it,
   * and {@link AtomicOrbitalCanvasProps.onAxesChange} reports the new value to
   * a site that wants to remember it for the next mount.
   * @default true
   */
  axes?: boolean;
  /**
   * Called when the student flips the frame, with its new state — so a site can
   * persist the choice and pass it back as `axes`.
   * @default undefined
   */
  onAxesChange?: (axes: boolean) => void;
  /**
   * Whether the scene turns on its own when the canvas opens, which is what
   * makes a still screenshot of a 3D shape readable.
   *
   * The canvas owns the state from then on: the button in its corner flips it,
   * and {@link AtomicOrbitalCanvasProps.onSpinningChange} reports the new value
   * to a site that wants to remember it for the next mount.
   * @default false
   */
  spinning?: boolean;
  /**
   * Called when the student flips the spin, with its new state — so a site can
   * persist the choice and pass it back as `spinning`.
   * @default undefined
   */
  onSpinningChange?: (spinning: boolean) => void;
  /**
   * How fast it turns, in molstar's own spin unit. Lower is slower.
   * @default 0.3
   */
  spinSpeed?: number;
  /**
   * How the field is produced. Supply a worker-backed sampler to keep the main
   * thread free; the default runs in process.
   * @default sampleInProcess
   */
  sample?: AtomicSampler;
  /**
   * Called with the radial node radii, ångström, each time an orbital is
   * sampled — so the page can mark them on a radial plot beside the canvas.
   * @default undefined
   */
  onNodeRadii?: (radii: number[]) => void;
  /**
   * Called with the reason when an orbital cannot be drawn, and with `null`
   * once one has been drawn again.
   * @default undefined
   */
  onFailureChange?: (message: string | null) => void;
  /**
   * Called with the means to picture the canvas once it is mounted, and with
   * `null` once it is gone — so a site can hand the orbital on screen to a
   * page that frames it, as the figure draw and write insert.
   * @default undefined
   */
  onCapture?: (capture: Molecule3DCapture | null) => void;
}
