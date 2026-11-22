/**
 * The option objects the molstar viewer takes. Plain data, so the renderers
 * and the React canvas can share them without importing each other.
 */

import type { Measurement } from '../core/measurement.ts';
import type { RepresentationId } from '../core/settings.ts';

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
  /**
   * Called with how many frames the file on screen holds, each time a file is
   * drawn, and with 0 once the scene is emptied.
   * @default undefined
   */
  onFrameCountChange?: (frameCount: number) => void;
}

/** How to draw the partial bonds, sized after the model they are drawn over. */
export interface PartialBondStyle {
  /**
   * The representation of the model.
   * @default 'ball-and-stick'
   */
  representation?: RepresentationId;
  /**
   * The model's radius multiplier.
   * @default 1
   */
  sizeFactor?: number;
  /**
   * Whether each is labelled with its length.
   * @default true
   */
  lengths?: boolean;
}

export {
  type MoleculeStyle,
  type SurfaceStyle,
} from '../../molstar/core/representation.ts';
