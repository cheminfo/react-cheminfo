/**
 * The orbital viewer's camera and lifecycle: the first fit frames the orbital
 * from its oblique angle, later fits keep the student's view, reset goes back
 * to the first framing, and a disposed viewer does nothing at all.
 *
 * molstar's view model needs WebGL to initialise, so it is replaced by one
 * whose context is a canvas writing down what it is asked; the isosurfaces
 * themselves are left to the browser suites.
 */

import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import { beforeEach, expect, test, vi } from 'vitest';

import { createOrbitalViewer } from '../viewer.ts';

interface StandInModel {
  settle: (error?: Error) => void;
  log: string[];
  states: Array<Record<string, unknown>>;
  sphere: { center: number[]; radius: number };
}

const models = vi.hoisted(() => [] as StandInModel[]);

vi.mock('molstar/lib/extensions/plugin/view-model.js', () => ({
  PluginViewModel: class {
    readonly initialized: Promise<void>;
    readonly plugin: unknown;

    constructor() {
      const log: string[] = [];
      const states: Array<Record<string, unknown>> = [];
      const sphere = { center: [1, 2, 3], radius: 5 };
      let settle: ((error?: Error) => void) | undefined;
      this.initialized = new Promise<void>((resolve, reject) => {
        settle = (error) => {
          if (error === undefined) resolve();
          else reject(error);
        };
      });
      this.plugin = {
        canvas3d: {
          boundingSphereVisible: sphere,
          boundingSphere: { radius: 20 },
          props: { sceneRadiusFactor: 1.5 },
          camera: {
            state: { target: [0, 0, 0], position: [0, 0, 10], radius: 3 },
            getTargetDistance: (radius: number) => radius * 4,
            setState: (state: Record<string, unknown>, durationMs: number) => {
              states.push({ ...state, durationMs });
            },
          },
          setProps: (props: {
            trackball: { animate: { name: string; params: object } };
          }) => {
            const { animate } = props.trackball;
            log.push(
              `animate ${animate.name} ${JSON.stringify(animate.params)}`,
            );
          },
          commit: () => log.push('commit'),
        },
        managers: {
          camera: {
            reset: (_snapshot: unknown, durationMs: number) => {
              log.push(`reset camera in ${durationMs} ms`);
            },
          },
        },
        handleResize: () => log.push('resize'),
        dispose: () => log.push('dispose'),
      };
      models.push({ settle: (error) => settle?.(error), log, states, sphere });
    }

    mount() {
      // The stand-in has no canvas to insert.
    }
  },
}));

beforeEach(() => {
  models.length = 0;
});

const CONTAINER = {} as HTMLElement;

test('the first framing looks at the nucleus from an oblique angle, z up, at the orbital’s own extent', async () => {
  const viewer = ready();

  await viewer.frame(2, 0);
  const [state] = model().states;

  expect(state?.target).toStrictEqual(Vec3.create(0, 0, 0));
  expect(state?.up).toStrictEqual(Vec3.create(0, 0, 1));
  expect(state?.radius).toBeCloseTo(2.16, 10);
  // The scene's own sphere times molstar's factor, for the far plane.
  expect(state?.radiusMax).toBe(30);
  expect(Vec3.magnitude(state?.position as Vec3)).toBeCloseTo(8.64, 10);
  expect(state?.durationMs).toBe(0);
});

test('without an extent the scene’s own sphere is framed, about its centre', async () => {
  const viewer = ready();

  await viewer.frame(undefined, 100);
  const [state] = model().states;

  expect(state?.target).toStrictEqual(Vec3.create(1, 2, 3));
  expect(state?.radius).toBeCloseTo(5.4, 10);
  expect(state?.durationMs).toBe(100);
});

test('an empty scene falls back on molstar’s own reset', async () => {
  const viewer = ready();
  model().sphere.radius = 0;

  await viewer.frame();

  expect(model().log).toStrictEqual(['reset camera in 250 ms']);
  expect(model().states).toStrictEqual([]);
});

test('a refit keeps the student’s view, rescaled only when the orbital’s extent changed', async () => {
  const viewer = ready();

  await viewer.refit(2, 0);
  await viewer.refit(2, 0);
  await viewer.refit(4, 50);
  const [framed, kept, scaled] = model().states;

  expect(framed?.radius).toBeCloseTo(2.16, 10);
  expect(kept).toStrictEqual({ radiusMax: 30, durationMs: 0 });
  expect(scaled).toStrictEqual({
    position: Vec3.create(0, 0, 20),
    radius: 6,
    radiusMax: 30,
    durationMs: 50,
  });
});

test('resetting the view frames the orbital last fitted, afresh', async () => {
  const viewer = ready();

  await viewer.refit(2, 0);
  await viewer.refit(4, 0);
  await viewer.resetView(0);

  expect(model().states).toHaveLength(3);
  expect(model().states[2]?.radius).toBeCloseTo(4.32, 10);
  expect(model().states[2]?.up).toStrictEqual(Vec3.create(0, 0, 1));
});

test('the spin turns about the vertical axis, and stops', async () => {
  const viewer = ready();

  await viewer.setSpin(true, 0.5);
  await viewer.setSpin(false);

  expect(model().log).toStrictEqual([
    'animate spin {"speed":0.5,"axis":[0,1,0]}',
    'animate off {}',
  ]);
});

test('hiding what was never drawn leaves the canvas alone, and a frame of no reach draws nothing', async () => {
  const viewer = ready();

  await viewer.hideAxes();
  await viewer.hideOrbital();

  await expect(viewer.showAxes(0)).resolves.toBe(0);
  expect(model().log).toStrictEqual([]);
});

test('a disposed viewer does nothing, and releases its canvas once', async () => {
  const viewer = ready();
  viewer.handleResize();
  viewer.dispose();
  viewer.dispose();
  viewer.handleResize();

  await expect(viewer.frame(2)).resolves.toBeUndefined();

  await flush();

  expect(viewer.disposed).toBe(true);
  expect(model().log).toStrictEqual(['resize', 'dispose']);
  expect(model().states).toStrictEqual([]);
});

test('a failed initialisation reaches the caller; a call still queued at disposal resolves to nothing', async () => {
  const failing = createOrbitalViewer(CONTAINER);
  models[0]?.settle(new Error('no WebGL'));

  await expect(failing.frame(2)).rejects.toThrow('no WebGL');

  const viewer = ready();
  const pending = viewer.frame(2, 0);
  viewer.dispose();

  await expect(pending).resolves.toBeUndefined();
  expect(model().states).toStrictEqual([]);
});

function ready() {
  const viewer = createOrbitalViewer(CONTAINER, { background: '#000000' });
  model().settle();
  return viewer;
}

function model(): StandInModel {
  const last = models.at(-1);
  if (last === undefined) throw new Error('no viewer was created');
  return last;
}

function flush(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
