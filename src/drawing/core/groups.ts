/**
 * Groups: items of a figure selected, moved, scaled and turned as one, the
 * same on every canvas of the family. A group names its members by their
 * identifiers — the site's items, or other groups, so that grouping two groups
 * and ungrouping the result gives the two back. What a member stands for (a
 * molecule's atoms on draw, a membrane on cell) is the site's to say; this
 * module knows only identifiers.
 */

/** A group of items. */
export interface DrawGroup {
  /** Identifier, unique in the figure. */
  id: string;
  /** What it holds, two members at least: items and groups, by identifier. */
  members: string[];
}

/**
 * The group each member is held in.
 * @param groups - The groups of a figure.
 * @returns The identifier of the group holding each member, by the member's.
 */
export function parentsOf(
  groups: readonly DrawGroup[] | undefined,
): Map<string, string> {
  const parents = new Map<string, string>();
  for (const group of groups ?? []) {
    for (const id of group.members) parents.set(id, group.id);
  }
  return parents;
}

/**
 * The outermost things some members belong to: the outermost group of a
 * grouped member, or the member itself.
 * @param groups - The groups of a figure.
 * @param members - The members, by identifier.
 * @returns The outermost units, each once.
 */
export function outermostUnits(
  groups: readonly DrawGroup[] | undefined,
  members: Iterable<string>,
): Set<string> {
  const parents = parentsOf(groups);
  const units = new Set<string>();
  for (const member of members) {
    let top = member;
    const seen = new Set<string>();
    for (let parent = parents.get(top); parent; parent = parents.get(top)) {
      if (seen.has(parent)) break;
      seen.add(parent);
      top = parent;
    }
    units.add(top);
  }
  return units;
}

/**
 * The items some units stand for: a group's members in turn, at any depth,
 * and an item itself.
 * @param groups - The groups of a figure.
 * @param units - Items and groups, by identifier.
 * @returns The items, each once, groups left out.
 */
export function leafMembers(
  groups: readonly DrawGroup[] | undefined,
  units: Iterable<string>,
): string[] {
  const byId = new Map((groups ?? []).map((group) => [group.id, group]));
  const leaves = new Set<string>();
  const seen = new Set<string>();
  const visit = (ids: Iterable<string>) => {
    for (const id of ids) {
      const group = byId.get(id);
      if (!group) {
        leaves.add(id);
      } else if (!seen.has(id)) {
        seen.add(id);
        visit(group.members);
      }
    }
  };
  visit(units);
  return [...leaves];
}

/**
 * Some items grown to the whole of every group they belong to, which is what
 * a click or a box with the selection tool picks.
 * @param groups - The groups of a figure.
 * @param items - The items, by identifier.
 * @returns The items and every item grouped with them.
 */
export function expandToGroups(
  groups: readonly DrawGroup[] | undefined,
  items: Iterable<string>,
): string[] {
  if (!groups?.length) return [...items];
  return leafMembers(groups, outermostUnits(groups, items));
}

/**
 * Group the outermost things some items belong to.
 * @param groups - The groups of a figure.
 * @param items - What to group, by identifier.
 * @param id - The new group's identifier.
 * @returns The groups with the new one, or undefined when the items belong
 * to fewer than two things to group.
 */
export function withGroup(
  groups: readonly DrawGroup[] | undefined,
  items: Iterable<string>,
  id: string,
): DrawGroup[] | undefined {
  const units = outermostUnits(groups, items);
  if (units.size < 2) return undefined;
  return [...(groups ?? []), { id, members: [...units] }];
}

/**
 * Take apart, one level, the outermost groups some items belong to: a group
 * of groups gives its groups back.
 * @param groups - The groups of a figure.
 * @param items - The items, by identifier.
 * @returns The groups left, or undefined when the items belong to none.
 */
export function withoutGroups(
  groups: readonly DrawGroup[] | undefined,
  items: Iterable<string>,
): DrawGroup[] | undefined {
  if (!groups?.length) return undefined;
  const ids = new Set(groups.map((group) => group.id));
  const top = new Set(
    [...outermostUnits(groups, items)].filter((unit) => ids.has(unit)),
  );
  if (top.size === 0) return undefined;
  return groups.filter((group) => !top.has(group.id));
}

/**
 * Groups brought in step with what a figure holds: a member gone leaves its
 * group, a member named twice stays in the first group naming it, a group
 * never holds itself, and a group left with one member gives it back to the
 * group above.
 * @param groups - The groups.
 * @param existing - The items the figure holds, by identifier; groups need not
 * be listed.
 * @param rejoining - A group to put an item back in, when the site knows the
 * item replaced one that was grouped (a molecule split in two on draw).
 * @returns The groups, the same array when nothing changed.
 */
export function reconcileGroups(
  groups: readonly DrawGroup[],
  existing: ReadonlySet<string>,
  rejoining?: ReadonlyMap<string, string>,
): readonly DrawGroup[] {
  const groupIds = new Set(groups.map((group) => group.id));
  const parents = new Map<string, string>();
  let next: DrawGroup[] = groups.map((group) => {
    const members: string[] = [];
    for (const id of group.members) {
      if (!(existing.has(id) || groupIds.has(id)) || parents.has(id)) continue;
      if (encloses(parents, id, group.id)) continue;
      parents.set(id, group.id);
      members.push(id);
    }
    return { id: group.id, members };
  });
  for (const [item, groupId] of rejoining ?? []) {
    if (parents.has(item)) continue;
    const group = next.find((candidate) => candidate.id === groupId);
    if (!group) continue;
    group.members.push(item);
    parents.set(item, groupId);
  }
  next = dissolveSmall(next, parents);
  return JSON.stringify(next) === JSON.stringify(groups) ? groups : next;
}

// Whether a member is the group itself, or a group holding it at some depth.
function encloses(
  parents: ReadonlyMap<string, string>,
  candidate: string,
  groupId: string,
): boolean {
  if (candidate === groupId) return true;
  const seen = new Set<string>();
  for (let at = parents.get(groupId); at;) {
    if (at === candidate || seen.has(at)) return true;
    seen.add(at);
    at = parents.get(at);
  }
  return false;
}

// Groups left with fewer than two members dissolved: an empty one goes, and
// the one member of another moves up to the group above it.
function dissolveSmall(
  groups: DrawGroup[],
  parents: Map<string, string>,
): DrawGroup[] {
  let current = groups;
  for (;;) {
    const small = current.find((group) => group.members.length < 2);
    if (!small) return current;
    const kept = current.filter((group) => group !== small);
    const parent = kept.find((group) => group.id === parents.get(small.id));
    if (parent) {
      parent.members = parent.members.filter((id) => id !== small.id);
      for (const id of small.members) {
        parent.members.push(id);
        parents.set(id, parent.id);
      }
    } else {
      for (const id of small.members) parents.delete(id);
    }
    parents.delete(small.id);
    current = kept;
  }
}
