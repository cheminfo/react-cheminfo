/**
 * How every 3D view of the family draws a molecule and its molecular surface,
 * as molstar parameters, so a site building its own scene — orbitals, a
 * crystal — draws the representation and the size the display options name
 * exactly as `<MoleculeViewer3D>` does.
 */

import type { Structure } from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { createStructureRepresentationParams } from 'molstar/lib/mol-plugin-state/helpers/structure-representation-params.js';
import type { StructureRepresentation3D } from 'molstar/lib/mol-plugin-state/transforms/representation.js';
import type { StateTransformer } from 'molstar/lib/mol-state/index.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';

import type {
  RepresentationId,
  SurfaceColoringId,
} from '../../molecule3d/core/settings.ts';
import { DEFAULT_MOLECULE_3D_SETTINGS } from '../../molecule3d/core/settings.ts';

import {
  POLARITY_COLOR_THEME,
  registerPolarityTheme,
} from './polarityColorTheme.ts';

/** How to draw the model. */
export interface MoleculeStyle {
  /**
   * Which representation to draw.
   * @default 'ball-and-stick'
   */
  representation?: RepresentationId;
  /**
   * Radius multiplier; 1 is the size each representation picks for itself. In
   * ball and stick it sizes the balls only.
   * @default 1
   */
  sizeFactor?: number;
  /**
   * Bond radius multiplier of the ball and stick model, whatever the size of
   * the balls.
   * @default 1
   */
  bondSizeFactor?: number;
}

/** How to draw the molecular surface. */
export interface SurfaceStyle {
  /**
   * Radius of the probe rolled over the atoms, ångström; 1.4 is water.
   * @default 1.4
   */
  probeRadius?: number;
  /**
   * Surface opacity. Below 1 the model stays visible inside it.
   * @default 0.5
   */
  alpha?: number;
  /**
   * How the surface is coloured.
   * @default 'uniform'
   */
  coloring?: SurfaceColoringId;
  /**
   * Surface colour in `uniform` mode, `#rrggbb`.
   * @default '#94a3b8'
   */
  color?: string;
}

/** The parameters of one representation node of the state tree. */
export type RepresentationParams =
  StateTransformer.Params<StructureRepresentation3D>;

/**
 * molstar's ball-and-stick radius factor that a size factor of 1 stands for:
 * thin sticks and readable balls.
 */
const NATURAL_SIZE_FACTOR = 0.25;

/**
 * Bond radius as a fraction of the smaller ball's, at sizes of 1: a C–C bond
 * of 0.17 Å, molstar's own, beside balls large enough to read the element by.
 */
const BALL_AND_STICK_ASPECT_RATIO = 0.4;

/** Spacefill multiplies the van der Waals radius, whose honest value is 1. */
const SPACEFILL_SCALE = 4;

/** Sticks take the factor as a radius in ångström; 0.3 Å is licorice. */
const STICK_SCALE = 1.2;

/** molstar's van der Waals radius of carbon, which sizes a C–C bond, Å. */
const CARBON_VDW_RADIUS = 1.7;

/**
 * The model's representation node: one of the three representations,
 * coloured by element. `stick` is a genuine licorice model: a uniform size
 * theme and an aspect ratio of 1 give atoms and bonds one radius, so the joints
 * are caps of the stick's thickness.
 * @param plugin - The molstar context.
 * @param structure - The atoms to draw.
 * @param style - See {@link MoleculeStyle}.
 * @returns The parameters of the representation node.
 */
