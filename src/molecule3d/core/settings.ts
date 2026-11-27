/**
 * The display settings of the 3D molecule viewer, free of React and molstar so
 * a site can persist and validate them.
 */

import { normalizeHexColor } from '../../color/core/hex.ts';
import { clamp } from '../../format/core/clamp.ts';

import type { PartialBondMode } from './partialBondMode.ts';
import { isPartialBondMode } from './partialBondMode.ts';

/** Ways the model can be drawn, in the order the picker offers them. */
export const REPRESENTATIONS = [
  'ball-and-stick',
  'spacefill',
  'stick',
] as const;

/** One of {@link REPRESENTATIONS}. */
export type RepresentationId = (typeof REPRESENTATIONS)[number];

/** Human names for the representation picker. */
export const REPRESENTATION_LABELS: Record<RepresentationId, string> = {
  'ball-and-stick': 'Ball and stick',
  spacefill: 'Spacefill',
  stick: 'Sticks',
};

/** Ways the surface can be coloured, in the order the picker offers them. */
export const SURFACE_COLORINGS = ['uniform', 'element', 'polarity'] as const;

/** One of {@link SURFACE_COLORINGS}. */
export type SurfaceColoringId = (typeof SURFACE_COLORINGS)[number];

/** Human names for the surface colouring picker. */
export const SURFACE_COLORING_LABELS: Record<SurfaceColoringId, string> = {
  uniform: 'Uniform',
  element: 'Element',
  polarity: 'Polarity',
};

/** How the model and its surface are drawn. */
export interface Molecule3DSettings {
  representation: RepresentationId;
  /**
   * Radius multiplier; 1 is the size each representation picks for itself. In
   * ball and stick it sizes the balls only, the bonds having their own.
   */
  sizeFactor: number;
  /**
   * Bond radius multiplier of the ball and stick model, whatever the size of
   * the balls; 1 is the bond drawn beside balls of size 1.
   */
  bondSizeFactor: number;
  /** Whether the translucent molecular surface is drawn over the model. */
  showSurface: boolean;
  /** Surface opacity; below 1 the model stays visible inside it. */
  surfaceAlpha: number;
  /** Radius of the solvent probe rolled over the atoms, ångström. */
  probeRadius: number;
  /**
   * `uniform` paints the surface in `surfaceColor`, `element` in the colour of
   * the nearest atom, `polarity` in the fixed {@link SURFACE_CHARGE_COLORS}.
   */
  surfaceColoring: SurfaceColoringId;
  /** Surface colour in `uniform` mode, `#rrggbb`. */
  surfaceColor: string;
  /**
   * Whether the partial bonds are drawn dashed: pairs a little too far apart
   * to be bonded, as the forming and breaking bonds of a transition state.
   * `auto` draws them for an XYZ file, whose bonds are guessed from distances.
   */
  partialBonds: PartialBondMode;
  /** Whether each partial bond is labelled with its length. */
  partialBondLengths: boolean;
}

/**
 * The colours of `polarity` mode. Positive: cations, and hydrogens bonded to
 * nitrogen or oxygen. Negative: anions, nitrogen and oxygen. Neutral: the rest.
 * Scene colours: WebGL cannot read a CSS custom property.
 */
export const SURFACE_CHARGE_COLORS = {
  positive: '#dc2626', // tokens-ok
  negative: '#2563eb', // tokens-ok
  neutral: '#9ca3af', // tokens-ok
} as const;

/** What the viewer draws when a site does not say. */
export const DEFAULT_MOLECULE_3D_SETTINGS: Molecule3DSettings = {
  representation: 'ball-and-stick',
  sizeFactor: 1,
  bondSizeFactor: 1,
  showSurface: false,
  surfaceAlpha: 0.5,
  probeRadius: 1.4,
  surfaceColoring: 'uniform',
  // A scene colour: WebGL cannot read a CSS custom property.
  surfaceColor: '#94a3b8', // tokens-ok
  partialBonds: 'auto',
  partialBondLengths: true,
};

/** The span, and the slider step, of every numeric setting. */
export const MOLECULE_3D_RANGES = {
  sizeFactor: { minimum: 0.2, maximum: 2, step: 0.1 },
  bondSizeFactor: { minimum: 0.2, maximum: 2, step: 0.1 },
  surfaceAlpha: { minimum: 0.1, maximum: 1, step: 0.05 },
  probeRadius: { minimum: 1, maximum: 3, step: 0.1 },
} as const;

/**
 * Narrow an arbitrary string — a stored preference, a picker's value — to a
 * representation.
 * @param value - Candidate representation id.
 * @returns True when it is one of {@link REPRESENTATIONS}.
 */
export function isRepresentationId(value: string): value is RepresentationId {
  for (const representation of REPRESENTATIONS) {
    if (representation === value) return true;
  }
  return false;
}

