/**
 * The fit somebody made, as the viewer holds it.
 *
 * CasaXPS writes its work into the VAMAS block comment: the components an
 * envelope was resolved into, and the regions a background was drawn under.
 * `xps-analysis` has already picked that comment apart and converted every
 * position onto the binding axis, so nothing here refits or reinterprets
 * anything — it copies the file's own numbers into the shape the viewer
 * reads, and drops what the file did not state rather than substituting one.
 *
 * Two of those numbers are the whole reason the fit is worth keeping. The area
 * and the sensitivity factor beside it are what a composition is computed from,
 * and both come out of the file: a table of our own would be another
 * laboratory's factors quietly standing in for the ones the quantification was
 * actually done with.
 */

import type { CasaComponent, CasaRegion, NormalisedMeta } from 'xps-analysis';

import { isUsableSourceEnergy, toBindingEnergy } from './energy.ts';
import type { XpsComponent, XpsRegion } from './xpsSpectrum.ts';

/**
 * The windows the block defines a background under.
 *
 * A region the file left unparameterised is left out rather than given bounds
 * of our own: the region is drawn as a shaded band across the chart, and a band
 * over a window nobody defined is a claim about where a background was taken
 * that the file never made.
 * @param normalised - The normalised view of the block's records.
 * @param sourceEnergy - The photon energy, `null` when the file states none.
 * @returns The regions, in the order the file wrote them.
 */
export function fitRegions(
  normalised: NormalisedMeta,
  sourceEnergy: number | null,
): XpsRegion[] {
  const regions: XpsRegion[] = [];
  for (let index = 0; index < normalised.regions.length; index++) {
    const region = normalised.regions[index] as CasaRegion;
    const bounds = regionBounds(region, sourceEnergy);
    if (bounds === null) continue;
    regions.push({
      id: `region-${index}`,
      label: region.regionID || region.block?.regionBlockID || 'Region',
      backgroundType: region.background?.type ?? 'None',
      from: bounds.from,
      to: bounds.to,
      relativeSensitivityFactor:
        region.block?.relativeSensitivityFactor ?? null,
      atomicMass: region.block?.atomicMass ?? null,
    });
  }
  return regions;
}

/**
 * The peaks the block was fitted with.
 *
 * The identity is the position in the fit rather than the name, because the
 * name is not unique: a spin-orbit doublet is written as two components called
 * `Mo 3d MoS2 2H`, and half of a 3d envelope disappearing from a table is the
 * kind of bug that is only noticed when somebody adds the percentages up.
 * @param normalised - The normalised view of the block's records.
 * @param regions - The regions already built, for the components to be tied to.
 * @param sourceEnergy - The photon energy, `null` when the file states none.
 * @returns The components, in the order the file wrote them.
 */
export function fitComponents(
  normalised: NormalisedMeta,
  regions: XpsRegion[],
  sourceEnergy: number | null,
): XpsComponent[] {
  const components: XpsComponent[] = [];
  for (let index = 0; index < normalised.components.length; index++) {
    const component = normalised.components[index] as CasaComponent;
    const position = componentPosition(component, sourceEnergy);
    components.push({
      id: `component-${index}`,
      label:
        component.componentID || component.assignment || `Peak ${index + 1}`,
      bindingEnergy: position.binding,
      kineticEnergy: position.kinetic,
      area: component.area.value,
      fwhm: component.fwhm.value,
      shape: component.shape?.kind ?? 'unknown',
      relativeSensitivityFactor: component.relativeSensitivityFactor ?? null,
      atomicMass: component.atomicMass ?? null,
      regionId: regionOf(regions, position.binding),
    });
  }
  return components;
}

/**
 * Where a region sits on the axis the spectrum is drawn on, low bound first.
 *
 * The binding bounds are preferred where the file converted them, and the
 * kinetic ones are converted where it did not. Which way round they come out is
 * not fixed: CASA states a region from its low kinetic energy upwards, so the
 * conversion turns its start into the higher of the two, and every consumer
 * would otherwise have to know that.
 * @param region - The region as the file states it.
 * @param sourceEnergy - The photon energy, `null` when the file states none.
 * @returns The bounds, or `null` when the file parameterised neither pair.
 */
function regionBounds(
  region: CasaRegion,
  sourceEnergy: number | null,
): { from: number; to: number } | null {
  const parameters = region.background?.parameters;
  if (parameters === undefined) return null;

  const kineticStart = parameters.kineticEnergyStart?.value;
  const kineticEnd = parameters.kineticEnergyEnd?.value;
  if (!isUsableSourceEnergy(sourceEnergy)) {
    // No photon energy is no binding axis: the spectrum is drawn on the kinetic
    // one, and the region has to be stated on the axis it will be drawn over.
    return ordered(kineticStart, kineticEnd);
  }

  const stated = ordered(
    parameters.bindingEnergyStart?.value,
    parameters.bindingEnergyEnd?.value,
  );
  if (stated !== null) return stated;
  if (kineticStart === undefined || kineticEnd === undefined) return null;
  return ordered(
    toBindingEnergy(kineticStart, sourceEnergy),
    toBindingEnergy(kineticEnd, sourceEnergy),
  );
}

/**
 * Where a component sits, on the axis the spectrum is drawn on.
 *
 * A block whose photon energy is unknown is drawn on kinetic energy, and its
 * components are placed on that same axis — the alternative is a component
 * plotted at `0 − kinetic`, which is off the chart by twice the energy of the
 * line it was fitted to.
 * @param component - The component as the file states it.
 * @param sourceEnergy - The photon energy, `null` when the file states none.
 * @returns Its position, and its kinetic position where there is a binding one.
 */
function componentPosition(
  component: CasaComponent,
  sourceEnergy: number | null,
): { binding: number; kinetic: number | null } {
  const kinetic = component.kineticEnergy?.value ?? component.position.value;
  if (!isUsableSourceEnergy(sourceEnergy)) {
    return { binding: kinetic, kinetic: null };
  }
  const binding =
    component.bindingEnergy?.value ?? toBindingEnergy(kinetic, sourceEnergy);
  return { binding, kinetic };
}

/**
 * The region a component was fitted inside.
 *
 * A component states no region of its own, so it is placed by where it sits.
 * The single region of a block claims every component in it even when one was
 * fitted a little outside its bounds, which happens whenever a tail is
 * accounted for by a peak the background window does not quite reach.
 * @param regions - The regions of the block.
 * @param bindingEnergy - Where the component sits, on the drawn axis.
 * @returns The region's identity, or `null` when none can be said to hold it.
 */
function regionOf(regions: XpsRegion[], bindingEnergy: number): string | null {
  for (const region of regions) {
    if (bindingEnergy >= region.from && bindingEnergy <= region.to) {
      return region.id;
    }
  }
  return regions.length === 1 ? (regions[0] as XpsRegion).id : null;
}

/**
 * A pair of bounds, lower one first.
 * @param first - One bound, `undefined` when the file states none.
 * @param second - The other.
 * @returns The bounds in order, or `null` when either is missing.
 */
function ordered(
  first: number | undefined,
  second: number | undefined,
): { from: number; to: number } | null {
  if (first === undefined || second === undefined) return null;
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  return { from: Math.min(first, second), to: Math.max(first, second) };
}
