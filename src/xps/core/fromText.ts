/**
 * Read two columns of numbers — pasted, dropped, or copied out of a report.
 *
 * `xy-parser` guesses the separator and skips whatever acquisition table the
 * instrument report put above the numbers. That tolerance is the point of the
 * format and also its trap: some rubbish it refuses with a message of its own,
 * and the rest it answers with two empty arrays, so neither the absence of an
 * error nor its presence says anything useful on its own. The point count is
 * the real guard.
 *
 * A pasted list says nothing about how it was acquired, and that includes the
 * photon energy — so unless the caller states one, the spectrum keeps the
 * axis it was pasted on and no conversion is offered. Assuming an Al Kα source
 * to make the other axis appear would be 1486 eV of arithmetic done on a guess.
 */

import { xySortX } from 'ml-spectra-processing';
import { parseXY } from 'xy-parser';

import { nextSpectrumColor } from '../../chart/core/spectrumColor.ts';

import { convertEnergyAxis, isUsableSourceEnergy } from './energy.ts';
import type { XpsReadOptions } from './readOptions.ts';
import { describeSource, spectrumIdentity } from './readOptions.ts';
import type { XpsOrigin, XpsSpectrum, XpsTrace } from './xpsSpectrum.ts';

/** How two columns of numbers are read. */
export interface TextReadOptions extends XpsReadOptions {
  /**
   * What to call the spectrum, for a paste that has no file name.
   * @default undefined
   */
  name?: string;
  /**
   * The photon energy in eV the list was measured with, when the caller knows
   * it and the file could not say. It is what the kinetic axis is computed
   * from; without it the spectrum carries the one axis it was given.
   * @default undefined
   */
  sourceEnergy?: number;
}

/** The fewest points a list has to hold to be a spectrum. */
const MINIMUM_POINTS = 2;

/**
 * Read a two-column list into one spectrum.
 *
 * Returns an array of one so a caller can treat it exactly like the readers
 * that genuinely produce several, rather than branching on which reader ran.
 * @param data - The list, as bytes or as text.
 * @param options - What it was called, and what is already on the chart.
 * @returns The one spectrum it holds.
 * @throws {Error} When fewer than two points could be read.
 */
export function readText(
  data: ArrayBuffer | Uint8Array | string,
  options: TextReadOptions = {},
): XpsSpectrum[] {
  const { fileName, name, taken } = options;
  const parsed = readColumns(data);
  if (parsed === null || parsed.x.length < MINIMUM_POINTS) {
    throw new Error(
      `${describeSource(fileName)} holds no readable spectrum — two columns of numbers are expected, energy in eV then counts, one pair to a line, at least ${MINIMUM_POINTS} pairs in all.`,
    );
  }

  const energy = xySortX(parsed);
  const sourceEnergy = isUsableSourceEnergy(options.sourceEnergy)
    ? options.sourceEnergy
    : null;
  const origin: XpsOrigin = { format: 'text' };
  if (fileName !== undefined) origin.fileName = fileName;

  return [
    {
      id: spectrumIdentity(options, 0),
      name: name ?? fileName ?? 'Pasted spectrum',
      color: nextSpectrumColor(taken ?? []),
      energy,
      kinetic: kineticTrace(energy, sourceEnergy),
      sourceEnergy,
      transition: {
        name: 'Spectrum',
        element: null,
        shell: null,
        angularMomentum: null,
        augerElement: null,
        augerTransition: null,
      },
      peaks: [],
      components: [],
      regions: [],
      meta: null,
      origin,
      visible: true,
    },
  ];
}

/**
 * The two columns, if the text holds two columns.
 *
 * `xy-parser` refuses a paragraph of prose with `input must not be empty`,
 * which is true of its own internal state and says nothing to the person who
 * pasted something. It is turned back into the same absence an unparsable table
 * produces, so one sentence answers both.
 * @param data - The list, as bytes or as text.
 * @returns The points, or `null` when none could be read.
 */
function readColumns(
  data: ArrayBuffer | Uint8Array | string,
): { x: number[]; y: number[] } | null {
  try {
    return parseXY(data);
  } catch {
    return null;
  }
}

/**
 * The kinetic trace, when the caller stated what to compute it from.
 * @param energy - The trace as it was pasted, x ascending.
 * @param sourceEnergy - The photon energy, `null` when nobody stated one.
 * @returns The other axis, or `null` when there is nothing to convert with.
 */
function kineticTrace(
  energy: XpsTrace,
  sourceEnergy: number | null,
): XpsTrace | null {
  if (!isUsableSourceEnergy(sourceEnergy)) return null;
  return { x: convertEnergyAxis(energy.x, sourceEnergy), y: energy.y };
}
