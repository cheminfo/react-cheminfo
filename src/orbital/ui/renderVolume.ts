/**
 * Signed isosurfaces of a scalar field the caller sampled itself.
 *
 * Molstar can collocate an orbital on the GPU from a Gaussian basis, but that
 * path cannot draw an *atomic* orbital: a hydrogen-like radial function has
 * nodes, and an f orbital an angular momentum, that a valence STO-3G basis
 * simply does not carry. So `core/atomicGrid.ts` samples the wavefunction
 * itself, in ångström, and this module wraps the result in the `Volume`
 * molstar's isosurface renderer wants.
 *
 * The two phases come from one field and one isovalue, so they can never
 * disagree about where the node is. The representations live outside the state
 * tree and are tracked per plugin, because every change of orbital replaces
 * them wholesale.
 */

import type { Volume } from 'molstar/lib/mol-model/volume.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { createVolumeRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/volume-representation-params.js';
import type { Representation } from 'molstar/lib/mol-repr/representation.js';
import { Theme } from 'molstar/lib/mol-theme/theme.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

import type { OrbitalGrid } from '../core/grid.ts';
import type { OrbitalContour } from '../core/isovalue.ts';

import { DISPLAY_REACH, toVolume } from './volumeField.ts';

/** Colours and opacity of one signed isosurface pair. */
export interface VolumeStyle {
  /**
   * Lobe where the wavefunction is positive, as `#rrggbb`.
   * @default '#2563eb'
   */
  positiveColour?: string;
  /**
   * Lobe where the wavefunction is negative, as `#rrggbb`.
   * @default '#dc2626'
   */
  negativeColour?: string;
  /**
   * Isovalue as a multiple of the contour's own cutoff. Larger means a
   * tighter, smaller surface.
   * @default 1
   */
  relativeIsovalue?: number;
  /**
   * Surface opacity. Below 1 the far lobes show through the near ones.
   * @default 0.72
   */
  alpha?: number;
}

/**
 * Replace the isosurface pair drawn from a sampled field.
 * @param plugin - The molstar context.
 * @param field - The field, as `sampleAtomicOrbital` produced it.
 * @param contour - The isovalue and reach measured on that field, as
 * `runAtomicSample` returned them.
 * @param style - See {@link VolumeStyle}.
 * @returns How far the drawn surface reaches from the centre of the box,
 * ångström — what a camera has to frame to fill the viewport with it.
 * @throws {Error} When the canvas is not ready.
 */
export async function renderSampledVolume(
  plugin: PluginContext,
  field: OrbitalGrid,
  contour: OrbitalContour,
  style: VolumeStyle = {},
): Promise<number> {
  const canvas3d = plugin.canvas3d;
  if (canvas3d === undefined) {
    throw new Error('renderSampledVolume: the molstar canvas is not ready.');
  }
  const {
    positiveColour = '#2563eb',
    negativeColour = '#dc2626',
    relativeIsovalue = 1,
    alpha = 0.72,
  } = style;
  clearSampledVolume(plugin);

  const { cutoff, reach } = contour;
  // Molstar's camera clamps both its target distance and its near plane, so it
  // cannot get close to a small object: uranium's 4f reaches 0.35 Å and would
  // stay a dot in the corner whatever the camera is asked to frame. Every
  // orbital is therefore drawn at one canonical size, and the true extent is
  // reported as ⟨r⟩ and on the radial plot instead of by the picture's scale.
  const volume = toVolume(field, reach > 0 ? DISPLAY_REACH / reach : 1);
  // A nodeless orbital — every 1s — has no negative lobe at all, and asking for
  // its isosurface would draw an empty mesh at value 0.
  const surfaces = await Promise.all([
    maybeSurface(
      plugin,
      volume,
      field.max >= cutoff ? cutoff : undefined,
      relativeIsovalue,
      { colour: positiveColour, alpha },
    ),
    maybeSurface(
      plugin,
      volume,
      field.min <= -cutoff ? -cutoff : undefined,
      relativeIsovalue,
      { colour: negativeColour, alpha },
    ),
  ]);
  const drawn = surfaces.filter(
    (surface): surface is Representation.Any => surface !== null,
  );
  representations.set(plugin, drawn);
  for (const representation of drawn) canvas3d.add(representation);
  // add() only queues; nothing appears until the queue is committed.
  canvas3d.commit();
  return reach > 0 ? DISPLAY_REACH : 0;
}

/**
 * Remove the sampled isosurfaces, leaving anything else on the canvas.
 * @param plugin - The molstar context.
 */
export function clearSampledVolume(plugin: PluginContext): void {
  const previous = representations.get(plugin);
  if (previous === undefined) return;
  representations.delete(plugin);
  for (const representation of previous) {
    plugin.canvas3d?.remove(representation);
  }
  plugin.canvas3d?.commit();
}

/**
 * One phase's surface, or nothing when the field never reaches that sign.
 * @param plugin - The molstar context.
 * @param volume - The volume the surface is built from.
 * @param isovalue - Absolute isovalue of the surface.
 * @param relativeIsovalue - Multiplier applied to it.
 * @param style - Colour and opacity of the surface.
 * @param style.colour - Surface colour, as `#rrggbb`.
 * @param style.alpha - Surface opacity.
 * @returns The surface representation.
 */
async function maybeSurface(
  plugin: PluginContext,
  volume: Volume,
  isovalue: number | undefined,
  relativeIsovalue: number,
  style: { colour: string; alpha: number },
): Promise<Representation.Any | null> {
  if (isovalue === undefined || isovalue === 0) return null;
  return createSurface(
    plugin,
    volume,
    isovalue * relativeIsovalue,
    style.colour,
    style.alpha,
  );
}

async function createSurface(
  plugin: PluginContext,
  volume: Volume,
  isovalue: number,
  colour: string,
  alpha: number,
): Promise<Representation.Any> {
  const params = createVolumeRepresentationParams(plugin, volume, {
    type: 'isosurface',
    typeParams: {
      isoValue: { kind: 'absolute', absoluteValue: isovalue },
      alpha,
      xrayShaded: true,
      // Molstar's GPU marching cubes pits the outer lobe of a diffuse orbital
      // with voxel-sized dimples — caesium's 6s and every 7s, 6d and 7p above
      // it — and quantises the field to 255 steps on upload unless told
      // otherwise, which terraces xenon's 4p. The surface is a thin shell
      // whatever the box holds, so the CPU path costs 13–44 ms and returns
      // 27 k vertices even on the 152³ grid the highest quality asks for.
      tryUseGpu: false,
    },
    color: 'uniform',
    colorParams: { value: Color.fromHexStyle(colour) },
  });
  const provider = plugin.representation.volume.registry.get(params.type.name);
  const representation = provider.factory(
    { webgl: plugin.canvas3d?.webgl, ...plugin.representation.volume.themes },
    provider.getParams,
  );
  representation.setTheme(
    Theme.create(plugin.representation.volume.themes, { volume }, params),
  );
  await plugin.runTask(
    representation.createOrUpdate(params.type.params ?? {}, volume),
  );
  representation.setState({ pickable: false });
  return representation;
}

/**
 * One pair of surfaces per plugin. They are outside the state tree, like the
 * cartoon lobes, because every change of orbital replaces them entirely.
 */
const representations = new WeakMap<PluginContext, Representation.Any[]>();
