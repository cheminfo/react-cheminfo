/**
 * Groups going in and out of a figure: read from a file, and renamed for a
 * paste. See `groups.ts` for what a group is.
 */

import { isRecord } from '../../values/core/values.ts';

import type { DrawGroup } from './groups.ts';

/**
 * The groups of a figure read from a file; `reconcileGroups` then drops
 * what they name that is not there.
 * @param value - The parsed `groups` of the file.
 * @returns The groups, or undefined when there are none.
 */
export function parseGroups(value: unknown): DrawGroup[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const seen = new Set<string>();
  const groups: DrawGroup[] = [];
  for (const item of value) {
    if (!isRecord(item) || !Array.isArray(item.members)) continue;
    const { id } = item;
    if (typeof id !== 'string' || id === '' || seen.has(id)) continue;
    seen.add(id);
    const members = item.members.filter(
      (member): member is string => typeof member === 'string' && member !== '',
    );
    groups.push({ id, members });
  }
  return groups.length > 0 ? groups : undefined;
}

/**
 * The groups of pasted items, under the identifiers the items took in the
 * figure pasted into; a member that was not pasted is left out.
 * @param groups - The groups of what was copied.
 * @param renamed - The new identifier of each pasted item.
 * @param nextGroupId - Gives a free identifier for each group.
 * @returns The groups.
 */
export function renumberGroups(
  groups: readonly DrawGroup[] | undefined,
  renamed: ReadonlyMap<string, string>,
  nextGroupId: () => string,
): DrawGroup[] {
  if (!groups?.length) return [];
  const groupIds = new Map(groups.map((group) => [group.id, nextGroupId()]));
  return groups.map((group) => {
    const members: string[] = [];
    for (const id of group.members) {
      const next = groupIds.get(id) ?? renamed.get(id);
      if (next !== undefined) members.push(next);
    }
    return { id: groupIds.get(group.id) as string, members };
  });
}
