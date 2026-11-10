/**
 * A scene written as SVG markup: each object a group naming what it draws,
 * the atoms and bonds of a molecule in its group, a background, and the
 * motion of glassware held still.
 */

import { expect, test } from 'vitest';

import type { Primitive, Scene, SceneItem } from '../primitives.ts';
import type { DrawingStyle } from '../style.ts';
import { sceneBody, sheetBody } from '../svg.ts';

const STYLE: DrawingStyle = {
  bondLength: 14.4,
  lineWidth: 0.6,
  fontFamily: 'Arial, Helvetica, sans-serif',
  captionSize: 10,
  captionFamily: 'Arial, Helvetica, sans-serif',
  color: '#000000',
};

const OPEN =
  '<g fill="none" stroke="#000000" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" font-family="Arial, Helvetica, sans-serif">';

function dot(kind: string, id: string, x = 1, y = 2): SceneItem {
  return { owner: { kind, id }, primitives: [{ kind: 'dot', x, y, r: 0.5 }] };
}

function circle(x = 1, y = 2, r = 0.5): string {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#000000" stroke="none"/>`;
}

function sceneOf(...items: SceneItem[]): Scene {
  return { items, bounds: { x: 0, y: 0, width: 10, height: 10 } };
}

test('each object is a group naming its kind and identifier, in paint order', () => {
  expect(
    sceneBody(sceneOf(dot('atom', 'a1'), dot('text', 't"1')), { style: STYLE }),
  ).toBe(
    `${OPEN}<g cd:atom="a1">${circle()}</g><g cd:text="t&quot;1">${circle()}</g></g>`,
  );

  const quoted = { ...STYLE, fontFamily: '"Courier New", monospace' };

  expect(sceneBody(sceneOf(), { style: quoted })).toContain(
    'font-family="&quot;Courier New&quot;, monospace"',
  );
});

test('the atoms and bonds of a molecule stand in its group, where its first one is painted', () => {
  const scene = sceneOf(
    dot('bond', 'b1'),
    dot('text', 't1'),
    dot('atom', 'a1'),
    dot('atom', 'a2'),
  );
  const labels = new Map([
    ['molecule:m1', 'Ethane "x"'],
    ['text:t1', 'Note'],
  ]);
  const body = sceneBody(scene, {
    style: STYLE,
    molecules: [{ id: 'm1', atoms: ['a1', 'a2', 'a9'], bonds: ['b1'] }],
    labels,
  });

  expect(body).toBe(
    `${OPEN}<g cd:molecule="m1" aria-label="Ethane &quot;x&quot;"><g cd:bond="b1">${circle()}</g><g cd:atom="a1">${circle()}</g><g cd:atom="a2">${circle()}</g></g><g cd:text="t1" aria-label="Note">${circle()}</g></g>`,
  );
});

test('an object in its own ink carries it as a stroke and an opacity', () => {
  const item: SceneItem = {
    owner: { kind: 'graphic', id: 'g1' },
    color: '#FF000080',
    primitives: [
      {
        kind: 'polygon',
        points: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1.004 },
        ],
      },
    ],
  };

  expect(sceneBody(sceneOf(item), { style: STYLE })).toBe(
    `${OPEN}<g cd:graphic="g1" stroke="#ff0000" opacity="0.5"><polygon points="0,0 1,0 0,1" fill="#ff0000" stroke="none"/></g></g>`,
  );
});

test('a background is a rectangle the size of the figure, centred on the drawing', () => {
  const style = { ...STYLE, background: '#ffffff80' };

  expect(
    sceneBody(sceneOf(), { style, figure: { width: 30 } }).replace(OPEN, ''),
  ).toBe(
    '<rect cd:background="true" x="-10" y="-4" width="30" height="18" fill="#ffffff" fill-opacity="0.5"/></g>',
  );
  expect(
    sceneBody(sceneOf(), { style: { ...STYLE, background: '#ffffff' } }),
  ).toBe(
    `<rect cd:background="true" x="-4" y="-4" width="18" height="18" fill="#ffffff"/>${OPEN}</g>`,
  );
});

test('a stir bar turns as a whole; a paddle turns alone under its shaft', () => {
  const bar: SceneItem = {
    owner: { kind: 'glass', id: 'g1' },
    turning: 30,
    primitives: [{ kind: 'path', d: 'M0 0L1 1', width: 0.6, extent: [] }],
  };

  expect(sceneBody(sceneOf(bar), { style: STYLE })).toBe(
    `${OPEN}<g cd:glass="g1" class="glass-turning" style="--glass-lying: 30deg"><path d="M0 0L1 1"/></g></g>`,
  );

  const stirrer: SceneItem = {
    owner: { kind: 'glass', id: 'g2' },
    turning: 0,
    primitives: [
      { kind: 'path', d: 'M0 0', width: 0.6, extent: [] },
      { kind: 'path', d: 'M1 1', width: 0.6, extent: [], turns: true },
    ],
  };

  expect(sceneBody(sceneOf(stirrer), { style: STYLE })).toBe(
    `${OPEN}<g cd:glass="g2"><path d="M0 0"/><g class="glass-turning" style="--glass-lying: 0deg"><path d="M1 1"/></g></g></g>`,
  );
});

test('a sheet shows what reaches it, over a background filling it edge to edge', () => {
  const blank: SceneItem = {
    owner: { kind: 'mark', id: 'm1' },
    primitives: [],
  };
  const scene: Scene = {
    items: [dot('atom', 'a1', 5, 5), dot('atom', 'a2', 150, 5), blank],
    bounds: { x: 0, y: 0, width: 160, height: 10 },
  };
  const sheet = { x: 0, y: 0, width: 100, height: 100 };

  expect(
    sheetBody(scene, sheet, { style: { ...STYLE, background: '#ffffff' } }),
  ).toBe(
    `<rect cd:background="true" x="0" y="0" width="100" height="100" fill="#ffffff"/>${OPEN}<g cd:atom="a1">${circle(5, 5)}</g></g>`,
  );
  expect(sheetBody(scene, { ...sheet, x: 100 }, { style: STYLE })).toBe(
    `${OPEN}<g cd:atom="a2">${circle(150, 5)}</g></g>`,
  );
});

test('a primitive of no known kind writes nothing', () => {
  const item: SceneItem = {
    owner: { kind: 'mark', id: 'x' },
    primitives: [{ kind: 'unknown' } as unknown as Primitive],
  };

  expect(sceneBody(sceneOf(item), { style: STYLE })).toBe(
    `${OPEN}<g cd:mark="x"></g></g>`,
  );
});
