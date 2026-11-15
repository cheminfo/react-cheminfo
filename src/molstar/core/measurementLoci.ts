/**
 * The measurement the pointer rests on, read back from what molstar drew.
 *
 * Every distance, angle and dihedral of the measurement manager is a shape
 * whose source data still holds the atoms it was drawn over, so hovering its
 * dashed line or its arc names the measurement the way the component stores
 * it. Its label is never picked: molstar leaves text out of the picking pass.
 */

import { OrderedSet } from 'molstar/lib/mol-data/int.js';
import type { Loci } from 'molstar/lib/mol-model/loci.js';
import { ShapeGroup } from 'molstar/lib/mol-model/shape.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import type {
  AtomReference,
  Measurement,
  MeasurementKind,
} from '../../molecule3d/core/measurement.ts';
import { sameMeasurements } from '../../molecule3d/core/measurement.ts';

import { subscribeHover } from './hover.ts';
import { atomOfLoci } from './lociAtom.ts';
import type { MoleculeStructureSource } from './measurements.ts';

/**
 * Report the measurement the pointer rests on, each time it moves to another
 * one.
 * @param plugin - The molstar context.
 * @param structureOf - Where the measured atoms are found.
 * @param listener - Called with the measurement, and with `null` once the
 * pointer leaves it for an atom, a bond or the background.
 * @returns The unsubscribe function.
 */
export function subscribeHoverMeasurement(
  plugin: PluginContext,
  structureOf: MoleculeStructureSource,
  listener: (measurement: Measurement | null) => void,
): () => void {
  let current: Measurement | null = null;
  return subscribeHover(plugin, (loci) => {
    const structure = loci === null ? undefined : structureOf(plugin);
    const measurement =
      loci === null || structure === undefined
        ? null
        : (measurementOfLoci(structure, loci) ?? null);
    if (sameMeasurement(measurement, current)) return;
    current = measurement;
    listener(measurement);
  });
}

/**
 * The measurement a loci was drawn for.
 * @param structure - The structure on screen.
 * @param loci - What the pointer rests on.
 * @returns The measurement, its atoms in the order they were drawn, or
 * `undefined` when the loci is not a measurement over atoms of `structure`.
 */
export function measurementOfLoci(
  structure: Structure,
  loci: Loci,
): Measurement | undefined {
  if (!ShapeGroup.isLoci(loci)) return undefined;
  const group = loci.groups[0];
  const data = loci.shape.sourceData;
  if (group === undefined || typeof data !== 'object' || data === null) {
    return undefined;
  }
  const id = OrderedSet.getAt(group.ids, 0);
  for (const [kind, key] of BUNDLE_KEYS) {
    const bundles = (data as Partial<Record<BundleKey, unknown>>)[key];
    if (!Array.isArray(bundles)) continue;
    const bundle = bundles[id] as { loci?: unknown } | undefined;
    if (!Array.isArray(bundle?.loci)) return undefined;
    return measurementOver(structure, kind, bundle.loci as readonly Loci[]);
  }
  return undefined;
}

type BundleKey = 'pairs' | 'triples' | 'quads';

/** Where molstar keeps the atoms of each kind in a shape's source data. */
const BUNDLE_KEYS: ReadonlyArray<readonly [MeasurementKind, BundleKey]> = [
  ['distance', 'pairs'],
  ['angle', 'triples'],
  ['dihedral', 'quads'],
];

function measurementOver(
  structure: Structure,
  kind: MeasurementKind,
  loci: readonly Loci[],
): Measurement | undefined {
  const atoms: AtomReference[] = [];
  for (const one of loci) {
    const atom = atomOfLoci(structure, one);
    if (atom === undefined) return undefined;
    atoms.push(atom);
  }
  return { kind, atoms };
}

function sameMeasurement(
  first: Measurement | null,
  second: Measurement | null,
): boolean {
  if (first === null || second === null) return first === second;
  return sameMeasurements([first], [second]);
}
