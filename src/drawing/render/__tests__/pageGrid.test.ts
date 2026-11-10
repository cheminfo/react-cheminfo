/**
 * The box a saved figure takes up, and the grid of sheets a paper divides the
 * plane into: which of them print, and where their lines run across a view.
 */

import { expect, test } from 'vitest';

import {
  MAX_SHEETS,
  enclosingBox,
  figureBox,
  paddedBox,
  pageSheets,
  sheetLines,
} from '../pageGrid.ts';
import type { Scene, SceneItem } from '../primitives.ts';

const scene: Scene = {
  items: [],
  bounds: { x: 10, y: 20, width: 100, height: 40 },
};

// A round dot of a point's radius, drawn at a place.
function dot(x: number, y: number): SceneItem {
  return {
    owner: { kind: 'atom', id: `a${x}:${y}` },
    primitives: [{ kind: 'dot', x, y, r: 1 }],
  };
}

// A scene holding some dots, the box they fit in being its bounds.
function sceneOf(...items: SceneItem[]): Scene {
  const boxes = items.map(({ primitives }) => {
    const [first] = primitives;
    if (first?.kind !== 'dot') throw new Error('a dot was expected');
    return { x: first.x - 1, y: first.y - 1, width: 2, height: 2 };
  });
  return { items, bounds: enclosingBox(boxes) };
}

const GRID = { width: 100, height: 200, x: 0, y: 0 };

test('with no size set, the figure is the drawing and its padding', () => {
  expect(figureBox(scene)).toStrictEqual(paddedBox(scene));
  expect(figureBox(scene)).toStrictEqual({
    x: 6,
    y: 16,
    width: 108,
    height: 48,
  });
  expect(paddedBox(scene, 0)).toStrictEqual(scene.bounds);
});

test('an empty drawing is padded to at least a point each way', () => {
  const empty: Scene = {
    items: [],
    bounds: { x: 5, y: 5, width: 0, height: 0 },
  };

  expect(paddedBox(empty, 0)).toStrictEqual({
    x: 5,
    y: 5,
    width: 1,
    height: 1,
  });
});

test('a figure of a set size is centred on the drawing', () => {
  expect(figureBox(scene, { width: 200, height: 100 })).toStrictEqual({
    x: -40,
    y: -10,
    width: 200,
    height: 100,
  });
});

test('a side left out fits the drawing, and a narrow figure cuts it', () => {
  expect(figureBox(scene, { width: 60 })).toStrictEqual({
    x: 30,
    y: 16,
    width: 60,
    height: 48,
  });
});

test('nothing drawn, the first sheet of the grid stands for it', () => {
  expect(pageSheets({ items: [], bounds: scene.bounds }, GRID)).toStrictEqual([
    { x: 0, y: 0, width: 100, height: 200 },
  ]);

  const unplaced = { width: 200, height: 100 };

  expect(
    pageSheets({ items: [], bounds: scene.bounds }, unplaced),
  ).toStrictEqual([{ x: -40, y: -10, width: 200, height: 100 }]);
});

test('each sheet that holds something prints, in reading order', () => {
  const held = sceneOf(dot(350, 50), dot(50, 50), dot(50, 250), dot(150, 50));

  expect(pageSheets(held, GRID)).toStrictEqual([
    { x: 0, y: 0, width: 100, height: 200 },
    { x: 100, y: 0, width: 100, height: 200 },
    { x: 300, y: 0, width: 100, height: 200 },
    { x: 0, y: 200, width: 100, height: 200 },
  ]);
});

test('the grid stays put when the drawing moves, up and left included', () => {
  expect(pageSheets(sceneOf(dot(-50, -50)), GRID)).toStrictEqual([
    { x: -100, y: -200, width: 100, height: 200 },
  ]);

  const placed = { ...GRID, x: 20, y: 30 };

  expect(pageSheets(sceneOf(dot(50, 50)), placed)).toStrictEqual([
    { x: 20, y: 30, width: 100, height: 200 },
  ]);
  expect(pageSheets(sceneOf(dot(10, 50)), placed)).toStrictEqual([
    { x: -80, y: 30, width: 100, height: 200 },
  ]);
});

test('an object across a line prints on both sheets; one grazing it does not', () => {
  expect(pageSheets(sceneOf(dot(100, 50)), GRID)).toHaveLength(1);

  const bond: SceneItem = {
    owner: { kind: 'bond', id: 'b1' },
    primitives: [
      { kind: 'line', from: { x: 90, y: 50 }, to: { x: 110, y: 50 }, width: 1 },
    ],
  };

  expect(
    pageSheets({ items: [bond], bounds: scene.bounds }, GRID),
  ).toStrictEqual([
    { x: 0, y: 0, width: 100, height: 200 },
    { x: 100, y: 0, width: 100, height: 200 },
  ]);
});

test('an item that draws nothing takes no sheet', () => {
  const blank: SceneItem = {
    owner: { kind: 'mark', id: 'm1' },
    primitives: [],
  };

  expect(
    pageSheets({ items: [blank, dot(150, 50)], bounds: scene.bounds }, GRID),
  ).toStrictEqual([{ x: 100, y: 0, width: 100, height: 200 }]);
});

test('a grid has no sheets past the limit', () => {
  const huge: SceneItem = {
    owner: { kind: 'graphic', id: 'g1' },
    primitives: [
      {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 1e6, y: 1e6 },
        ],
      },
    ],
  };
  const sheets = pageSheets({ items: [huge], bounds: scene.bounds }, GRID);

  expect(sheets).toHaveLength(MAX_SHEETS);
});

test('boxes fit in the box enclosing them all', () => {
  expect(
    enclosingBox([
      { x: 0, y: 0, width: 10, height: 10 },
      { x: -5, y: 4, width: 2, height: 20 },
    ]),
  ).toStrictEqual({ x: -5, y: 0, width: 15, height: 24 });
});

test('the lines of a grid run across the view, on every sheet edge in it', () => {
  const visible = { x: 50, y: -10, width: 200, height: 220 };

  expect(sheetLines({ x: 0, y: 0, width: 100, height: 200 }, visible)).toBe(
    'M100 -10V210M200 -10V210M50 0H250M50 200H250',
  );
});

test('sheets too small to see at this zoom draw no lines', () => {
  expect(
    sheetLines(
      { x: 0, y: 0, width: 1, height: 1 },
      { x: 0, y: 0, width: 5000, height: 5000 },
    ),
  ).toBe('');
});
