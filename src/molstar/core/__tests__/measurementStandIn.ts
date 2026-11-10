import { OrderedSet } from 'molstar/lib/mol-data/int.js';
import type { Loci } from 'molstar/lib/mol-model/loci.js';
import type { UnitIndex } from 'molstar/lib/mol-model/structure/structure/element/util.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import { StructureElement } from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { MeasurementGroupTag } from 'molstar/lib/mol-plugin-state/manager/structure/measurement.js';
import { StateTransform } from 'molstar/lib/mol-state/index.js';

import type {
  AtomReference,
  Measurement,
} from '../../../molecule3d/core/measurement.ts';

// Lowercased: it is a factory, not a constructor.
const elementLoci = StructureElement.Loci;

/**
 * An atom of the first unit, as a measurement addresses it.
 * @param element - Its place in the unit.
 * @returns The reference.
 */
export function atom(element: number): AtomReference {
  return { unit: 0, element };
}

/**
 * A click on one atom of the first unit.
 * @param structure - The structure on screen.
 * @param element - Its place in the unit.
 * @returns The loci the click selects.
 */
export function single(structure: Structure, element: number): Loci {
  return elementLoci(structure, [
    {
      unit: unitOf(structure),
      indices: OrderedSet.ofSingleton(element as UnitIndex),
    },
  ]);
}

/**
 * A selection of two atoms of the first unit, as a click on a bond makes.
 * @param structure - The structure on screen.
 * @param first - The place of the first atom in the unit.
 * @param second - The place of the second, after the first.
 * @returns The loci.
 */
export function pair(
  structure: Structure,
  first: number,
  second: number,
): Loci {
  return elementLoci(structure, [
    {
      unit: unitOf(structure),
      indices: OrderedSet.ofSortedArray([
        first as UnitIndex,
        second as UnitIndex,
      ]),
    },
  ]);
}

function unitOf(structure: Structure) {
  const unit = structure.units[0];
  if (unit === undefined) throw new Error('the structure has no unit');
  return unit;
}

/**
 * A plugin holding what the measurement helpers read: a state tree with or
 * without a measurement group, a measurement manager writing down the atoms
 * it is handed, and a selection history the test clicks into.
 * @param options - Whether the scene holds measurements already.
 * @param options.measured - Whether a measurement group is in the tree.
 * @returns The plugin, its log, a click, and what the picker measured.
 */
export function scenePlugin({ measured = false } = {}) {
  const log: string[] = [];
  const root = StateTransform.RootRef;
  const group = 'measurement-group';
  const transforms = new Map<string, { ref: string; tags?: string[] }>([
    [root, { ref: root }],
  ]);
  const children = new Map<string, Set<string>>([[root, new Set()]]);
  if (measured) {
    transforms.set(group, { ref: group, tags: [MeasurementGroupTag] });
    children.get(root)?.add(group);
  }
  const history: Array<{ loci: Loci }> = [];
  const listeners = new Set<() => void>();
  function record(method: string) {
    return async (...args: unknown[]) => {
      const loci = args.slice(0, -1) as StructureElement.Loci[];
      const atoms = loci.map((one) =>
        OrderedSet.getAt(one.elements[0]?.indices ?? OrderedSet.Empty, 0),
      );
      log.push(`${method} ${atoms.join('-')}`);
    };
  }
  const plugin = {
    state: { data: { tree: { transforms, children } } },
    build() {
      const deleted: string[] = [];
      const builder = {
        delete(ref: string) {
          deleted.push(ref);
          return builder;
        },
        async commit() {
          log.push(`delete ${deleted.join(' ')}`);
        },
      };
      return builder;
    },
    set selectionMode(on: boolean) {
      log.push(`selection mode ${on ? 'on' : 'off'}`);
    },
    managers: {
      interactivity: {
        setProps(props: { granularity: string }) {
          log.push(`granularity ${props.granularity}`);
        },
        lociSelects: {
          deselectAll() {
            log.push('deselect all');
          },
        },
      },
      structure: {
        measurement: {
          addDistance: record('addDistance'),
          addAngle: record('addAngle'),
          addDihedral: record('addDihedral'),
        },
        selection: {
          additionsHistory: history,
          events: {
            additionsHistoryUpdated: {
              subscribe(listener: () => void) {
                listeners.add(listener);
                return {
                  unsubscribe: () => listeners.delete(listener),
                };
              },
            },
          },
        },
      },
    },
  } as unknown as PluginContext;
  const picked: Measurement[] = [];
  function click(loci: Loci): void {
    // The history is newest first, as molstar keeps it.
    history.unshift({ loci });
    for (const listener of listeners) listener();
  }
  return {
    plugin,
    log,
    click,
    picked,
    history,
    listening: () => listeners.size > 0,
  };
}
