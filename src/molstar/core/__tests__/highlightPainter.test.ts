/**
 * How the painter keeps a representation highlighted: it repaints the model
 * through the representation's own state, never through a state-tree commit,
 * so nothing is rebuilt and the scene keeps the bounds the camera is framed on.
 * The plugin is a stand-in holding only what the painter touches.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects.js';
import type { StateObject } from 'molstar/lib/mol-state/index.js';
import { Overpaint } from 'molstar/lib/mol-theme/overpaint.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';
import { expect, test } from 'vitest';

import type { Molecule3DHighlight } from '../../../molecule3d/core/highlight.ts';
import { HighlightPainter } from '../highlights.ts';

import { acetoneStructure } from './acetone.ts';

const MODEL = 'model';
const ACCENT = Color.fromHexStyle('#0d9488');
const C_O: Molecule3DHighlight[] = [
  {
    atoms: [
      { unit: 0, element: 1 },
      { unit: 0, element: 2 },
    ],
  },
];

test('a highlight repaints the model on screen, keeping the scene bounds', async () => {
  const stage = await fakeStage();
  const model = stage.show(MODEL);
  const painter = new HighlightPainter(stage.plugin, MODEL);

  painter.set(C_O, ACCENT);

  expect(model.layerCounts).toStrictEqual([3]);
  expect(stage.updates).toStrictEqual([{ repr: model.repr, keepSphere: true }]);
});

test('the same paths in a new array repaint nothing', async () => {
  const stage = await fakeStage();
  const model = stage.show(MODEL);
  const painter = new HighlightPainter(stage.plugin, MODEL);

  painter.set(C_O, ACCENT);
  painter.set(structuredClone(C_O), ACCENT);

  expect(model.layerCounts).toStrictEqual([3]);

  painter.set(C_O, Color.fromHexStyle('#b45309'));

  expect(model.layerCounts).toStrictEqual([3, 3]);
});

test('a model drawn afterwards comes up painted, and no other drawing', async () => {
  const stage = await fakeStage();
  const painter = new HighlightPainter(stage.plugin, MODEL);
  painter.set(C_O, ACCENT);

  const surface = stage.show('surface', 'created');
  const model = stage.show(MODEL, 'created');
  const restyled = stage.show(MODEL, 'updated');

  expect(surface.layerCounts).toStrictEqual([]);
  expect(model.layerCounts).toStrictEqual([3]);
  expect(restyled.layerCounts).toStrictEqual([3]);
});

test('an empty list restores the plain model', async () => {
  const stage = await fakeStage();
  const model = stage.show(MODEL);
  const painter = new HighlightPainter(stage.plugin, MODEL);

  painter.set(C_O, ACCENT);
  painter.set([], ACCENT);

  expect(model.layerCounts).toStrictEqual([3, 0]);
  expect(stage.updates).toHaveLength(2);
});

test('a plain model drawn while nothing is highlighted is not touched', async () => {
  const stage = await fakeStage();
  const painter = new HighlightPainter(stage.plugin, MODEL);
  painter.set([], ACCENT);

  const model = stage.show(MODEL, 'created');

  expect(model.layerCounts).toStrictEqual([]);
  expect(stage.updates).toStrictEqual([]);
});

test('once disposed, a new model is left alone', async () => {
  const stage = await fakeStage();
  const painter = new HighlightPainter(stage.plugin, MODEL);
  painter.set(C_O, ACCENT);
  painter.dispose();

  const model = stage.show(MODEL, 'created');

  expect(model.layerCounts).toStrictEqual([]);
});

interface FakeModel {
  /** The representation, as the painter reaches it. */
  repr: unknown;
  /** How many layers each repaint carried, in order. */
  layerCounts: number[];
}

type ObjectListener = (event: { ref: string; obj: StateObject }) => void;

/**
 * A plugin holding a state tree of named cells, the two object events the
 * painter follows, and a canvas recording each update it is asked for.
 * @returns The plugin, what it recorded, and a way to put a model in a cell.
 */
async function fakeStage() {
  const structure = await acetoneStructure();
  const cells = new Map<string, { obj: StateObject }>();
  const listeners = {
    created: [] as ObjectListener[],
    updated: [] as ObjectListener[],
  };
  const updates: Array<{ repr: unknown; keepSphere: boolean }> = [];
  const events = {
    created: subject(listeners.created),
    updated: subject(listeners.updated),
  };
  const plugin = {
    state: { data: { cells, events: { object: events } } },
    canvas3d: {
      update: (repr: unknown, keepSphere: boolean) => {
        updates.push({ repr, keepSphere });
      },
    },
  } as unknown as PluginContext;

  function show(ref: string, event?: 'created' | 'updated'): FakeModel {
    const layerCounts: number[] = [];
    const repr = {
      state: { overpaint: Overpaint.Empty },
      setState(update: { overpaint: Overpaint }) {
        repr.state = { overpaint: update.overpaint };
        layerCounts.push(update.overpaint.layers.length);
      },
    };
    const model: FakeModel = { repr, layerCounts };
    const obj = new PluginStateObject.Molecule.Structure.Representation3D({
      repr: repr as never,
      sourceData: structure,
    });
    cells.set(ref, { obj });
    if (event !== undefined) {
      for (const listener of listeners[event]) listener({ ref, obj });
    }
    return model;
  }

  return { plugin, updates, show };
}

function subject(listeners: ObjectListener[]) {
  return {
    subscribe(listener: ObjectListener) {
      listeners.push(listener);
      return {
        unsubscribe() {
          listeners.splice(listeners.indexOf(listener), 1);
        },
      };
    },
  };
}
