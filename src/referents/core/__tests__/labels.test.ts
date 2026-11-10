import { expect, test } from 'vitest';

import { adoptLabelTokens } from '../labelTokens.ts';
import { labelAttributes, readFigureLabels, relabelFigure } from '../labels.ts';

const FIGURE = `<svg><g><text x="1" y="2"${labelAttributes({ key: 'k1' })} font-weight="bold">1</text><text>yield 80%</text><text${labelAttributes({ key: 'k2', row: 'r"2' })}>2a</text></g></svg>`;

test('a label carries its referent, and its row for a member', () => {
  expect(labelAttributes({ key: 'k2', row: 'r"2' })).toBe(
    ' data-cheminfo-ref="k2" data-cheminfo-row="r&quot;2"',
  );
  expect(readFigureLabels(FIGURE)).toStrictEqual([
    { key: 'k1', text: '1' },
    { key: 'k2', row: 'r"2', text: '2a' },
  ]);
});

test('a document writes its numbers over the labels, and nothing else', () => {
  const svg = relabelFigure(FIGURE, ({ key, row }) =>
    key === 'k1' ? '5' : `<3${row === undefined ? '' : 'b'}`,
  );

  expect(svg).toBe(
    '<svg><g><text x="1" y="2" data-cheminfo-ref="k1" font-weight="bold">5</text><text>yield 80%</text><text data-cheminfo-ref="k2" data-cheminfo-row="r&quot;2">&lt;3b</text></g></svg>',
  );
  expect(readFigureLabels(svg).map(({ text }) => text)).toStrictEqual([
    '5',
    '<3b',
  ]);
});

test('relabelling to what the labels already read leaves the figure as it was', () => {
  const svg = relabelFigure(FIGURE, ({ key }) => (key === 'k1' ? '1' : '2a'));

  expect(svg).toBe(FIGURE);
});

test('a label holding several runs is written as one', () => {
  const svg = `<svg><text${labelAttributes({ key: 'k' })}><tspan>1</tspan><tspan>a</tspan></text></svg>`;

  expect(relabelFigure(svg, () => '12')).toBe(
    '<svg><text data-cheminfo-ref="k">12</text></svg>',
  );
});

test('@ tokens typed in any figure become labels, attributes and addresses left alone', () => {
  const svg =
    '<svg><text x="3">@aldehyde → @acid-2, @aldehyde</text><text data-x="@no">mail me@host.org</text><desc>@not-text</desc></svg>';
  const adopted = adoptLabelTokens(svg);

  expect(adopted.referents).toStrictEqual([
    { key: 'aldehyde', name: 'aldehyde' },
    { key: 'acid-2', name: 'acid-2' },
  ]);
  expect(adopted.svg).toBe(
    '<svg><text x="3"><tspan data-cheminfo-ref="aldehyde">aldehyde</tspan> → <tspan data-cheminfo-ref="acid-2">acid-2</tspan>, <tspan data-cheminfo-ref="aldehyde">aldehyde</tspan></text><text data-x="@no">mail me@host.org</text><desc>@not-text</desc></svg>',
  );
  expect(
    relabelFigure(adopted.svg, ({ key }) => (key === 'aldehyde' ? '1' : '2')),
  ).toBe(
    '<svg><text x="3"><tspan data-cheminfo-ref="aldehyde">1</tspan> → <tspan data-cheminfo-ref="acid-2">2</tspan>, <tspan data-cheminfo-ref="aldehyde">1</tspan></text><text data-x="@no">mail me@host.org</text><desc>@not-text</desc></svg>',
  );
});

test('a figure without tokens is handed back as it is', () => {
  const svg = '<svg><text>5 → 6</text></svg>';

  expect(adoptLabelTokens(svg)).toStrictEqual({ svg, referents: [] });
});
