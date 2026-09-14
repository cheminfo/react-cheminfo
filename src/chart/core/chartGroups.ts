/**
 * Which group a row belongs to, read the one way every figure reads it.
 *
 * A group index arrives as whatever the caller had: an `Int32Array` padded
 * with `-1`, a `Float64Array` padded with `NaN` for the rows nobody assigned,
 * or a plain array of classes. Every layer that colours, counts or outlines by
 * group asks the same question of it, so the answer lives here once — a map
 * and a cloud that disagreed about which group row 12 is in would draw the
 * same sample in two colours.
 * @param groupOf - Which group each row belongs to, as an index into the groups.
 * @param row - Which row to read.
 * @param groups - How many groups there are.
 * @returns The group, truncated to a whole index, or `-1` when the entry is missing, not finite, or outside `0..groups - 1`.
 */
export function chartGroupIndex(
  groupOf: ArrayLike<number> | undefined,
  row: number,
  groups: number,
): number {
  const raw = groupOf?.[row];
  if (raw === undefined || !Number.isFinite(raw)) return -1;
  const group = Math.trunc(raw);
  return group < 0 || group >= groups ? -1 : group;
}
