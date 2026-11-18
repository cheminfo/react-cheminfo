import type { CrystalSite, CrystalStructure } from './cif/types.ts';
import type { ExpandedAtom } from './expand.ts';
import { expandSite } from './expand.ts';
import { structureOperations } from './operations.ts';
import { findPeriodicBonds } from './periodicBonds.ts';
import type { Lattice } from './symmetry/lattice.ts';
import { createLattice } from './symmetry/lattice.ts';

/**
 * Two atoms of different disorder groups closer than this, in ångström, are
 * alternatives: the two groups are never kept together.
 */
export const DISORDER_OVERLAP = 1.1;

/**
 * The same, for two groups of one disorder assembly, which the file already
 * says are alternatives where they meet: a CF₃ group turned by 60° puts its
 * fluorines 1.3 Å from where they were.
 */
export const ASSEMBLY_OVERLAP = 2;

/**
 * Which atoms of the asymmetric unit a molecule is built from, as
 * {@link chooseDisorder} decides it.
 * @param structure - What `readCif` returned.
 * @returns One flag per site, 1 to keep it.
 * @throws {Error} When the file names no space group and lists no operation.
 */
export function keptSites(structure: CrystalStructure): Uint8Array {
  const operations = structureOperations(structure);
  const atoms: ExpandedAtom[] = [];
  for (let index = 0; index < structure.sites.length; index++) {
    const site = structure.sites[index] as CrystalSite;
    if (isDummy(site)) continue;
    const images = expandSite(site, index, operations);
    for (let image = 0; image < images.length; image++) {
      atoms.push(images[image] as ExpandedAtom);
    }
  }
  return chooseDisorder(structure.sites, atoms, createLattice(structure.cell));
}

/**
 * Which atoms of the asymmetric unit a molecule is built from: one model of
 * the crystal, never two disordered parts on top of each other.
 *
 * - A dummy atom (`_atom_site_calc_flag` `dum`) is never kept.
 * - An atom in no disorder group — `.` or `0`, as SHELX writes it — is always
 *   kept.
 * - The disorder groups, each named by its assembly and its group, are kept
 *   by decreasing mean occupancy, the one written first on a tie, and a group
 *   is left out when one of its atoms lies within {@link ASSEMBLY_OVERLAP} of
 *   an atom of another group of the same assembly already kept, or within
 *   {@link DISORDER_OVERLAP} of one of another assembly and another group
 *   number, symmetry copies included. Groups sharing a number — SHELX's
 *   `PART 1` in two assemblies — are never alternatives.
 *
 * So a 70:30 disorder keeps its major part, a 50:50 one the part written
 * first, and several disorders of one structure each keep one part, however
 * the file spreads them over assemblies.
 * @param sites - The asymmetric unit, in file order.
 * @param atoms - The atoms of one cell the sites that are not dummies make.
 * @param lattice - The cell.
 * @returns One flag per site, 1 to keep it.
 */
export function chooseDisorder(
  sites: readonly CrystalSite[],
  atoms: readonly ExpandedAtom[],
  lattice: Lattice,
): Uint8Array {
  const kept = new Uint8Array(sites.length);
  const unitOf = new Int32Array(sites.length).fill(-1);
  const units: DisorderUnit[] = [];
  const unitIndex = new Map<string, number>();
  for (let index = 0; index < sites.length; index++) {
    const site = sites[index] as CrystalSite;
    if (isDummy(site)) continue;
    const group = disorderGroupOf(site);
    if (group === null) {
      kept[index] = 1;
      continue;
    }
    const key = `${site.disorderAssembly ?? ''}\n${group}`;
    let unit = unitIndex.get(key);
    if (unit === undefined) {
      unit = units.length;
      unitIndex.set(key, unit);
      units.push({
        assembly: site.disorderAssembly ?? '',
        group,
        occupancy: 0,
        count: 0,
        first: index,
        conflicts: [],
      });
    }
    const tally = units[unit] as DisorderUnit;
    tally.occupancy += site.occupancy;
    tally.count += 1;
    unitOf[index] = unit;
  }
  if (units.length === 0) return kept;
  findConflicts(units, unitOf, atoms, lattice);
  const order = units.toSorted((a, b) => {
    const difference = b.occupancy / b.count - a.occupancy / a.count;
    return Math.abs(difference) > 1e-6 ? difference : a.first - b.first;
  });
  const chosen = new Set<DisorderUnit>();
  for (const unit of order) {
    let free = true;
    for (const other of unit.conflicts) {
      if (chosen.has(units[other] as DisorderUnit)) free = false;
    }
    if (free) chosen.add(unit);
  }
  for (let index = 0; index < sites.length; index++) {
    const unit = unitOf[index] ?? -1;
    if (unit !== -1 && chosen.has(units[unit] as DisorderUnit)) kept[index] = 1;
  }
  return kept;
}

/**
 * The disorder group a site belongs to.
 * @param site - One atom of the asymmetric unit.
 * @returns The group as the file writes it, or `null` for an atom in none.
 */
export function disorderGroupOf(site: CrystalSite): string | null {
  const group = site.disorderGroup;
  return group === undefined || group === '0' ? null : group;
}

/**
 * Whether a site is a dummy atom, which stands for no atom at all.
 * @param site - One atom of the asymmetric unit.
 * @returns Whether its calc flag is `dum`.
 */
export function isDummy(site: CrystalSite): boolean {
  return site.calcFlag?.toLowerCase() === 'dum';
}

interface DisorderUnit {
  readonly assembly: string;
  readonly group: string;
  occupancy: number;
  count: number;
  first: number;
  /** Indices of the units it may not be kept with. */
  conflicts: number[];
}

/**
 * Note which disorder groups put atoms on top of each other.
 * @param units - The disorder groups; their conflicts are filled in.
 * @param unitOf - The group of each site, -1 for none.
 * @param atoms - The atoms of one cell.
 * @param lattice - The cell.
 */
function findConflicts(
  units: DisorderUnit[],
  unitOf: Int32Array,
  atoms: readonly ExpandedAtom[],
  lattice: Lattice,
) {
  const disordered: ExpandedAtom[] = [];
  for (let index = 0; index < atoms.length; index++) {
    const atom = atoms[index] as ExpandedAtom;
    if ((unitOf[atom.siteIndex] ?? -1) !== -1) disordered.push(atom);
  }
  const close = findPeriodicBonds(disordered, lattice, () => ASSEMBLY_OVERLAP, {
    samePlace: 0,
  });
  for (let pair = 0; pair < close.count; pair++) {
    const first = disordered[close.from[pair] ?? 0] as ExpandedAtom;
    const second = disordered[close.to[pair] ?? 0] as ExpandedAtom;
    const a = unitOf[first.siteIndex] ?? -1;
    const b = unitOf[second.siteIndex] ?? -1;
    const unitA = units[a] as DisorderUnit;
    const unitB = units[b] as DisorderUnit;
    if (unitA.group === unitB.group) continue;
    if (
      unitA.assembly !== unitB.assembly &&
      (close.lengths[pair] ?? 0) >= DISORDER_OVERLAP
    ) {
      continue;
    }
    (units[a] as DisorderUnit).conflicts.push(b);
    (units[b] as DisorderUnit).conflicts.push(a);
  }
}
