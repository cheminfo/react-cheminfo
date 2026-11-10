/**
 * What one line of the fit table says.
 *
 * A component is a claim about chemistry rather than a feature of the data, and
 * a table of components is read to judge that claim: the two peaks under one
 * C 1s envelope are a C–C and a C–O carbon, and whether that decomposition is
 * believable is a question about their widths, their separation and the window
 * the background was drawn across — which is why the region a component was
 * fitted inside is on the row rather than a level up.
 *
 * Every number comes from the file. Nothing here recomputes an area, a width or
 * a sensitivity factor: the fit is the analyst's, and a table quietly showing
 * our arithmetic beside their label would be a different fit under their name.
 */

import type { XpsComponent, XpsRegion, XpsSpectrum } from './xpsSpectrum.ts';

/** One fitted component, with the window it was fitted inside. */
export interface ComponentRow {
  /** Identity of the component, which is what a hover reports. */
  componentId: string;
  /** What the fit calls it: `C 1s 1`, `Mo 3d MoS2 2H`. */
  label: string;
  /** Where it sits, in eV of binding energy. */
  bindingEnergy: number;
  /** Full width at half maximum, in eV. */
  fwhm: number;
  /** Area under it, in the file's own units. */
  area: number;
  /** The factor that area is divided by, `null` when the file states none. */
  relativeSensitivityFactor: number | null;
  /** The peak shape the fit used, as the file names it. */
  shape: string;
  /** What the region it belongs to is called, `null` when it belongs to none. */
  regionLabel: string | null;
  /** How the background under that region was drawn, `null` for none. */
  backgroundType: string | null;
}

/**
 * Turn the fit a spectrum carries into the rows a table draws.
 *
 * The order is the file's, which is the order the analyst built the fit in —
 * usually the main line and then its satellites — and re-sorting it by energy
 * would separate a doublet from the component that constrains it.
 * @param spectrum - The spectrum whose fit is listed.
 * @returns One row per component, in the order the file wrote them.
 */
export function buildComponentRows(spectrum: XpsSpectrum): ComponentRow[] {
  const regions = regionsById(spectrum.regions);
  const { components } = spectrum;

  const rows = new Array<ComponentRow>(components.length);
  for (let index = 0; index < components.length; index++) {
    const component = components[index] as XpsComponent;
    const region =
      component.regionId === null ? undefined : regions.get(component.regionId);
    rows[index] = {
      componentId: component.id,
      label: component.label,
      bindingEnergy: component.bindingEnergy,
      fwhm: component.fwhm,
      area: component.area,
      relativeSensitivityFactor: component.relativeSensitivityFactor,
      shape: component.shape,
      regionLabel: region === undefined ? null : region.label,
      backgroundType: region === undefined ? null : region.backgroundType,
    };
  }
  return rows;
}

/**
 * The total area the fit accounts for.
 *
 * Quoted above the table because a single component's area means nothing on its
 * own — the file's units are whatever the instrument counted in — while its
 * share of this total is the number the fit was made to produce.
 * @param rows - The rows of the fit.
 * @returns The sum of the areas, `0` for a spectrum carrying no fit.
 */
export function totalComponentArea(rows: readonly ComponentRow[]): number {
  let total = 0;
  for (const { area } of rows) {
    if (Number.isFinite(area)) total += area;
  }
  return total;
}

/**
 * The regions of a spectrum, reachable by the identity a component names.
 * @param regions - The windows the file defines a background under.
 * @returns The regions, keyed by their identity.
 */
function regionsById(regions: readonly XpsRegion[]): Map<string, XpsRegion> {
  const byId = new Map<string, XpsRegion>();
  for (const region of regions) byId.set(region.id, region);
  return byId;
}
