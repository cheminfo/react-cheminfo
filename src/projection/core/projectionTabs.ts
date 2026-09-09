import type { ProjectionAxis, ProjectionResult } from './projectionResult.ts';

/** Which tab of a projection viewer is showing. The ids are stable, so a site may put one in its own URL. */
export type ProjectionTab = 'map' | 'pairs' | 'variables' | 'shares';

const PAIRS_MINIMUM_AXES = 3;

/**
 * The tabs a result can actually fill.
 *
 * A tab is offered because the data for it exists, never because a caller
 * remembered to ask. That is what stops a UMAP viewer from showing an empty
 * "how much each explains" tab, and it makes a new method a data shape rather
 * than a code change — there is no place in the viewer where a method's name
 * is tested. The map always exists, so the answer is never empty; the shares
 * tab needs three axes as well as a share on each, because a two-bar chart is
 * not worth a tab.
 * A site embedding the viewer in a page of its own may narrow the answer with
 * `allowed`, which is the one thing that is a caller's business rather than the
 * data's: a page that only has room for the map, or that has already explained
 * the components in its own prose, says so. It can only ever take tabs away —
 * naming one the result cannot fill does not conjure it.
 * @param result - The reduced space.
 * @param allowed - The tabs the site permits, in any order.
 * @returns The tabs, in reading order. Never empty: the map survives every
 * filter, because a viewer with no panel at all is not a viewer.
 */
export function projectionTabs(
  result: ProjectionResult,
  allowed?: readonly ProjectionTab[],
): ProjectionTab[] {
  const tabs: ProjectionTab[] = ['map'];
  const enoughAxes = result.axes.length >= PAIRS_MINIMUM_AXES;

  if (enoughAxes) tabs.push('pairs');
  if (result.loadings !== undefined) tabs.push('variables');
  if (enoughAxes && everyAxisPublishesAShare(result.axes)) tabs.push('shares');
  if (allowed === undefined) return tabs;

  const permitted = new Set(allowed);
  const kept: ProjectionTab[] = [];
  for (const tab of tabs) {
    if (permitted.has(tab)) kept.push(tab);
  }
  return kept.length === 0 ? ['map'] : kept;
}

function everyAxisPublishesAShare(axes: readonly ProjectionAxis[]): boolean {
  for (const axis of axes) {
    const { share } = axis;
    // One axis without a share is enough: a running total with a hole in it
    // reads as a total, and would be wrong by however much the hole holds.
    if (share === undefined || !Number.isFinite(share)) return false;
  }
  return true;
}
