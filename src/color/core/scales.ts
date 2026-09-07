import type { ColorScale } from './interpolate.ts';
import { evenScale } from './interpolate.ts';
import {
  BLUE_RED_COLORS,
  CIVIDIS_COLORS,
  COOL_WARM_COLORS,
  GREYS_COLORS,
  INFERNO_COLORS,
  MAGMA_COLORS,
  PLASMA_COLORS,
  TURBO_COLORS,
  VIRIDIS_COLORS,
} from './scaleData.ts';

/**
 * What a scale is for, which is what the picker groups it under.
 *
 * A `sequential` one climbs from a low end to a high end; a `diverging` one
 * reads away from a middle in both directions; a `cyclic` one turns around the
 * colour wheel and orders nothing, so it is offered for the reader who wants
 * the rainbow their course used and never chosen for them.
 */
export type ColorScaleKind = 'sequential' | 'diverging' | 'cyclic';

/** One of the scales the family reads a quantity with. */
export interface NamedColorScale {
  /** The word a link and the picker carry, e.g. `viridis`. */
  id: string;
  /** What it is called in the picker. */
  label: string;
  /** What it is for. */
  kind: ColorScaleKind;
  /** One line on when to reach for it. */
  description: string;
  /** The ramp itself. */
  scale: ColorScale;
}

/** What the picker calls each kind. */
export const COLOR_SCALE_KIND_LABELS: Record<ColorScaleKind, string> = {
  sequential: 'Low to high',
  diverging: 'Away from a middle',
  cyclic: 'Around the wheel',
};

/** The scale a site reads a quantity with unless a link says otherwise. */
export const DEFAULT_COLOR_SCALE_ID = 'viridis';

/**
 * Every scale the picker offers, in the order it lists them.
 *
 * Viridis leads because it is the only one of them that survives every way a
 * figure is read: printed in grey, projected, and seen by the one student in
 * twelve who does not separate red from green.
 */
export const COLOR_SCALES: readonly NamedColorScale[] = [
  {
    id: 'viridis',
    label: 'Viridis',
    kind: 'sequential',
    description: 'Purple to yellow. Prints in grey and reads colour-blind.',
    scale: evenScale(VIRIDIS_COLORS),
  },
  {
    id: 'plasma',
    label: 'Plasma',
    kind: 'sequential',
    description: 'Blue to yellow through magenta, brighter than viridis.',
    scale: evenScale(PLASMA_COLORS),
  },
  {
    id: 'magma',
    label: 'Magma',
    kind: 'sequential',
    description: 'Black to cream through violet and orange.',
    scale: evenScale(MAGMA_COLORS),
  },
  {
    id: 'inferno',
    label: 'Inferno',
    kind: 'sequential',
    description: 'Black to pale yellow through red.',
    scale: evenScale(INFERNO_COLORS),
  },
  {
    id: 'cividis',
    label: 'Cividis',
    kind: 'sequential',
    description: 'Blue to yellow, built to read the same to a deuteranope.',
    scale: evenScale(CIVIDIS_COLORS),
  },
  {
    id: 'turbo',
    label: 'Turbo',
    kind: 'sequential',
    description: 'Rainbow colours, ordered so the lightness still climbs.',
    scale: evenScale(TURBO_COLORS),
  },
  {
    id: 'greys',
    label: 'Greys',
    kind: 'sequential',
    description: 'Light to black, for a figure that will be photocopied.',
    scale: evenScale(GREYS_COLORS),
  },
  {
    id: 'cool-warm',
    label: 'Cool to warm',
    kind: 'diverging',
    description: 'Blue through pale yellow to red.',
    scale: evenScale(COOL_WARM_COLORS),
  },
  {
    id: 'blue-red',
    label: 'Blue to red',
    kind: 'diverging',
    description: 'Blue to red through white, the palest middle.',
    scale: evenScale(BLUE_RED_COLORS),
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    kind: 'cyclic',
    description:
      'Blue through green and yellow to red. Orders nothing in grey.',
    // Two anchors and the long way round the wheel: the whole rainbow, and the
    // shortest thing in this file that shows what the HSV model buys.
    scale: {
      stops: [
        { position: 0, color: '#0000ff' },
        { position: 1, color: '#ff0000' },
      ],
      interpolation: 'hsv-long',
    },
  },
];

/**
 * The scale a link names.
 * @param id - The word a link carries, e.g. `plasma`.
 * @returns Its entry, or `undefined` when no scale is called that.
 */
export function colorScaleById(id: string): NamedColorScale | undefined {
  for (const scale of COLOR_SCALES) {
    if (scale.id === id) return scale;
  }
  return undefined;
}
