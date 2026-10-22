import type { Molecule3DCamera } from '../../core/camera.ts';
import type { Measurement } from '../../core/measurement.ts';
import type { SceneViewer } from '../drawScene.ts';
import type { SceneRequest } from '../sceneDrawer.ts';
import { SceneDrawer } from '../sceneDrawer.ts';

/** How the stand-in viewer behaves. */
export interface StandInOptions {
  /**
   * Settled before the model counts as drawn.
   * @default undefined — drawn at once
   */
  modelDrawn?: Promise<void>;
  /**
   * How many models, from the first, fail to draw.
   * @default 0
   */
  modelFailures?: number;
  /**
   * What a link asks the first molecule to be seen from.
   * @default () => null
   */
  takeLinkedCamera?: () => Molecule3DCamera | null;
}

/**
 * A drawer over a viewer that writes down what it is asked, in order: the
 * model and its style, the surface, the measurements and the camera moves.
 * @param options - See {@link StandInOptions}.
 * @returns The drawer, the calls its viewer received, and `fail`, whose
 * `measurements` count makes that many measurement draws fail from now on.
 */
export function standIn(options: StandInOptions = {}) {
  const { modelDrawn, modelFailures = 0, takeLinkedCamera } = options;
  let failures = modelFailures;
  const fail = { measurements: 0 };
  const calls: string[] = [];
  const viewer: SceneViewer = {
    showMolecule: async (molfile, style) => {
      calls.push(`model ${molfile.data} ${style?.representation}`);
      await modelDrawn;
      if (failures-- > 0) throw new Error('no atoms');
    },
    hideMolecule: async () => {
      calls.push('empty');
    },
    showSurface: async () => {
      calls.push('surface');
    },
    showMeasurements: async (measurements) => {
      calls.push(`measurements ${measurementsText(measurements)}`);
      if (fail.measurements > 0) {
        fail.measurements--;
        throw new Error('no label');
      }
    },
    resetCamera: async (_duration, fromFront) => {
      calls.push(fromFront ? 'frame from the front' : 'frame');
    },
    setCamera: async () => {
      calls.push('linked camera');
    },
  };
  const drawer = new SceneDrawer(viewer, takeLinkedCamera ?? noCamera);
  return { drawer, calls, fail };
}

/**
 * A stand-in that has drawn `request` already, its calls forgotten.
 * @param request - What it shows.
 * @returns The drawer, and the calls its viewer receives from now on.
 */
export async function drawnStandIn(request: SceneRequest) {
  const drawn = standIn();
  await drawn.drawer.draw(request);
  drawn.calls.length = 0;
  return drawn;
}

/**
 * A promise the test settles when it chooses.
 * @returns The promise, and what settles it.
 */
export function gate(): { opened: Promise<void>; open: () => void } {
  const waiting: Array<() => void> = [];
  const opened = new Promise<void>((resolve) => {
    waiting.push(resolve);
  });
  return {
    opened,
    open: () => {
      for (const resolve of waiting) resolve();
    },
  };
}

/**
 * Wait for every promise already settled to have run its callbacks.
 * @returns Nothing; resolves on the next task.
 */
export function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function measurementsText(measurements: readonly Measurement[]): string {
  if (measurements.length === 0) return 'none';
  return measurements
    .map(({ kind, atoms }) => {
      return `${kind} ${atoms.map((atom) => atom.element).join('-')}`;
    })
    .join(', ');
}

function noCamera(): null {
  return null;
}
