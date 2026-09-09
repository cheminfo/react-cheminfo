import { AXIS_ENTRIES } from './axisEntries.ts';
import type { FilterCatalogEntry } from './filterEntries.ts';
import { BASELINE_ENTRIES, SIGNAL_ENTRIES } from './filterEntries.ts';
import type { FilterGroup } from './filterFields.ts';
import { FILTER_GROUPS } from './filterFields.ts';
import type { SpectrumFilterName } from './settings.ts';

/**
 * What the editor knows about every step `filterXY` dispatches.
 *
 * Keyed by the name rather than listed, so the day `ml-signal-processing` adds
 * a filter this object stops compiling and the gap is a build failure instead
 * of a step nobody can reach.
 */
export const FILTER_CATALOG: Readonly<
  Record<SpectrumFilterName, FilterCatalogEntry>
> = {
  ...BASELINE_ENTRIES,
  ...SIGNAL_ENTRIES,
  ...AXIS_ENTRIES,
};

/** Every step name, in the order the menu offers them. */
export const FILTER_NAMES: readonly SpectrumFilterName[] = Object.keys(
  FILTER_CATALOG,
) as SpectrumFilterName[];

/**
 * What the editor knows about one step.
 * @param name - The step's name.
 * @returns Its catalog entry.
 */
export function filterEntry(name: SpectrumFilterName): FilterCatalogEntry {
  return FILTER_CATALOG[name];
}

/**
 * What the editor knows about a step whose name it may not recognise.
 *
 * The settings the processor accepts are typed `{ name: string }`, and
 * `filterXY` really does dispatch four more names than the union declares, so a
 * chain reaching the editor can name a step the catalog has never heard of.
 * Answering nothing lets the panel say so; throwing would take the whole page
 * down over one row.
 * @param name - The step's name, from settings that may come from anywhere.
 * @returns Its catalog entry, or undefined when the name is not one of the 23.
 */
export function findFilterEntry(name: string): FilterCatalogEntry | undefined {
  return Object.hasOwn(FILTER_CATALOG, name)
    ? FILTER_CATALOG[name as SpectrumFilterName]
    : undefined;
}

/**
 * How the panel labels one step of a chain, whether or not it knows the step.
 * @param name - The step's name.
 * @param position - Where it sits, counting from zero.
 * @returns The label the row and every problem about it share.
 */
export function filterStepLabel(name: string, position: number): string {
  return `Step ${String(position + 1)} — ${findFilterEntry(name)?.label ?? name}`;
}

/**
 * The steps of one group, in menu order.
 * @param group - Which part of the signal the steps work on.
 * @returns Their names.
 */
export function filterNamesInGroup(
  group: FilterGroup,
): readonly SpectrumFilterName[] {
  const names: SpectrumFilterName[] = [];
  for (const name of FILTER_NAMES) {
    if (FILTER_CATALOG[name].group === group) names.push(name);
  }
  return names;
}

/**
 * The whole menu, group by group, skipping a group that holds nothing.
 *
 * The 23 steps are unreadable as one list, and grouping them by what they touch
 * is the same order a chain is usually built in: level the baseline, smooth,
 * scale, then move the axis.
 * @returns Each group with its steps.
 */
export function filterMenu(): ReadonlyArray<{
  group: FilterGroup;
  names: readonly SpectrumFilterName[];
}> {
  const menu: Array<{
    group: FilterGroup;
    names: readonly SpectrumFilterName[];
  }> = [];
  for (const group of FILTER_GROUPS) {
    const names = filterNamesInGroup(group);
    if (names.length > 0) menu.push({ group, names });
  }
  return menu;
}
