/**
 * Everything that differs between an infrared spectrum and a Raman one.
 *
 * Both are vibrational spectra over wavenumbers in cm⁻¹, and the viewer reads
 * them the same way — one chart, one set of panels, one set of gestures — so
 * what is left to differ is a handful of facts: which value axes a spectrum is
 * read on, what the horizontal axis is called and which way it runs, whether the
 * correlation table has anything to say about a band, and what a written file
 * calls itself. They are gathered here for the reason `IR_MODE_RULES` gathers
 * what differs between the value axes: a component that asked which technique
 * it was drawing would be the first of many to ask, and they would come to
 * disagree.
 */

import type { IrMode } from './irSpectrum.ts';

/** What was measured: the light a sample absorbs, or the light it scatters. */
export type IrTechnique = 'infrared' | 'raman';

/** What is true of one technique. */
export interface IrTechniqueRules {
  /** How it is written inside a sentence; a sentence opening on it capitalises it. */
  name: string;
  /** The value axes a spectrum is read on, in the order a control offers them. */
  modes: readonly IrMode[];
  /** What the horizontal axis is called. */
  xTitle: string;
  /** Whether the horizontal axis runs from high at the left to low at the right. */
  reverseX: boolean;
  /** Whether the correlation table is asked what a band might be. */
  assignments: boolean;
  /** The `##DATA TYPE=` a written spectrum states when its file stated none. */
  dataType: string;
}

/** The techniques, in the order a control would offer them. */
export const IR_TECHNIQUES: readonly IrTechnique[] = ['infrared', 'raman'];

/** How each technique behaves, every fact in one place. */
export const IR_TECHNIQUE_RULES = {
  infrared: {
    name: 'infrared',
    modes: ['transmittance', 'absorbance'],
    xTitle: 'wavenumber (cm⁻¹)',
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
 * The technique that reads its spectra on a value axis.
 *
 * Every axis belongs to exactly one technique, so the axis a file was written
 * on says what was measured.
 * @param mode - The value axis.
 * @returns The technique offering it.
 */
export function irModeTechnique(mode: IrMode): IrTechnique {
  return offersIrMode('raman', mode) ? 'raman' : 'infrared';
}
