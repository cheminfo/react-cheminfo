/**
 * Colours for orbital phases and nodal surfaces.
 *
 * Plain data: the renderer picks a palette, this module says what the hex
 * values are. Two phase palettes ship, and both are first-class — around 8% of
 * male students have a red/green or red/blue-at-low-luminance deficiency, so
 * the blue/yellow pair is a supported choice, not a fallback.
 */

/** Which pair of phase colours the viewer uses. */
export type PhasePaletteId = 'textbook' | 'colourBlindSafe';

/** The colours one phase palette provides. */
export interface PhasePalette {
  id: PhasePaletteId;
  /** Name shown in the palette picker. */
  label: string;
  /** Lobe where the wavefunction is positive. */
  positive: string;
  /** Lobe where the wavefunction is negative. */
  negative: string;
  /** Lobe drawn with the `phase` display flag off. */
  neutral: string;
  /** Translucent disc marking a nodal plane. */
  node: string;
}

/**
 * The two phase palettes.
 *
 * `textbook` is the blue/red of printed MO diagrams and of Jmol's signed
 * isosurfaces; `colourBlindSafe` swaps the negative lobe for the amber of the
 * Okabe-Ito qualitative palette, which stays separable under protanopia,
 * deuteranopia and tritanopia.
 */
export const PHASE_PALETTES: Record<PhasePaletteId, PhasePalette> = {
  textbook: {
    id: 'textbook',
    label: 'Blue / red (textbook)',
    positive: '#2563eb',
    negative: '#dc2626',
    neutral: '#9ca3af',
    node: '#64748b',
  },
  colourBlindSafe: {
    id: 'colourBlindSafe',
    label: 'Blue / yellow (colour-blind safe)',
    positive: '#0072b2',
    negative: '#e69f00',
    neutral: '#9ca3af',
    node: '#56606b',
  },
};

/** Palette used until the student picks another one. */
export const DEFAULT_PHASE_PALETTE_ID: PhasePaletteId = 'textbook';
