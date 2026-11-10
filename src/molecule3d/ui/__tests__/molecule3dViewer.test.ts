/**
 * What the molecule viewer asks of molstar for everything but drawing the
 * model itself: the clicks it listens to, the camera, the spin, the pictures,
 * an empty scene, and a disposal that stops all of it.
 *
 * molstar's view model needs WebGL to initialise, so it is replaced by one
 * that hands over a context writing down what it is asked; the model and its
 * surface are drawn by the browser suites.
 */

import { StateTransform } from 'molstar/lib/mol-state/index.js';
import { beforeEach, expect, test, vi } from 'vitest';

import { createMolecule3DViewer } from '../createViewer.ts';

const stage = vi.hoisted((): { context: unknown } => ({ context: undefined }));

vi.mock('molstar/lib/extensions/plugin/view-model.js', () => ({
  PluginViewModel: class {
    readonly initialized = Promise.resolve();

    get plugin() {
      return stage.context;
    }

    mount() {
      // The stand-in has no canvas to insert.
    }
  },
}));

let log: string[];
let frameCounts: number[];

beforeEach(() => {
  log = [];
  frameCounts = [];
  stage.context = standInContext();
});

test('a new viewer picks single atoms, and listens for clicks and for its model being drawn', async () => {
  const viewer = mount();
  await viewer.ready;
  await viewer.setMeasureKind('angle');

  expect(log).toStrictEqual([
    'granularity element',
    'listen selection history',
    'listen created',
    'listen updated',
    'selection mode on',
    'deselect all',
  ]);
});

test('the camera is framed and placed once the canvas has committed the scene', async () => {
  const viewer = mount();

  await viewer.resetCamera(0, true);
  await viewer.setCamera({
    rotation: [0, 0, 0, 1],
    zoom: 2,
    offset: [0, 0, 0],
  });

  expect(log.slice(-2)).toStrictEqual([
    'camera reset in 0 ms',
    'camera reset in 0 ms',
  ]);
});

test('the spin turns the model, and stops it', async () => {
  const viewer = mount();

  await viewer.setSpin(true, 2);
  await viewer.setSpin(false);

  expect(log.slice(-2)).toStrictEqual(['animate spin 2', 'animate off']);
});

test('emptying the scene removes the molecule and reports no frames', async () => {
  const viewer = mount();

  await viewer.hideMolecule();

  expect(log.at(-1)).toBe('delete molecule3d-data');
  expect(frameCounts).toStrictEqual([0]);
});

test('with no molecule there is nothing to wrap in a surface, and nothing to measure', async () => {
  const viewer = mount();
  await viewer.ready;
  const before = log.length;

  await expect(viewer.showSurface()).rejects.toThrow(
    'A molecular surface needs a molecule to wrap.',
  );

  await viewer.hideSurface();
  await viewer.showMeasurements([
    {
      kind: 'distance',
      atoms: [
        { unit: 0, element: 0 },
        { unit: 0, element: 1 },
      ],
    },
  ]);

  expect(log.slice(before)).toStrictEqual([]);
});

test('a picture of the scene is taken by the canvas', async () => {
  const viewer = mount();

  await expect(viewer.captureImage({ width: 8, height: 6 })).resolves.toBe(
    'data:image/png;base64,scene',
  );
});

test('the camera is followed until the watch is stopped', async () => {
  const viewer = mount();
  const stop = viewer.watchCamera(() => undefined);
  await viewer.ready;
  await viewer.setSpin(false);
  stop();

  expect(log).toContain('listen camera');
  expect(log.at(-1)).toBe('stop camera');
});

test('a disposed viewer stops listening, releases its canvas, and does nothing more', async () => {
  const viewer = mount();
  await viewer.setMeasureKind(null);
  viewer.handleResize();
  viewer.dispose();

  expect(log.slice(-4)).toStrictEqual([
    'resize',
    'stop selection history',
    'stop created',
    'stop updated',
  ]);

  await expect(viewer.resetCamera()).resolves.toBeUndefined();

  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

  expect(log.at(-1)).toBe('dispose');
});

function mount() {
  return createMolecule3DViewer({} as HTMLElement, {
    onFrameCountChange: (count) => frameCounts.push(count),
  });
}

/**
 * An event of molstar's, which writes down who listens and who stops.
 * @param name - What the log calls it.
 * @returns The event.
 */
function event(name: string) {
  return {
    subscribe() {
      log.push(`listen ${name}`);
      return { unsubscribe: () => log.push(`stop ${name}`) };
    },
  };
}

/**
 * A molstar context holding what the viewer reaches for outside drawing the
 * model: a state tree with a molecule's data node and nothing else, the
 * selection and interactivity managers, a canvas and a screenshot helper.
 * @returns The context; what it is asked is written to `log`.
 */
function standInContext() {
  const root = StateTransform.RootRef;
  return {
    set selectionMode(on: boolean) {
      log.push(`selection mode ${on ? 'on' : 'off'}`);
    },
    managers: {
      interactivity: {
        setProps: (props: { granularity: string }) =>
          log.push(`granularity ${props.granularity}`),
        lociSelects: { deselectAll: () => log.push('deselect all') },
      },
      structure: {
        selection: {
          additionsHistory: [],
          events: { additionsHistoryUpdated: event('selection history') },
        },
      },
      animation: { isAnimating: false },
    },
    state: {
      data: {
        events: {
          object: { created: event('created'), updated: event('updated') },
        },
        cells: new Map([['molecule3d-data', { obj: undefined }]]),
        tree: {
          transforms: new Map([[root, { ref: root }]]),
          children: new Map([[root, new Set()]]),
        },
        select: () => [],
      },
    },
    build() {
      const deleted: string[] = [];
      const builder = {
        delete(ref: string) {
          deleted.push(ref);
          return builder;
        },
        commit: async () => {
          log.push(`delete ${deleted.join(' ')}`);
        },
      };
      return builder;
    },
    canvas3d: {
      requestCameraReset: (options: { durationMs: number }) =>
        log.push(`camera reset in ${options.durationMs} ms`),
      setProps: (props: {
        trackball: { animate: { name: string; params: { speed?: number } } };
      }) => {
        const { name, params } = props.trackball.animate;
        log.push(
          `animate ${name}${params.speed === undefined ? '' : ` ${params.speed}`}`,
        );
      },
      camera: { changed: event('camera') },
    },
    helpers: {
      viewportScreenshot: {
        values: {},
        behaviors: { values: { next: () => undefined } },
        getImageDataUri: async () => 'data:image/png;base64,scene',
      },
    },
    handleResize: () => log.push('resize'),
    dispose: () => log.push('dispose'),
  };
}
