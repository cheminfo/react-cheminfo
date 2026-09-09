import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { rowMatrix } from '../../../chart/core/index.ts';
import type {
  ScatterMatrixAxis,
  ScatterMatrixProps,
} from '../ScatterMatrix.tsx';
import { ScatterMatrix } from '../ScatterMatrix.tsx';
import type { ScatterGroup } from '../ScatterPlot.tsx';

const AXES: ScatterMatrixAxis[] = [
  { name: 'PC 1', share: 0.7296 },
  { name: 'PC 2', share: 0.2285 },
  { name: 'PC 3', share: 0.0367 },
  { name: 'PC 4', share: 0.0052 },
];

const GROUPS: ScatterGroup[] = [
  { id: 'setosa', label: 'Setosa', color: '#0072b2' },
  { id: 'versicolor', label: 'Versicolor', color: '#d55e00' },
  { id: 'virginica', label: 'Virginica', color: '#009e73' },
];

const GROUP_OF = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2];

const SCORES = rowMatrix(
  GROUP_OF.map((group, row) => [
    row - 6,
    (row % 4) - 2,
    row / 3 - 2,
    group - 1,
  ]),
);

const TICK_INK = 'font-size:11px';
const TITLE_INK = 'font-size:12px';

/* Six components over three groups, none of them collinear in any pair. */
const WIDE_AXES: ScatterMatrixAxis[] = Array.from({ length: 6 }, (_, axis) => ({
  name: `PC ${axis + 1}`,
  share: 0.5 / (axis + 1),
}));

const WIDE_GROUP_OF = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2];

const WIDE_SCORES = rowMatrix(
  WIDE_GROUP_OF.map((group, row) =>
    Array.from(
      { length: 6 },
      (_, axis) => Math.sin(row * (axis + 1) + axis) + group * (axis + 2),
    ),
  ),
);

