/**
 * Which of the two energy axes the chart is drawn against, and what everything
 * on it reads there.
 *
 * The setting asks for one; the spectra decide whether it can be had. A file
 * that states no photon energy — an Auger spectrum taken without a
 * monochromator is the usual one — has no binding axis at all: its `energy`
 * already holds kinetic energy, and pretending otherwise would put every peak
 * `hν` eV from where it belongs. So the answer here is not `settings.energyAxis`
 * read back, it is what the spectra will actually support.
 *
 * Everything else in the chart speaks **axis energy** — the number the x scale
 * maps — and converts on the way in and on the way out through this module. That
 * is what lets the domain, the drag that zooms it and the crosshair all be one
 * arithmetic while the highlight, the tables and the panels beside them stay on
 * binding energy, which is what a peak is published in.
 */

import {
  isUsableSourceEnergy,
  toBindingEnergy,
  toKineticEnergy,
} from './energy.ts';
import type { XpsSpectrum, XpsTrace } from './xpsSpectrum.ts';
import type { EnergyAxis, XpsSettings } from './xpsState.ts';

/**
 * The axis the chart will actually draw.
 *
 * Binding energy is what the setting asks for and what a spectrum is published
 * in, but it is refused when nothing on the chart can be converted to it:
 * spectra whose files state no photon energy are already on the kinetic axis,
 * and labelling that axis "Binding energy" would be a caption asserting a
 * conversion nobody performed.
 *
 * A chart holding nothing follows the setting, so an empty viewer's axis does
 * not flip the moment the first file lands on it.
 * @param spectra - Everything the chart holds, drawn or not.
 * @param settings - How the spectra are drawn.
 * @returns The axis the scales are built for.
 */
export function chartEnergyAxis(
  spectra: readonly XpsSpectrum[],
  settings: XpsSettings,
): EnergyAxis {
  if (settings.energyAxis === 'kinetic') return 'kinetic';
  let drawn = false;
  for (const spectrum of spectra) {
    if (!spectrum.visible) continue;
    drawn = true;
    if (hasBindingAxis(spectrum)) return 'binding';
  }
  return drawn ? 'kinetic' : 'binding';
}

/**
 * Whether a spectrum's `energy` really is binding energy.
 *
 * Two ways it can be. A measured block states the photon energy it was taken
 * with, and the reader converted; a **calculated** spectrum was never measured
 * at all, and the binding energies it holds are what the calculation produced —
 * there is no photon and no kinetic axis to convert from. Reading a missing
 * source energy as "this is kinetic" is right for the first kind and wrong for
 * the second, which is why the format is asked as well.
 * @param spectrum - The spectrum.
 * @returns Whether its `energy` is binding energy.
 */
export function hasBindingAxis(spectrum: XpsSpectrum): boolean {
  if (spectrum.origin.format === 'calculated') return true;
  return isUsableSourceEnergy(spectrum.sourceEnergy);
}

/**
 * The photon energy the chart converts with when it has no spectrum in hand.
 *
 * The crosshair reading out a place on the axis, the guide standing on a
 * highlighted energy and the click that hands a panel an energy to look up all
 * need to move between the two conventions without belonging to any one
 * spectrum. The first usable source energy on the chart is what they use, which
 * is right whenever the spectra came off one instrument — a VAMAS file holds one
 * experiment, so they nearly always did — and is the only answer available when
 * they did not.
 * @param spectra - Everything the chart holds, drawn or not.
 * @returns The photon energy in eV, `null` when no drawn spectrum states one.
 */
export function chartSourceEnergy(
  spectra: readonly XpsSpectrum[],
): number | null {
  for (const spectrum of spectra) {
    if (!spectrum.visible) continue;
    const { sourceEnergy } = spectrum;
    if (isUsableSourceEnergy(sourceEnergy)) return sourceEnergy;
  }
  return null;
}

/**
 * The trace of a spectrum on the axis being drawn.
 *
 * A spectrum with no source energy answers with its `energy` whichever axis is
 * asked for, because that array already holds kinetic energy and there is no
 * second one to hand back. On a chart where some spectra state a source and
 * others do not, that is the one place the two conventions meet — and it is the
 * honest outcome, since a trace that cannot be converted has to be drawn where
 * it was measured.
 *
 * Note that `kinetic.x` runs the other way: converting an ascending binding axis
 * subtracts it from the photon energy, which reverses the order. Anything
 * walking it must therefore not assume x ascends.
 * @param spectrum - The spectrum being drawn.
 * @param axis - The axis the chart is drawn against.
 * @returns The trace to draw, never a copy.
 */
export function axisTrace(spectrum: XpsSpectrum, axis: EnergyAxis): XpsTrace {
  if (axis === 'kinetic') return spectrum.kinetic ?? spectrum.energy;
  return spectrum.energy;
}

/**
 * Where a binding energy sits on the axis being drawn.
 * @param bindingEnergy - The energy in eV, as a peak or a component records it.
 * @param sourceEnergy - The photon energy in eV, `null` when none is known.
 * @param axis - The axis the chart is drawn against.
 * @returns The same place, in the units the x scale maps.
 */
export function axisEnergy(
  bindingEnergy: number,
  sourceEnergy: number | null,
  axis: EnergyAxis,
): number {
  if (axis === 'kinetic' && isUsableSourceEnergy(sourceEnergy)) {
    return toKineticEnergy(bindingEnergy, sourceEnergy);
  }
  return bindingEnergy;
}

/**
 * The binding energy a place on the axis stands for.
 *
 * The inverse of `axisEnergy`, and the direction every gesture travels: a click
 * and a crosshair both land on a pixel, and what a panel is handed has to be the
 * energy a peak is published in.
 * @param energy - The energy in eV, in the units the x scale maps.
 * @param sourceEnergy - The photon energy in eV, `null` when none is known.
 * @param axis - The axis the chart is drawn against.
 * @returns The binding energy in eV, unchanged when no conversion is possible.
 */
export function bindingFromAxis(
  energy: number,
  sourceEnergy: number | null,
  axis: EnergyAxis,
): number {
  if (axis === 'kinetic' && isUsableSourceEnergy(sourceEnergy)) {
    return toBindingEnergy(energy, sourceEnergy);
  }
  return energy;
}

/**
 * Whether the axis is drawn backwards.
 *
 * Binding energy alone: every published XPS spectrum runs it from high on the
 * left to low on the right, and a chart that drew it the other way would be read
 * wrong before anybody noticed why. Kinetic energy is drawn the ordinary way up,
 * which is also the order the electron analyser swept it in.
 * @param axis - The axis the chart is drawn against.
 * @returns Whether the lowest energy of the window sits at the right edge.
 */
export function isAxisReversed(axis: EnergyAxis): boolean {
  return axis === 'binding';
}

/**
 * What the horizontal axis is called.
 * @param axis - The axis the chart is drawn against.
 * @returns The title, with its unit.
 */
export function axisTitle(axis: EnergyAxis): string {
  return axis === 'kinetic' ? 'Kinetic energy (eV)' : 'Binding energy (eV)';
}

/**
 * What the vertical axis is called.
 * @param normalise - Whether each trace is drawn against its own maximum.
 * @returns The title.
 */
export function countsTitle(normalise: boolean): string {
  return normalise ? 'Normalised counts' : 'Counts';
}
