/**
 * The option objects the molstar viewer takes. Plain data, so the renderers
 * and the React canvas can share them without importing each other.
 */

import type { Measurement } from '../core/measurement.ts';
import type { RepresentationId, SurfaceColoringId } from '../core/settings.ts';

/** Settings fixed for the life of a viewer. */
export interface Molecule3DViewerOptions {
  /**
   * Scene background, as `#rrggbb`. A WebGL clear colour: the renderer cannot
   * read a CSS custom property.
   * @default '#ffffff'
   */
  background?: string;
  /**
   * Called with each measurement once its atoms have been clicked.
   * @default undefined
   */
  onMeasure?: (measurement: Measurement) => void;
}

/** How to draw the model. */
export interface MoleculeStyle {
  /**
   * Which representation to draw.
   * @default 'ball-and-stick'
   */
  representation?: RepresentationId;
  /**
   * Radius multiplier; 1 is the size each representation picks for itself.
   * @default 1
   */
  sizeFactor?: number;
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
