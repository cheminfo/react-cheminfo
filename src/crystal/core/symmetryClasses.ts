import type { PeriodicComponent } from './components.ts';
import type { ExpandedAtom } from './expand.ts';

/**
 * The connected sets grouped by the sites they are built from: sets sharing a
 * site are symmetry copies of one another.
 * @param components - The connected sets of the cell.
 * @param atoms - The atoms of the cell.
 * @param siteCount - How many sites the asymmetric unit holds.
 * @returns The groups, ordered on their first site.
 */
export function symmetryClasses(
  components: readonly PeriodicComponent[],
  atoms: readonly ExpandedAtom[],
  siteCount: number,
): PeriodicComponent[][] {
  const parent = new Int32Array(siteCount);
  for (let site = 0; site < siteCount; site++) parent[site] = site;
  for (const component of components) {
    const first = (atoms[component.atoms[0] ?? 0] as ExpandedAtom).siteIndex;
    for (const index of component.atoms) {
      unite(parent, first, (atoms[index] as ExpandedAtom).siteIndex);
    }
  }
  const classes = new Map<number, PeriodicComponent[]>();
  for (const component of components) {
    const site = (atoms[component.atoms[0] ?? 0] as ExpandedAtom).siteIndex;
    const root = rootOf(parent, site);
    const members = classes.get(root);
    if (members === undefined) classes.set(root, [component]);
    else members.push(component);
  }
  const roots = Int32Array.from(classes.keys()).toSorted();
  const ordered: PeriodicComponent[][] = [];
  for (let index = 0; index < roots.length; index++) {
    ordered.push(classes.get(roots[index] ?? 0) ?? []);
  }
  return ordered;
}

function rootOf(parent: Int32Array, site: number): number {
  let current = site;
  while (parent[current] !== current) {
    const next = parent[current] ?? current;
    parent[current] = parent[next] ?? next;
    current = next;
  }
  return current;
}

function unite(parent: Int32Array, a: number, b: number) {
  const rootA = rootOf(parent, a);
  const rootB = rootOf(parent, b);
  if (rootA < rootB) parent[rootB] = rootA;
  else if (rootB < rootA) parent[rootA] = rootB;
}

/**
 * The copy of a molecule closest to the file: the one holding the most atoms
 * the identity made, the first on a tie.
 * @param members - The copies.
 * @param atoms - The atoms of the cell.
 * @param identityIndex - Index of the identity in the operation list.
 * @returns The copy.
 */
export function representative(
  members: readonly PeriodicComponent[],
  atoms: readonly ExpandedAtom[],
  identityIndex: number,
): PeriodicComponent {
  let best = members[0] as PeriodicComponent;
  let bestCount = -1;
  for (const component of members) {
    let count = 0;
    for (const index of component.atoms) {
      if ((atoms[index] as ExpandedAtom).operationIndex === identityIndex) {
        count++;
      }
    }
    if (count > bestCount) {
      best = component;
      bestCount = count;
    }
  }
  return best;
}

/**
 * The sites a group of connected sets is built from.
 * @param members - The sets.
 * @param atoms - The atoms of the cell.
 * @returns The site indices, ascending.
 */
export function siteIndicesOf(
  members: readonly PeriodicComponent[],
  atoms: readonly ExpandedAtom[],
): number[] {
  const seen = new Set<number>();
  for (const component of members) {
    for (const index of component.atoms) {
      seen.add((atoms[index] as ExpandedAtom).siteIndex);
    }
  }
  return Array.from(Int32Array.from(seen).toSorted());
}
