/**
 * Framing needs a WebGL canvas to be seen; what it asks of the camera does
 * not, so the plugin here records the calls and nothing else.
 */

import type { GraphicsRenderObject } from 'molstar/lib/mol-gl/render-object.js';
import { Sphere3D } from 'molstar/lib/mol-math/geometry.js';
import { Vec3 } from 'molstar/lib/mol-math/linear-algebra.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { expect, test } from 'vitest';

import { framedRadius } from '../camera.ts';
import {
  focusPoint,
  resetCamera,
  sceneSphere,
  unionSphere,
} from '../framing.ts';

test('two spheres are held by one, and one sphere is itself', () => {
  const water = Sphere3D.create(Vec3.create(0, 0, 0), 1);
  const methane = Sphere3D.create(Vec3.create(4, 0, 0), 1);

  const union = unionSphere([water, methane]);

  // molstar bounds along 98 directions, so the sphere is a little larger
  // than the tightest one (radius 3), and holds both whole.
  expect(union?.radius).toBeCloseTo(3.3265306122448983, 12);
  expect(holds(union, water)).toBe(true);
  expect(holds(union, methane)).toBe(true);
  expect(unionSphere([water])).toBe(water);
  expect(unionSphere([])).toBeNull();
});

test('the scene is what the site measured, plus the render objects it names', () => {
  const plugin = fakePlugin([
    renderObject('mesh', 2, [10, 0, 0]),
    renderObject('spheres', 50, [0, 0, 0]),
  ]);
  const model = Sphere3D.create(Vec3.create(0, 0, 0), 2);

  const scene = sceneSphere(plugin.context, {
    spheres: [model, Sphere3D.create(Vec3.create(9, 9, 9), 0)],
    include: (object) => object.type === 'mesh',
  });

  expect(scene?.radius).toBeCloseTo(7.816326530612245, 12);
  expect(holds(scene, model)).toBe(true);
  expect(plugin.calls).toStrictEqual(['commit']);
  expect(sceneSphere(plugin.context)).toBeNull();
});

test('a reset frames the scene with the margin, keeping the direction', () => {
  const plugin = fakePlugin([]);

  resetCamera(plugin.context, {
    spheres: [Sphere3D.create(Vec3.create(1, 2, 3), 10)],
    durationMs: 0,
  });

  expect(plugin.calls).toStrictEqual([
    'commit',
    'commit',
    `focusSphere 1,2,3 r=${framedRadius(10)} extra=0 min=0.5 in 0ms`,
  ]);
  expect(framedRadius(10)).toBeCloseTo(10.8, 10);
  expect(framedRadius(10, -0.12)).toBeCloseTo(8.8, 10);
});

test('an empty scene is left to molstar, and a given sphere framed as given', () => {
  const plugin = fakePlugin([]);

  resetCamera(plugin.context);
  resetCamera(plugin.context, {
    sphere: Sphere3D.create(Vec3.create(0, 0, 0), 0.1),
    margin: 0,
  });

  expect(plugin.calls).toStrictEqual([
    'commit',
    'reset in 250ms',
    'commit',
    'commit',
    'focusSphere 0,0,0 r=0.5 extra=0 min=0.5 in 250ms',
  ]);
});

test('a named orientation is taken as given, the eye turned into a direction', () => {
  const plugin = fakePlugin([]);

  focusPoint(plugin.context, [1, 0, 0], 0.2, {
    durationMs: 100,
    orientation: { eye: [0, 0, 1], up: [0, 1, 0] },
  });

  expect(plugin.calls).toStrictEqual([
    'commit',
    'invariantFocus 1,0,0 r=0.5 up=0,1,0 dir=0,0,-1',
    'setSnapshot in 100ms',
  ]);
});

function holds(outer: Sphere3D | null, inner: Sphere3D): boolean {
  if (outer === null) return false;
  const reach = Vec3.distance(outer.center, inner.center) + inner.radius;
  return reach <= outer.radius + 1e-9;
}

function text(vector: ArrayLike<number>): string {
  return Array.from(vector, (value) => round(value) + 0).join(',');
}

function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function renderObject(
  type: string,
  radius: number,
  center: [number, number, number],
): GraphicsRenderObject {
  const value = Sphere3D.create(Vec3.create(...center), radius);
  return {
    type,
    values: { boundingSphere: { ref: { value } } },
  } as unknown as GraphicsRenderObject;
}

function fakePlugin(objects: GraphicsRenderObject[]) {
  const calls: string[] = [];
  const context = {
    canvas3d: {
      commit: () => calls.push('commit'),
      getRenderObjects: () => objects,
      camera: {
        getInvariantFocus: (
          target: Vec3,
          radius: number,
          up: Vec3,
          dir: Vec3,
        ) => {
          calls.push(
            `invariantFocus ${text(target)} r=${radius} up=${text(up)} dir=${text(dir)}`,
          );
          return {};
        },
      },
    },
    managers: {
      camera: {
        reset: (_snapshot: unknown, durationMs: number) =>
          calls.push(`reset in ${durationMs}ms`),
        setSnapshot: (_snapshot: unknown, durationMs: number) =>
          calls.push(`setSnapshot in ${durationMs}ms`),
        focusSphere: (
          sphere: Sphere3D,
          options: {
            extraRadius: number;
            minRadius: number;
            durationMs: number;
          },
        ) =>
          calls.push(
            `focusSphere ${text(sphere.center)} r=${sphere.radius} extra=${options.extraRadius} min=${options.minRadius} in ${options.durationMs}ms`,
          ),
      },
    },
  };
  return { calls, context: context as unknown as PluginContext };
}
