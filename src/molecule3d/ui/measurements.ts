/**
 * Distances, angles and dihedral angles over the displayed molecule.
 *
 * molstar ships the measuring itself — `managers.structure.measurement` draws
 * the lines and labels — but its only way to pick the atoms is the panel of its
 * own UI, which this component does not mount. That panel works from the
 * selection history, and so does this module: while a tool is active the
 * plugin is in selection mode, a click toggles one atom into the history
 * instead of moving the camera, and once enough atoms are in it they become a
 * measurement.
 */

import { OrderedSet } from 'molstar/lib/mol-data/int.js';
import type { Loci } from 'molstar/lib/mol-model/loci.js';
import type { UnitIndex } from 'molstar/lib/mol-model/structure/structure/element/util.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import { StructureElement } from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { MeasurementGroupTag } from 'molstar/lib/mol-plugin-state/manager/structure/measurement.js';
import { StateSelection, StateTransform } from 'molstar/lib/mol-state/index.js';

import type {
  AtomReference,
  Measurement,
  MeasurementKind,
} from '../core/measurement.ts';
import { MEASUREMENT_ATOM_COUNTS } from '../core/measurement.ts';

import { moleculeStructure } from './renderMolecule.ts';

// Lowercased: it is a factory, not a constructor.
const elementLoci = StructureElement.Loci;

/**
 * Draw exactly `measurements` over the current molecule. An atom the structure
 * does not have skips its measurement rather than failing the scene.
 * @param plugin - The molstar context.
 * @param measurements - Everything to show, replacing what is shown.
 * @returns Nothing; resolves once every label is on screen.
 */
export async function renderMeasurements(
  plugin: PluginContext,
  measurements: readonly Measurement[],
): Promise<void> {
  await clearMeasurements(plugin);
  const structure = moleculeStructure(plugin);
  if (structure === undefined) return;
  const manager = plugin.managers.structure.measurement;
  for (const measurement of measurements) {
    const [a, b, c, d] = atomLoci(structure, measurement.atoms);
    /* eslint-disable no-await-in-loop -- each add commits to the state tree, and commits must not interleave */
    if (measurement.kind === 'distance' && a && b) {
      await manager.addDistance(a, b);
    } else if (measurement.kind === 'angle' && a && b && c) {
      await manager.addAngle(a, b, c);
    } else if (measurement.kind === 'dihedral' && a && b && c && d) {
      await manager.addDihedral(a, b, c, d);
    }
    /* eslint-enable no-await-in-loop */
  }
}

/**
 * Remove every measurement from the scene.
 * @param plugin - The molstar context.
 * @returns Nothing; resolves once the labels are gone.
 */
export async function clearMeasurements(plugin: PluginContext): Promise<void> {
  const ref = StateSelection.findTagInSubtree(
    plugin.state.data.tree,
    StateTransform.RootRef,
    MeasurementGroupTag,
  );
  if (ref === undefined) return;
  await plugin.build().delete(ref).commit();
}

/** Turns the clicks on atoms into measurements, while a tool is active. */
export class MeasurementPicker {
  readonly #plugin: PluginContext;
  readonly #onMeasure: (measurement: Measurement) => void;
  readonly #unsubscribe: () => void;
  #kind: MeasurementKind | null = null;

  /**
   * Start listening to the selection history of `plugin`.
   * @param plugin - The molstar context.
   * @param onMeasure - Called with each measurement once its atoms are picked.
   */
  constructor(
    plugin: PluginContext,
    onMeasure: (measurement: Measurement) => void,
  ) {
    this.#plugin = plugin;
    this.#onMeasure = onMeasure;
    // A molfile is one residue: at molstar's default granularity a click
    // would pick the whole molecule.
    plugin.managers.interactivity.setProps({ granularity: 'element' });
    const subscription =
      plugin.managers.structure.selection.events.additionsHistoryUpdated.subscribe(
        () => {
          this.#collect();
        },
      );
    this.#unsubscribe = () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Choose what the next clicks measure. Atoms already picked are dropped.
   * @param kind - The measurement to build, or `null` to give clicks back to
   * the camera.
   */
  setKind(kind: MeasurementKind | null): void {
    if (kind === this.#kind) return;
    this.#kind = kind;
    this.#plugin.selectionMode = kind !== null;
    this.#plugin.managers.interactivity.lociSelects.deselectAll();
  }

  /** Stop listening to the plugin. */
  dispose(): void {
    this.#unsubscribe();
  }

  #collect(): void {
    const kind = this.#kind;
    const structure = moleculeStructure(this.#plugin);
    if (kind === null || structure === undefined) return;
    const needed = MEASUREMENT_ATOM_COUNTS[kind];
    // The history is newest first.
    const history = this.#plugin.managers.structure.selection.additionsHistory;
    const atoms: AtomReference[] = [];
    for (let i = 0; i < history.length && atoms.length < needed; i++) {
      const entry = history[i];
      const atom = entry && atomReference(structure, entry.loci);
      if (atom !== undefined) atoms.push(atom);
    }
    if (atoms.length < needed) return;
    this.#plugin.managers.interactivity.lociSelects.deselectAll();
    this.#onMeasure({ kind, atoms: atoms.toReversed() });
  }
}

function atomReference(
  structure: Structure,
  loci: Loci,
): AtomReference | undefined {
  if (!StructureElement.Loci.is(loci)) return undefined;
  if (StructureElement.Loci.size(loci) !== 1) return undefined;
  const entry = loci.elements[0];
  if (entry === undefined) return undefined;
  const units = structure.units;
  for (let unit = 0; unit < units.length; unit++) {
    if (units[unit]?.id === entry.unit.id) {
      return { unit, element: OrderedSet.getAt(entry.indices, 0) };
    }
  }
  return undefined;
}

function atomLoci(
  structure: Structure,
  atoms: readonly AtomReference[],
): StructureElement.Loci[] {
  const loci: StructureElement.Loci[] = [];
  for (const atom of atoms) {
    const unit = structure.units[atom.unit];
    if (unit === undefined || atom.element >= unit.elements.length) return [];
    loci.push(
      elementLoci(structure, [
        { unit, indices: OrderedSet.ofSingleton(atom.element as UnitIndex) },
      ]),
    );
  }
  return loci;
}