/**
 * Narrow an arbitrary string to a surface colouring.
 * @param value - Candidate colouring id.
 * @returns True when it is one of {@link SURFACE_COLORINGS}.
 */
export function isSurfaceColoringId(value: string): value is SurfaceColoringId {
  for (const coloring of SURFACE_COLORINGS) {
    if (coloring === value) return true;
  }
  return false;
}

/**
 * Complete and repair settings from any source: missing fields take their
 * default, numbers are clamped into {@link MOLECULE_3D_RANGES}, an unknown
 * representation, colouring or partial bond mode falls back to the default
 * one, and a colour that is not `#rrggbb` to its default.
 * @param settings - Whatever a site has, possibly read back from storage.
 * @returns Settings the viewer can draw.
 */
export function normalizeMolecule3DSettings(
  settings: Partial<Molecule3DSettings> = {},
): Molecule3DSettings {
  const defaults = DEFAULT_MOLECULE_3D_SETTINGS;
  const {
    representation,
    sizeFactor,
    bondSizeFactor,
    showSurface,
    surfaceAlpha,
    probeRadius,
    surfaceColoring,
    surfaceColor,
    partialBonds,
    partialBondLengths,
  } = settings;
  return {
    representation:
      typeof representation === 'string' && isRepresentationId(representation)
        ? representation
        : defaults.representation,
    sizeFactor: inRange(sizeFactor, 'sizeFactor'),
    bondSizeFactor: inRange(bondSizeFactor, 'bondSizeFactor'),
    showSurface:
      typeof showSurface === 'boolean' ? showSurface : defaults.showSurface,
    surfaceAlpha: inRange(surfaceAlpha, 'surfaceAlpha'),
    probeRadius: inRange(probeRadius, 'probeRadius'),
    surfaceColoring:
      typeof surfaceColoring === 'string' &&
      isSurfaceColoringId(surfaceColoring)
        ? surfaceColoring
        : defaults.surfaceColoring,
    surfaceColor: normalizeHexColor(surfaceColor) ?? defaults.surfaceColor,
    partialBonds: isPartialBondMode(partialBonds)
      ? partialBonds
      : defaults.partialBonds,
    partialBondLengths:
      typeof partialBondLengths === 'boolean'
        ? partialBondLengths
        : defaults.partialBondLengths,
  };
}

/**
 * The sizes a representation is drawn at once it is picked: the site's own
 * for the representation it opens on, the family's for the others. Sizes kept
 * across a switch would draw ball and stick picked after thin sticks with
 * balls thinner than its bonds.
 * @param representation - The representation picked.
 * @param defaults - The settings the viewer opened on.
 * @returns The atom and bond sizes to draw it at.
 */
export function representationSizes(
  representation: RepresentationId,
  defaults: Molecule3DSettings = DEFAULT_MOLECULE_3D_SETTINGS,
): Pick<Molecule3DSettings, 'sizeFactor' | 'bondSizeFactor'> {
  const { sizeFactor, bondSizeFactor } =
    defaults.representation === representation
      ? defaults
      : DEFAULT_MOLECULE_3D_SETTINGS;
  return { sizeFactor, bondSizeFactor };
}

/**
 * What the options' reset button returns to: the defaults, with the surface
 * left on or off as it is — that is the toolbar's toggle, not an option.
 * @param settings - The settings in force.
 * @param defaults - The settings the viewer opened on.
 * @returns The defaults, keeping `showSurface`.
 */
export function resetMolecule3DSettings(
  settings: Molecule3DSettings,
  defaults: Molecule3DSettings = DEFAULT_MOLECULE_3D_SETTINGS,
): Molecule3DSettings {
  return { ...defaults, showSurface: settings.showSurface };
}

/**
 * Whether two settings draw the same picture.
 * @param first - One settings record.
 * @param second - The other.
 * @returns True when every field is equal.
 */
export function sameMolecule3DSettings(
  first: Molecule3DSettings,
  second: Molecule3DSettings,
): boolean {
  return (
    first.representation === second.representation &&
    first.sizeFactor === second.sizeFactor &&
    first.bondSizeFactor === second.bondSizeFactor &&
    first.showSurface === second.showSurface &&
    first.surfaceAlpha === second.surfaceAlpha &&
    first.probeRadius === second.probeRadius &&
    first.surfaceColoring === second.surfaceColoring &&
    first.surfaceColor === second.surfaceColor &&
    first.partialBonds === second.partialBonds &&
    first.partialBondLengths === second.partialBondLengths
  );
}

function inRange(
  value: number | undefined,
  key: keyof typeof MOLECULE_3D_RANGES,
): number {
  const { minimum, maximum } = MOLECULE_3D_RANGES[key];
  return clamp(
    typeof value === 'number' ? value : Number.NaN,
    minimum,
    maximum,
    DEFAULT_MOLECULE_3D_SETTINGS[key],
  );
}
