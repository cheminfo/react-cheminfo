/**
 * The cartesian frame an atomic orbital is read against.
 *
 * A `3d_xz` is only `3d_xz` because of where its lobes sit relative to x and
 * z, and a lone isosurface on a blank canvas says nothing about that: the
 * student is looking at four identical lobes and has to take the label's word
 * for it. Three labelled axes through the nucleus are what turn the picture
 * back into the diagram their textbook draws.
 *
 * The axes are neutral grey on purpose. The phase palette already owns colour
 * here — blue against red, or blue against amber — so the usual red/green/blue
 * axis convention would compete with the one thing the surface is saying, and
 * the labels tell the three apart anyway.
 *
 * Like the isosurfaces, the representations live outside the state tree and
 * are tracked per plugin.
 */

import { Mesh } from 'molstar/lib/mol-geo/geometry/mesh/mesh.js';
import { Text } from 'molstar/lib/mol-geo/geometry/text/text.js';
import { Shape } from 'molstar/lib/mol-model/shape.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import type { Representation } from 'molstar/lib/mol-repr/representation.js';
// Lowercased on import: it is a factory, not a constructor.
import { ShapeRepresentation as shapeRepresentation } from 'molstar/lib/mol-repr/shape/representation.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

import {
  LABEL_SIZE,
  ROD_LENGTH,
  buildAxisLabels,
  buildAxisRods,
} from './axesGeometry.ts';

/** How the cartesian frame is drawn. */
export interface AxesStyle {
  /**
   * Colour of the three rods, as `#rrggbb`.
   * @default '#64748b'
   */
  colour?: string;
  /**
   * Colour of the three labels, as `#rrggbb`.
   * @default '#334155'
   */
  labelColour?: string;
  /**
   * What the axes are called, in x, y, z order.
   * @default ['x', 'y', 'z']
   */
  labels?: readonly [string, string, string];
}

/**
 * Draw a labelled x, y, z frame through the origin, replacing any previous one.
 * @param plugin - The molstar context.
 * @param reach - How far the orbital reaches, in scene units — what
 * `renderSampledVolume` returned.
 * @param style - See {@link AxesStyle}.
 * @returns How far the frame reaches, labels included, in scene units: what a
 * camera has to frame for the whole of it to be on screen.
 * @throws {Error} When the canvas is not ready.
 */
export async function renderOrbitalAxes(
  plugin: PluginContext,
  reach: number,
  style: AxesStyle = {},
): Promise<number> {
  const canvas3d = plugin.canvas3d;
  if (canvas3d === undefined) {
    throw new Error('renderOrbitalAxes: the molstar canvas is not ready.');
  }
  const {
    colour = '#64748b',
    labelColour = '#334155',
    labels = ['x', 'y', 'z'],
  } = style;
  clearOrbitalAxes(plugin);
  if (reach <= 0) return 0;

  const labelSize = reach * LABEL_SIZE;
  const labelAt = reach * ROD_LENGTH + labelSize;
  const drawn = await Promise.all([
    createRods(plugin, buildAxisRods(reach), colour),
    createLabels(
      plugin,
      buildAxisLabels(labelAt, labels),
      labelColour,
      labelSize,
    ),
  ]);
  representations.set(plugin, drawn);
  for (const representation of drawn) canvas3d.add(representation);
  // add() only queues; nothing appears until the queue is committed.
  canvas3d.commit();
  return labelAt + labelSize / 2;
}

/**
 * Remove the frame, leaving anything else on the canvas.
 * @param plugin - The molstar context.
 */
export function clearOrbitalAxes(plugin: PluginContext): void {
  const previous = representations.get(plugin);
  if (previous === undefined) return;
  representations.delete(plugin);
  for (const representation of previous) {
    plugin.canvas3d?.remove(representation);
  }
  plugin.canvas3d?.commit();
}

/**
 * The rods, as a representation the canvas can hold.
 * @param plugin - The molstar context.
 * @param mesh - The rod mesh.
 * @param colour - Rod colour, as `#rrggbb`.
 * @returns The representation.
 */
async function createRods(
  plugin: PluginContext,
  mesh: Mesh,
  colour: string,
): Promise<Representation.Any> {
  const value = Color.fromHexStyle(colour);
  const representation = shapeRepresentation(
    (_ctx, data: Mesh) =>
      Shape.create(
        'orbital axes',
        {},
        data,
        () => value,
        () => 1,
        () => 'axis',
      ),
    Mesh.Utils,
  );
  await plugin.runTask(
    // Unlit: a shaded rod reads as a cylinder in front of the surface, while a
    // flat one reads as the axis line a textbook draws.
    representation.createOrUpdate({ alpha: 1, ignoreLight: true }, mesh),
  );
  representation.setState({ pickable: false });
  return representation;
}

/**
 * The labels, as a representation the canvas can hold.
 * @param plugin - The molstar context.
 * @param text - The label geometry.
 * @param colour - Label colour, as `#rrggbb`.
 * @param size - Label height, in scene units.
 * @returns The representation.
 */
async function createLabels(
  plugin: PluginContext,
  text: Text,
  colour: string,
  size: number,
): Promise<Representation.Any> {
  const value = Color.fromHexStyle(colour);
  const representation = shapeRepresentation(
    (_ctx, data: Text) =>
      Shape.create(
        'orbital axis labels',
        {},
        data,
        () => value,
        () => 1,
        () => 'axis label',
      ),
    Text.Utils,
  );
  await plugin.runTask(
    representation.createOrUpdate(
      {
        sizeFactor: size,
        background: false,
        attachment: 'middle-center',
        fontWeight: 'bold',
      },
      text,
    ),
  );
  representation.setState({ pickable: false });
  return representation;
}

/** One frame per plugin, outside the state tree like the isosurfaces. */
const representations = new WeakMap<PluginContext, Representation.Any[]>();
