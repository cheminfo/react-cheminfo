import { OrderedSet } from 'molstar/lib/mol-data/int.js';
import type { Loci } from 'molstar/lib/mol-model/loci.js';
import { EmptyLoci } from 'molstar/lib/mol-model/loci.js';
import { StructureElement } from 'molstar/lib/mol-model/structure.js';
import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { assert, expect, test } from 'vitest';

import type { HoverLabel } from '../hover.ts';
import { subscribeHoverLabel } from '../hover.ts';

import { acetoneStructure } from './acetone.ts';

const elementLoci = StructureElement.Loci;

test('an atom under the pointer is named as a reader names it, with its loci', async () => {
  const structure = await acetoneStructure();
  const unit = structure.units[0];
  assert(unit !== undefined, 'acetone has one unit');
  const oxygen = elementLoci(structure, [
    { unit, indices: OrderedSet.ofSingleton(2 as StructureElement.UnitIndex) },
  ]);
  const hover = fakeHover();
  const seen: Array<HoverLabel | null> = [];

  const stop = subscribeHoverLabel(hover.plugin, (label) => seen.push(label));
  hover.emit(oxygen);
  hover.emit(EmptyLoci);
  stop();
  hover.emit(oxygen);

  expect(seen).toStrictEqual([{ label: 'O 3', loci: oxygen }, null]);
  expect(hover.unsubscribed).toBe(1);
});

function fakeHover() {
  let listener: ((event: { current: { loci: Loci } }) => void) | undefined;
  const state = { unsubscribed: 0 };
  const plugin = {
    behaviors: {
      interaction: {
        hover: {
          subscribe: (next: typeof listener) => {
            listener = next;
            return {
              unsubscribe: () => {
                state.unsubscribed++;
                listener = undefined;
              },
            };
          },
        },
      },
    },
  } as unknown as PluginContext;
  return {
    plugin,
    emit: (loci: Loci) => listener?.({ current: { loci } }),
    get unsubscribed() {
      return state.unsubscribed;
    },
  };
}
