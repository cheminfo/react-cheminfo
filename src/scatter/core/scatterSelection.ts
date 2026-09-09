/** How a fresh set of hits joins the selection that is already on screen. */
export type ScatterSelectionMode = 'replace' | 'add' | 'remove';

/**
 * The selection a gesture leaves behind, from the one before it and its hits.
 *
 * The result is always as long as `base`, because that is the cloud's own
 * length and the only length a selection is meaningful at. A `hits` mask that
 * is short leaves the points past its end untouched — an honest reading of "no
 * hit there" — rather than throwing at the end of a drag.
 *
 * Every entry written is `0` or `1`, so a mask that has been through this
 * function can be compared with `toStrictEqual` and handed to a renderer that
 * only checks for truthiness, whatever the caller filled its input with.
 * @param base - The selection before the gesture, one entry per point.
 * @param hits - The points the gesture caught, one entry per point; a non-zero entry is a hit.
 * @param mode - Whether the hits stand alone, join the selection, or leave it.
 * @param into - A mask to write into, so a drag does not allocate one per frame. It is used only when it already has one entry per point; otherwise a new one is allocated.
 * @returns The new selection, one `0` or `1` per point.
 */
export function mergeScatterSelection(
  base: Uint8Array,
  hits: Uint8Array,
  mode: ScatterSelectionMode,
  into?: Uint8Array,
): Uint8Array {
  const total = base.length;
  const merged = into?.length === total ? into : new Uint8Array(total);

  const replacing = mode === 'replace';
  const removing = mode === 'remove';
  for (let index = 0; index < total; index++) {
    const previous = base[index];
    const hit = hits[index];
    const wasSelected = previous !== undefined && previous !== 0;
    const isHit = hit !== undefined && hit !== 0;
    let selected: boolean;
    if (replacing) selected = isHit;
    else if (removing) selected = wasSelected && !isHit;
    else selected = wasSelected || isHit;
    merged[index] = selected ? 1 : 0;
  }
  return merged;
}

/**
 * Which points a mask has selected, as their indices.
 *
 * The list is what a caller reports, serialises or hands to a table, so it is
 * a plain array of numbers and not a third mask; it comes out ascending
 * because the mask is read in order.
 * @param mask - One entry per point; a non-zero entry is selected.
 * @returns The selected indices, ascending.
 */
export function scatterSelectedIndices(mask: Uint8Array): number[] {
  const indices: number[] = [];
  for (let index = 0; index < mask.length; index++) {
    const flag = mask[index];
    if (flag !== undefined && flag !== 0) indices.push(index);
  }
  return indices;
}

/**
 * A mask over a cloud, from the indices that are selected.
 *
 * The inverse of {@link scatterSelectedIndices}, and the door a selection
 * restored from a URL or a parent component comes in through. An index that is
 * negative, past the end, or not a whole number is dropped rather than
 * throwing: those lists arrive from outside, and a stale index in one is a
 * reason to select one point fewer, not to fail a render.
 * @param indices - The selected indices, in any order and possibly repeated.
 * @param count - How many points the cloud holds.
 * @returns One `0` or `1` per point.
 */
export function scatterSelectionMask(
  indices: Iterable<number>,
  count: number,
): Uint8Array {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const mask = new Uint8Array(total);
  for (const index of indices) {
    if (!Number.isInteger(index)) continue;
    if (index < 0 || index >= total) continue;
    mask[index] = 1;
  }
  return mask;
}
