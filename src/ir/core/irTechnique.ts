/**
 * Everything that differs between an infrared spectrum, a Raman one and a
 * UV-vis one.
 *
 * The viewer reads all three the same way — one chart, one set of panels, one
 * set of gestures — so what is left to differ is a handful of facts: which value
 * axes a spectrum is read on, what the horizontal axis is called, in which unit
 * and which way it runs, whether the correlation table has anything to say
 * about a band, and what a written file calls itself. They are gathered here for
 * the reason `IR_MODE_RULES` gathers what differs between the value axes: a
 * component that asked which technique it was drawing would be the first of many
 * to ask, and they would come to disagree.
 *
 * The horizontal position of a point and of a band is held as `wavenumber`
 * whatever the technique, as the Raman shift already is: for a UV-vis spectrum
 * it is a wavelength in nanometres, and `unit` says so wherever it is written.
 */

import type { IrMode } from './irSpectrum.ts';

/**
 * What was measured: the infrared light a sample absorbs, the light it
 * scatters, or the ultraviolet and visible light it absorbs.
 */
export type IrTechnique = 'infrared' | 'raman' | 'uvvis';

/** What is true of one technique. */
export interface IrTechniqueRules {
  /** How it is written inside a sentence; a sentence opening on it capitalises it. */
  name: string;
  /** The value axes a spectrum is read on, in the order a control offers them. */
  modes: readonly IrMode[];
  /** What the horizontal axis is called. */
  xTitle: string;
  /** The unit of the horizontal axis, as it is written after a number. */
  unit: string;
  /** The `##XUNITS=` a written spectrum states. */
  jcampXUnits: string;
  /** Whether the horizontal axis runs from high at the left to low at the right. */
  reverseX: boolean;
  /** Whether the correlation table is asked what a band might be. */
  assignments: boolean;
  /** The `##DATA TYPE=` a written spectrum states when its file stated none. */
  dataType: string;
}

/** The techniques, in the order a control would offer them. */
export const IR_TECHNIQUES: readonly IrTechnique[] = [
  'infrared',
  'raman',
  'uvvis',
];

/** How each technique behaves, every fact in one place. */
export const IR_TECHNIQUE_RULES = {
  infrared: {
    name: 'infrared',
    modes: ['transmittance', 'absorbance'],
    xTitle: 'wavenumber (cm⁻¹)',
    unit: 'cm⁻¹',
    jcampXUnits: '1/CM',
    /**
     * 4000 at the left and 400 at the right, which is how every infrared
     * spectrum has been printed since the instruments scanned that way.
     */
    reverseX: true,
    assignments: true,
    dataType: 'INFRARED SPECTRUM',
  },
  raman: {
    name: 'Raman',
    /** One axis: a Raman spectrum is the light scattered, and nothing else. */
    modes: ['intensity'],
    xTitle: 'Raman shift (cm⁻¹)',
    unit: 'cm⁻¹',
    jcampXUnits: '1/CM',
    /** The shift grows away from the laser line, left to right. */
    reverseX: false,
    /**
     * The table holds infrared group frequencies and infrared strengths. A
     * vibration strong in one technique is often weak or silent in the other,
     * so its candidates offered for a Raman band would claim what the table
     * does not know.
     */
    assignments: false,
    dataType: 'RAMAN SPECTRUM',
  },
  uvvis: {
    name: 'UV-vis',
    /**
     * Absorbance first: a UV-vis spectrum is read for its maxima, and the
     * Beer–Lambert law a chemist applies to them is written in absorbance.
     */
    modes: ['absorbance', 'transmittance'],
    xTitle: 'wavelength (nm)',
    unit: 'nm',
    jcampXUnits: 'NANOMETERS',
    /** The wavelength grows left to right, from the ultraviolet to the red. */
    reverseX: false,
    /** The table holds infrared group frequencies, which say nothing here. */
    assignments: false,
    dataType: 'UV/VIS SPECTRUM',
  },
} as const satisfies Record<IrTechnique, IrTechniqueRules>;

/**
 * The value axis a viewer of a technique opens on.
 * @param technique - What was measured.
 * @returns Its first mode.
 */
export function defaultIrMode(technique: IrTechnique): IrMode {
  return IR_TECHNIQUE_RULES[technique].modes[0];
}

/**
 * Whether a technique reads its spectra on a value axis.
 * @param technique - What was measured.
 * @param mode - The axis asked about; `undefined` is offered by none.
 * @returns Whether the technique offers it.
 */
export function offersIrMode(
  technique: IrTechnique,
  mode: IrMode | undefined,
): mode is IrMode {
  if (mode === undefined) return false;
  const modes: readonly IrMode[] = IR_TECHNIQUE_RULES[technique].modes;
  return modes.includes(mode);
}

/**
 * The value axis to read a technique's spectra on, given the one asked for.
 * @param technique - What was measured.
 * @param mode - The axis asked for, if any.
 * @returns It when the technique offers it, the technique's first otherwise.
 */
export function irModeFor(technique: IrTechnique, mode?: IrMode): IrMode {
  return offersIrMode(technique, mode) ? mode : defaultIrMode(technique);
}

/**
 * The first technique, in the order of `IR_TECHNIQUES`, that reads its spectra
 * on a value axis.
 *
 * Absorbance and transmittance are read by both infrared and UV-vis, so this
 * names infrared for them; it is a default for a caller that knows nothing
 * more, and every caller that knows its technique passes it instead.
 * @param mode - The value axis.
 * @returns The first technique offering it.
 */
export function irModeTechnique(mode: IrMode): IrTechnique {
  for (const technique of IR_TECHNIQUES) {
    if (offersIrMode(technique, mode)) return technique;
  }
  return 'infrared';
}
