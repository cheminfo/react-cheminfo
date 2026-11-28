/**
 * The seven crystal systems in the order the International Tables number
 * them, from triclinic (space groups 1–2) to cubic (195–230). A module of its
 * own, so a page listing them never pulls in the table of every setting.
 */
export const CRYSTAL_SYSTEMS = [
  'triclinic',
  'monoclinic',
  'orthorhombic',
  'tetragonal',
  'trigonal',
  'hexagonal',
  'cubic',
] as const;

/** The seven crystal systems, named by the point group rather than the lattice. */
export type CrystalSystem = (typeof CRYSTAL_SYSTEMS)[number];
