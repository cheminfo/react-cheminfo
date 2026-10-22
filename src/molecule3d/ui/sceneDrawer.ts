/**
 * What one canvas shows, what it is asked to show next, and the least work
 * between the two.
 *
 * The measurements are drawn over the model, not into it: a change of them
 * alone replaces their own representations and leaves the model, its surface,
 * its highlights and the camera as they are. Only another molecule, or another
 * style for it, draws the scene again, and only another molecule frames the
 * camera. Draws run one after another, so a measurement never lands on a model
 * that is half built, and the last request asked is the one drawn.
 */

import type { Molecule3DCamera } from '../core/camera.ts';
import type { Measurement } from '../core/measurement.ts';
import { sameMeasurements } from '../core/measurement.ts';
import type { Molecule3DFile, Molecule3DSettings } from '../core/settings.ts';
import { sameMolecule3DSettings } from '../core/settings.ts';

import type { SceneViewer } from './drawScene.ts';
import { drawScene } from './drawScene.ts';

/** What the canvas is asked to show. */
export interface SceneRequest {
  /** What to draw, or `null` to empty the scene. */
  molfile: Molecule3DFile | null;
  /** How the model is drawn. */
  settings: Molecule3DSettings;
  /** What is drawn over it. */
  measurements: readonly Measurement[];
  /** How the camera meets a molecule it has not shown before. */
  frameNewMolecule: 'front' | 'keep';
}

/** Keeps one viewer showing the last scene it was asked for. */
export class SceneDrawer {
  /** The viewer drawn on. */
  readonly viewer: SceneViewer;
  readonly #takeLinkedCamera: () => Molecule3DCamera | null;
  #asked: SceneRequest | null = null;
  // The model on screen, or `null` when the next request must draw it again.
  #drawn: Pick<SceneRequest, 'molfile' | 'settings'> | null = null;
  // The measurements on screen, or `null` when the next request must draw them.
  #measured: readonly Measurement[] | null = [];
  // The molecule the camera was last framed on, so another one is told apart.
  #framed: Molecule3DFile | null = null;
  #queue: Promise<void> = Promise.resolve();

  /**
   * Start drawing on `viewer`, whose scene is empty.
   * @param viewer - The viewer to draw on.
   * @param takeLinkedCamera - Asked when a molecule is new: a camera to stand
   * at instead of framing it, or `null`.
   */
  constructor(
    viewer: SceneViewer,
    takeLinkedCamera: () => Molecule3DCamera | null,
  ) {
    this.viewer = viewer;
    this.#takeLinkedCamera = takeLinkedCamera;
  }

  /**
   * Bring the canvas to `request`, once whatever was asked before is drawn.
   * @param request - The scene to show; replaces any request still waiting.
   * @returns Nothing; resolves once the canvas shows the last request asked,
   * and rejects with what stopped it from being drawn.
   */
  draw(request: SceneRequest): Promise<void> {
    this.#asked = request;
    const drawn = this.#queue.then(() => this.#catchUp());
    this.#queue = drawn.catch(ignore);
    return drawn;
  }

  async #catchUp(): Promise<void> {
    const request = this.#asked;
    if (request === null) return;
    const drawn = this.#drawn;
    if (
      drawn !== null &&
      sameFile(drawn.molfile, request.molfile) &&
      sameMolecule3DSettings(drawn.settings, request.settings)
    ) {
      await this.#measure(request);
      return;
    }
    await this.#redraw(request);
  }

  // The model stays: only the measurements over it can have changed.
  async #measure(request: SceneRequest): Promise<void> {
    const { molfile, measurements } = request;
    const measured = this.#measured;
    if (measured !== null && sameMeasurements(measured, measurements)) return;
    // As for the model: a list that fails partway is drawn again next time.
    this.#measured = null;
    // An empty scene has nothing to measure; the list waits for a molecule.
    if (molfile !== null) await this.viewer.showMeasurements(measurements);
    this.#measured = measurements;
  }

  async #redraw(request: SceneRequest): Promise<void> {
    const { molfile, settings, measurements, frameNewMolecule } = request;
    const isNew =
      molfile !== null &&
      (this.#framed === null || !sameFile(this.#framed, molfile));
    this.#framed = molfile;
    // A link's camera is spent on the first molecule framed; afterwards the
    // camera is the reader's and a new molecule is framed as usual.
    const linked = isNew ? this.#takeLinkedCamera() : null;
    const frameCamera = isNew && linked === null ? frameNewMolecule : 'none';
    // Kept only once drawn: a draw that fails is drawn again by the next
    // request, whatever that one changes.
    this.#drawn = null;
    await drawScene(this.viewer, molfile, settings, measurements, frameCamera);
    this.#drawn = { molfile, settings };
    this.#measured = measurements;
    if (linked !== null) await this.viewer.setCamera(linked);
  }
}

function sameFile(
  first: Molecule3DFile | null,
  second: Molecule3DFile | null,
): boolean {
  if (first === null || second === null) return first === second;
  return first.format === second.format && first.data === second.data;
}

function ignore(): void {
  // A failure reached the caller of `draw`; the next draw still runs.
}
