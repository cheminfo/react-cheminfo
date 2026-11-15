/**
 * What a measurement on a 3D molecule is, without React and without molstar,
 * so a site can store, persist or share measurements on its own.
 *
 * Atoms are named by position rather than by molstar loci, so a measurement
 * taken on one conformer lands on the same atoms of every other conformer of
 * the same molecule — which is what lets a reader watch a dihedral change down
 * a list of conformers.
 */

/** The three geometric measurements, in the order the toolbar offers them. */
export const MEASUREMENT_KINDS = ['distance', 'angle', 'dihedral'] as const;

/** One of {@link MEASUREMENT_KINDS}. */
export type MeasurementKind = (typeof MEASUREMENT_KINDS)[number];

/** How many atoms each kind is measured between. */
export const MEASUREMENT_ATOM_COUNTS: Record<MeasurementKind, number> = {
  distance: 2,
  angle: 3,
  dihedral: 4,
};

/** What the toolbar calls each kind. */
export const MEASUREMENT_LABELS: Record<MeasurementKind, string> = {
  distance: 'Distance',
  angle: 'Angle',
  dihedral: 'Dihedral angle',
};

/** One atom of the displayed structure, by position. */
export interface AtomReference {
  /** Index of the unit in molstar's `structure.units`; 0 for a molfile. */
  unit: number;
  /** Index of the atom inside that unit. */
  element: number;
}

/** One measurement, with its atoms in the order they were picked. */
export interface Measurement {
  kind: MeasurementKind;
  atoms: readonly AtomReference[];
}

/**
 * Whether two lists name the same measurements, of the same kinds over the
 * same atoms, in the same order — what decides that nothing needs drawing
 * again.
 * @param first - One list.
 * @param second - The other.
 * @returns True when every measurement of one is the measurement of the other
 * at its place.
 */
export function sameMeasurements(
  first: readonly Measurement[],
  second: readonly Measurement[],
): boolean {
  if (first === second) return true;
  if (first.length !== second.length) return false;
  for (let index = 0; index < first.length; index++) {
    const one = first[index];
    const other = second[index];
    if (one === undefined || other === undefined) return false;
    if (one.kind !== other.kind || !sameAtoms(one.atoms, other.atoms)) {
      return false;
    }
  }
  return true;
}

/**
 * The list without one measurement: the first of the same kind over the same
 * atoms, read in either direction, since `A–B` and `B–A` are one distance.
 * @param measurements - The list.
 * @param measurement - What to take out.
 * @returns A new list without it, or `measurements` itself when it holds no
 * such measurement.
 */
export function removeMeasurement(
  measurements: readonly Measurement[],
  measurement: Measurement,
): readonly Measurement[] {
  const reversed = measurement.atoms.toReversed();
  for (let index = 0; index < measurements.length; index++) {
    const candidate = measurements[index];
    if (
      candidate?.kind === measurement.kind &&
      (sameAtoms(candidate.atoms, measurement.atoms) ||
        sameAtoms(candidate.atoms, reversed))
    ) {
      return measurements.toSpliced(index, 1);
    }
  }
  return measurements;
}

/**
 * Whether two lists name the same atoms in the same order.
 * @param first - One list.
 * @param second - The other.
 * @returns True when every atom of one is the atom of the other at its place.
 */
export function sameAtoms(
  first: readonly AtomReference[],
  second: readonly AtomReference[],
): boolean {
  if (first.length !== second.length) return false;
  for (let position = 0; position < first.length; position++) {
    const atom = first[position];
    const match = second[position];
    if (atom?.unit !== match?.unit || atom?.element !== match?.element) {
      return false;
    }
  }
  return true;
}