export function modelRepresentationParams(
  plugin: PluginContext,
  structure: Structure,
  style: MoleculeStyle = {},
): RepresentationParams {
  const {
    representation = 'ball-and-stick',
    sizeFactor = 1,
    bondSizeFactor = 1,
  } = style;
  const factor = sizeFactor * NATURAL_SIZE_FACTOR;
  const color = 'element-symbol' as const;
  const colorParams = {
    carbonColor: { name: 'element-symbol', params: {} },
  } as const;
  if (representation === 'spacefill') {
    return createStructureRepresentationParams(plugin, structure, {
      type: 'spacefill',
      typeParams: { sizeFactor: factor * SPACEFILL_SCALE },
      color,
      colorParams,
    });
  }
  if (representation === 'stick') {
    return createStructureRepresentationParams(plugin, structure, {
      type: 'ball-and-stick',
      typeParams: {
        sizeFactor: factor * STICK_SCALE,
        sizeAspectRatio: 1,
        aromaticBonds: false,
      },
      color,
      colorParams,
      size: 'uniform',
      sizeParams: { value: 1 },
    });
  }
  return createStructureRepresentationParams(plugin, structure, {
    type: 'ball-and-stick',
    typeParams: {
      sizeFactor: factor,
      // molstar draws a bond at this share of its smaller ball, so dividing by
      // the balls' factor leaves the bond sized by its own.
      sizeAspectRatio:
        (BALL_AND_STICK_ASPECT_RATIO * bondSizeFactor) / sizeFactor,
      aromaticBonds: false,
    },
    color,
    colorParams,
  });
}

/**
 * The molecular surface's representation node, coloured as the settings say.
 * @param plugin - The molstar context; the polarity theme is registered on it
 * when the surface asks for it.
 * @param structure - The atoms the surface wraps.
 * @param style - See {@link SurfaceStyle}.
 * @returns The parameters of the representation node.
 */
export function surfaceRepresentationParams(
  plugin: PluginContext,
  structure: Structure,
  style: SurfaceStyle = {},
): RepresentationParams {
  const defaults = DEFAULT_MOLECULE_3D_SETTINGS;
  const {
    probeRadius = defaults.probeRadius,
    alpha = defaults.surfaceAlpha,
    coloring = defaults.surfaceColoring,
    color = defaults.surfaceColor,
  } = style;
  const typeParams = { probeRadius, alpha };
  if (coloring === 'element') {
    return createStructureRepresentationParams(plugin, structure, {
      type: 'molecular-surface',
      typeParams,
      color: 'element-symbol',
      colorParams: { carbonColor: { name: 'element-symbol', params: {} } },
    });
  }
  const params = createStructureRepresentationParams(plugin, structure, {
    type: 'molecular-surface',
    typeParams,
    color: 'uniform',
    colorParams: { value: Color.fromHexStyle(color) },
  });
  if (coloring !== 'polarity') return params;
  registerPolarityTheme(
    plugin.representation.structure.themes.colorThemeRegistry,
  );
  return { ...params, colorTheme: { name: POLARITY_COLOR_THEME, params: {} } };
}

/**
 * The radius molstar gives a C–C bond of the model, so what is drawn beside
 * the bonds can be sized after them.
 * @param representation - Which representation.
 * @param sizeFactor - The settings' radius multiplier.
 * @param bondSizeFactor - The settings' bond multiplier, which ball and stick
 * sizes its bonds by.
 * @returns The radius in ångström; 0 for spacefill, which draws no bonds.
 */
export function bondRadius(
  representation: RepresentationId,
  sizeFactor: number,
  bondSizeFactor = 1,
): number {
  if (representation === 'spacefill') return 0;
  if (representation === 'stick') {
    return sizeFactor * NATURAL_SIZE_FACTOR * STICK_SCALE;
  }
  return (
    bondSizeFactor *
    NATURAL_SIZE_FACTOR *
    BALL_AND_STICK_ASPECT_RATIO *
    CARBON_VDW_RADIUS
  );
}

/**
 * The radius molstar draws an atom at, so a scene can be framed on the balls
 * rather than on the nuclei.
 * @param representation - Which representation.
 * @param sizeFactor - The settings' radius multiplier.
 * @param vanDerWaalsRadius - molstar's van der Waals radius of the element, Å.
 * @returns The radius in ångström.
 */
export function atomRadius(
  representation: RepresentationId,
  sizeFactor: number,
  vanDerWaalsRadius: number,
): number {
  const factor = sizeFactor * NATURAL_SIZE_FACTOR;
  if (representation === 'spacefill') {
    return vanDerWaalsRadius * factor * SPACEFILL_SCALE;
  }
  if (representation === 'stick') return factor * STICK_SCALE;
  return vanDerWaalsRadius * factor;
}
