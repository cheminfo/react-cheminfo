/**
 * What the cartesian frame does before it draws: it refuses a canvas that is
 * not there, and an orbital of no reach gets no frame.
 *
 * Drawing the frame itself rasterises its letters through a 2D canvas, so it
 * is left to the browser suites.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { expect, test } from 'vitest';

import { clearOrbitalAxes, renderOrbitalAxes } from '../renderAxes.ts';

test('a frame cannot be drawn before the canvas exists', async () => {
  await expect(renderOrbitalAxes({} as PluginContext, 10)).rejects.toThrow(
    'renderOrbitalAxes: the molstar canvas is not ready.',
  );
});

test('an orbital of no reach gets no frame, and clearing it touches nothing', async () => {
  const log: string[] = [];
  const plugin = {
    canvas3d: {
      add: () => log.push('add'),
      remove: () => log.push('remove'),
      commit: () => log.push('commit'),
    },
  } as unknown as PluginContext;

  await expect(renderOrbitalAxes(plugin, -1)).resolves.toBe(0);

  clearOrbitalAxes(plugin);

  expect(log).toStrictEqual([]);
});
