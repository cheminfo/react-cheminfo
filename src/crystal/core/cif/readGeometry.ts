import { parseCifNumber } from './number.ts';
import type { CifIndex, CifRowIndex } from './tags.ts';
import { loopWith, optionalRowTag, rowTag } from './tags.ts';
import type { CifGeometryBond, CifGeometryTorsion } from './types.ts';

/**
 * Read the `_geom_bond` loop: the distances the authors reported.
 * @param index - the folded CIF.
 * @returns the bonds in file order, or `null` when the file has no such loop.
 *   A row whose labels or distance cannot be read is left out.
 */
export function readGeometryBonds(index: CifIndex): CifGeometryBond[] | null {
  const rows = loopWith(index, BOND_LABEL_1);
  if (rows === null) return null;
  const bonds: CifGeometryBond[] = [];
  for (const row of rows) {
    const label1 = rowTag(row, BOND_LABEL_1);
    const label2 = rowTag(row, BOND_LABEL_2);
    const distance = parseCifNumber(rowTag(row, BOND_DISTANCE));
    if (label1 === null || label2 === null || distance === null) continue;
    bonds.push({
      label1,
      label2,
      distance,
      ...symmetryCode(row, 'siteSymmetry1', BOND_SYMMETRY_1),
      ...symmetryCode(row, 'siteSymmetry2', BOND_SYMMETRY_2),
    });
  }
  return bonds;
}

/**
 * Read the `_geom_torsion` loop: the torsion angles the authors reported.
 * @param index - the folded CIF.
 * @returns the torsions in file order, or `null` when the file has no such
 *   loop. A row whose labels or angle cannot be read is left out.
 */
export function readGeometryTorsions(
  index: CifIndex,
): CifGeometryTorsion[] | null {
  const rows = loopWith(index, torsionTags('atom_site_label_1'));
  if (rows === null) return null;
  const torsions: CifGeometryTorsion[] = [];
  for (const row of rows) {
    const label1 = rowTag(row, torsionTags('atom_site_label_1'));
    const label2 = rowTag(row, torsionTags('atom_site_label_2'));
    const label3 = rowTag(row, torsionTags('atom_site_label_3'));
    const label4 = rowTag(row, torsionTags('atom_site_label_4'));
    const angle = parseCifNumber(rowTag(row, TORSION_ANGLE));
    if (
      label1 === null ||
      label2 === null ||
      label3 === null ||
      label4 === null ||
      angle === null
    ) {
      continue;
    }
    torsions.push({
      label1,
      label2,
      label3,
      label4,
      angle,
      ...symmetryCode(row, 'siteSymmetry1', torsionTags('site_symmetry_1')),
      ...symmetryCode(row, 'siteSymmetry2', torsionTags('site_symmetry_2')),
      ...symmetryCode(row, 'siteSymmetry3', torsionTags('site_symmetry_3')),
      ...symmetryCode(row, 'siteSymmetry4', torsionTags('site_symmetry_4')),
    });
  }
  return torsions;
}

function symmetryCode<K extends string>(
  row: CifRowIndex,
  key: K,
  aliases: readonly string[],
): Partial<Record<K, string>> {
  const code = optionalRowTag(row, aliases);
  return code === null ? {} : ({ [key]: code } as Record<K, string>);
}

function torsionTags(column: string): readonly string[] {
  return [`_geom_torsion_${column}`, `_geom_torsion.${column}`];
}

const BOND_LABEL_1 = [
  '_geom_bond_atom_site_label_1',
  '_geom_bond.atom_site_label_1',
] as const;
const BOND_LABEL_2 = [
  '_geom_bond_atom_site_label_2',
  '_geom_bond.atom_site_label_2',
] as const;
const BOND_DISTANCE = ['_geom_bond_distance', '_geom_bond.distance'] as const;
const BOND_SYMMETRY_1 = [
  '_geom_bond_site_symmetry_1',
  '_geom_bond.site_symmetry_1',
] as const;
const BOND_SYMMETRY_2 = [
  '_geom_bond_site_symmetry_2',
  '_geom_bond.site_symmetry_2',
] as const;
const TORSION_ANGLE = ['_geom_torsion', '_geom_torsion.value'] as const;
