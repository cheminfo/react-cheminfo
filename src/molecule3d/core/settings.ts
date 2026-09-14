/**
 * The display settings of the 3D molecule viewer and the toolbar it carries,
 * free of React and molstar so a site can persist and validate them.
 */

/** A molfile for the viewer, with the parser molstar has to read it with. */
export interface Molecule3DFile {
  /** molstar's format id: `mol` reads V2000, `sdf` reads V2000 and V3000. */
  format: 'mol' | 'sdf';
  /** The molfile text. It must carry 3D coordinates. */
  data: string;
}

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
  /** Radius multiplier; 1 is the size each representation picks for itself. */
  sizeFactor: number;
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
  showSurface: false,
  surfaceAlpha: 0.5,
  probeRadius: 1.4,
  surfaceColoring: 'uniform',
  // A scene colour: WebGL cannot read a CSS custom property.
  surfaceColor: '#94a3b8', // tokens-ok
};

/** The span, and the slider step, of every numeric setting. */
export const MOLECULE_3D_RANGES = {
  sizeFactor: { minimum: 0.2, maximum: 2, step: 0.1 },
  surfaceAlpha: { minimum: 0.1, maximum: 1, step: 0.05 },
  probeRadius: { minimum: 1, maximum: 3, step: 0.1 },
} as const;

/** Which buttons the toolbar over the canvas shows. */
export interface Molecule3DTools {
  /** Distance, angle and dihedral tools, and a button removing them all. */
  measure: boolean;
  /** A popover with the representation, the size and the surface sliders. */
  options: boolean;
  /** A toggle turning the model on its own. */
  spin: boolean;
  /** A toggle drawing the molecular surface. */
  surface: boolean;
  /** A button framing the model again. */
  reset: boolean;
  /** A popover saving the picture as a PNG or an SVG. */
  export: boolean;
  /** A popover listing what the mouse and the keyboard do on the canvas. */
  help: boolean;
}

/** Every tool on. */
export const DEFAULT_MOLECULE_3D_TOOLS: Molecule3DTools = {
  measure: true,
  options: true,
  spin: true,
  surface: true,
  reset: true,
  export: true,
  help: true,
};

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
 * representation or colouring falls back to the default one, and a colour that
 * is not `#rrggbb` to its default.
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
    showSurface,
    surfaceAlpha,
    probeRadius,
    surfaceColoring,
    surfaceColor,
  } = settings;
  return {
    representation:
      typeof representation === 'string' && isRepresentationId(representation)
        ? representation
        : defaults.representation,
    sizeFactor: clamp(sizeFactor, 'sizeFactor'),
    showSurface:
      typeof showSurface === 'boolean' ? showSurface : defaults.showSurface,
    surfaceAlpha: clamp(surfaceAlpha, 'surfaceAlpha'),
    probeRadius: clamp(probeRadius, 'probeRadius'),
    surfaceColoring:
      typeof surfaceColoring === 'string' &&
      isSurfaceColoringId(surfaceColoring)
        ? surfaceColoring
        : defaults.surfaceColoring,
    surfaceColor: hexColor(surfaceColor, defaults.surfaceColor),
  };
}

/**
 * Complete a partial tool selection.
 * @param tools - The tools a site switched on or off.
 * @returns Every tool, those not named left on.
 */
export function resolveMolecule3DTools(
  tools: Partial<Molecule3DTools> = {},
): Molecule3DTools {
  return { ...DEFAULT_MOLECULE_3D_TOOLS, ...tools };
}

function hexColor(value: string | undefined, fallback: string): string {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value)
    ? value.toLowerCase()
    : fallback;
}

function clamp(
  value: number | undefined,
  key: keyof typeof MOLECULE_3D_RANGES,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_MOLECULE_3D_SETTINGS[key];
  }
  const { minimum, maximum } = MOLECULE_3D_RANGES[key];
  return Math.min(Math.max(value, minimum), maximum);
}