test('four axes lay out sixteen cells, one per pair', () => {
  const html = render({});

  expect(html.match(/data-scatter-cell="/gu)).toHaveLength(16);
  expect(html).toContain('data-scatter-cell="0,0"');
  expect(html).toContain('data-scatter-cell="3,3"');
});

test('a container too narrow for four readable cells falls back to three', () => {
  const html = render({ width: 260 });

  expect(html.match(/data-scatter-cell="/gu)).toHaveLength(9);
  expect(html).not.toContain('data-scatter-cell="3,3"');
});

test('every cell says which pair it stands for and that it opens', () => {
  const html = render({});

  expect(html.match(/aria-label="/gu)).toHaveLength(16);
  expect(html).toContain('aria-label="PC 1 versus PC 1 — open"');
  expect(html).toContain('aria-label="PC 2 versus PC 1 — open"');
  expect(html).toContain('aria-label="PC 1 versus PC 4 — open"');
  expect(html.match(/role="button"/gu)).toHaveLength(16);
});

test('without a handler the cells are figures rather than buttons', () => {
  const html = render({ onSelectPair: undefined });

  expect(html.match(/role="img"/gu)).toHaveLength(16);
  expect(html).toContain('aria-label="PC 1 versus PC 1"');
  expect(html).not.toContain('— open');
  expect(html).not.toContain('tabindex');
});

test('only the outer cells are written on, so the inner grid stays legible', () => {
  for (const cell of cells(render({}))) {
    const outer = (cell.column === 0 && cell.row !== 0) || cell.row === 3;

    expect([cell.name, cell.markup.includes(TICK_INK)]).toStrictEqual([
      cell.name,
      outer,
    ]);
  }
});

test('the grid names each axis once along the foot and once up the side', () => {
  const html = render({});

  expect(html.match(new RegExp(TITLE_INK, 'gu'))).toHaveLength(7);
  expect(html).toContain('>PC 1 — 73.0 %</text>');
  expect(html).toContain('>PC 4 — 0.5 %</text>');
});

test('a cell too narrow for a share writes the component name alone', () => {
  const html = render({ width: 260 });

  expect(html).toContain('>PC 1</text>');
  expect(html).toContain('>PC 3</text>');
  expect(html).not.toContain('— 73.0 %');
  expect(html).not.toContain('>73.0 %</text>');
});

test('a diagonal carries its axis in one corner and its share in the other', () => {
  const html = render({});

  expect(html.match(/font-size:10px;font-variant-numeric/gu)).toHaveLength(4);
  expect(html).toContain('>73.0 %</text>');
  expect(html).toContain('>0.5 %</text>');
  expect(html).toContain('>PC 3</text>');
});

test('a diagonal stacks one band per group instead of drawing y = x', () => {
  const html = render({ bins: 1 });

  expect(html.match(/fill-opacity:0\.55/gu)).toHaveLength(12);
  expect(html.match(/fill:#0072b2;fill-opacity:0\.55/gu)).toHaveLength(4);
  expect(html.match(/fill:#009e73;fill-opacity:0\.55/gu)).toHaveLength(4);
});

test('rows outside the selection are drawn faint in every cell', () => {
  const html = render({ selected: [0, 1] });

  expect(html.match(/stroke-opacity:0\.85/gu)).toHaveLength(12);
  expect(html.match(/stroke-opacity:0\.16/gu)).toHaveLength(36);
});

test('a grid with no groups draws one crowd in the muted ink', () => {
  const html = render({ groups: undefined, groupOf: undefined });

  expect(html.match(/stroke:var\(--text-muted\)/gu)).toHaveLength(12);
  expect(html).not.toContain('#0072b2');
});

test('the pointer is only tracked where there are dots to rest on', () => {
  expect(render({}).match(/pointer-events:all/gu)).toBeNull();
  expect(
    render({ onHoverChange: () => null }).match(/pointer-events:all/gu),
  ).toHaveLength(12);
});

test('six components fill thirty-six cells when the data and the width allow', () => {
  const html = renderWide({});

  expect(html.match(/data-scatter-cell="/gu)).toHaveLength(36);
  expect(html).toContain('data-scatter-cell="5,5"');
  expect(html).toContain('>PC 6</text>');
});

test('a width that cannot hold six readable cells lays out five', () => {
  const html = renderWide({ width: 460 });

  expect(html.match(/data-scatter-cell="/gu)).toHaveLength(25);
  expect(html).not.toContain('data-scatter-cell="5,5"');
});

test('every cell outlines each group, translucent and under the dots', () => {
  const html = renderWide({});
  const cell = html.split('data-scatter-cell="1,0"', 2)[1] ?? '';

  expect(html.match(/data-layer="ellipses"/gu)).toHaveLength(30);
  expect(html.match(/<ellipse/gu)).toHaveLength(90);
  expect(html.match(/fill-opacity="0.1"/gu)).toHaveLength(90);
  expect(cell).toContain('fill="#0072b2" fill-opacity="0.1"');
  expect(cell.indexOf('data-layer="ellipses"')).toBeLessThan(
    cell.indexOf('stroke-linecap'),
  );
});

test('a cell too small to hold a readable outline draws only its dots', () => {
  const html = renderWide({ width: 420 });

  expect(html.match(/data-scatter-cell="/gu)).toHaveLength(25);
  expect(html).not.toContain('data-layer="ellipses"');
  expect(html.match(/stroke-linecap:round/gu)).toHaveLength(60);
});

test('the outlines are the map\u2019s, so turning them off turns off both', () => {
  const html = renderWide({ ellipse: null });

  expect(html).not.toContain('data-layer="ellipses"');
  expect(html.match(/data-scatter-cell="/gu)).toHaveLength(36);
});

test('a grid with no groups outlines nothing, there being nothing to outline', () => {
  const html = renderWide({ groups: undefined, groupOf: undefined });

  expect(html).not.toContain('data-layer="ellipses"');
});

function render(over: Partial<ScatterMatrixProps>): string {
  const props: ScatterMatrixProps = {
    scores: SCORES,
    axes: AXES,
    count: 4,
    width: 800,
    groupOf: GROUP_OF,
    groups: GROUPS,
    onSelectPair: () => null,
    ...over,
  };
  return renderToStaticMarkup((<ScatterMatrix {...props} />) as ReactElement);
}

function renderWide(over: Partial<ScatterMatrixProps>): string {
  const props: ScatterMatrixProps = {
    scores: WIDE_SCORES,
    axes: WIDE_AXES,
    width: 900,
    groupOf: WIDE_GROUP_OF,
    groups: GROUPS,
    ...over,
  };
  return renderToStaticMarkup((<ScatterMatrix {...props} />) as ReactElement);
}

function cells(
  html: string,
): Array<{ name: string; row: number; column: number; markup: string }> {
  const found = [];
  const parts = html.split('data-scatter-cell="');
  for (let index = 1; index < parts.length; index++) {
    const markup = parts[index] ?? '';
    const column = Number(markup.slice(0, 1));
    const row = Number(markup.slice(2, 3));
    found.push({ name: `cell ${column},${row}`, row, column, markup });
  }
  return found;
}
