import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { plotRect } from '../../core/chartGeometry.ts';
import type { LegendEntry, TraceLegendProps } from '../TraceLegend.tsx';
import { TraceLegend } from '../TraceLegend.tsx';

// Rendered to a string rather than into a document: the legend holds no state
// of its own and answers no gesture, so what it draws is the whole of what
// there is to check — and where it draws it is the thing an HTML overlay of the
// same box has to agree with.

const plot = plotRect({ width: 600, height: 400 });

const channels: LegendEntry[] = [
  { id: 'tic', name: 'x 132', color: '#0072b2' },
  { id: 'bpc', name: 'y 88', color: '#d55e00' },
  { id: 'xic', name: 'z 100', color: '#009e73' },
];

/**
 * The legend three chromatogram channels ask for, said differently by one case.
 * @param overrides - What this case wants said differently.
 * @returns The markup the legend drew.
 */
function drawLegend(overrides: Partial<TraceLegendProps> = {}): string {
  return renderToStaticMarkup(
    <svg>
      <TraceLegend entries={channels} plot={plot} {...overrides} />
    </svg>,
  );
}

test('three channels are boxed in the top right of the plot', () => {
  const markup = drawLegend();

  expect(markup).toContain(
    '<rect x="516.5" y="16" width="61.5" height="54" rx="3"',
  );
});

test('each channel gets a swatch in its colour and its name on the same line', () => {
  const markup = drawLegend();

  // Rows are 14 apart and the first is centred 29 down, so a swatch and the
  // name beside it share a y or the legend has come apart.
  expect(markup).toContain(
    '<line x1="522.5" x2="536.5" y1="29" y2="29" stroke="#0072b2"',
  );
  expect(markup).toContain(
    '<line x1="522.5" x2="536.5" y1="43" y2="43" stroke="#d55e00"',
  );
  expect(markup).toContain(
    '<line x1="522.5" x2="536.5" y1="57" y2="57" stroke="#009e73"',
  );
  expect(textRows(markup)).toStrictEqual([
    { x: '541.5', y: '29', text: 'x 132' },
    { x: '541.5', y: '43', text: 'y 88' },
    { x: '541.5', y: '57', text: 'z 100' },
  ]);
});

test('a trace with no name is left out rather than drawn as a bare swatch', () => {
  const markup = drawLegend({
    entries: [...channels, { id: 'raw', name: '', color: '#cc79a7' }],
  });

  expect(textRows(markup)).toHaveLength(3);
  expect(markup).not.toContain('#cc79a7');
});

test('one named trace is not worth a legend, unless the caller says it is', () => {
  expect(drawLegend({ entries: channels.slice(0, 1) })).toBe('<svg></svg>');
  expect(
    textRows(drawLegend({ entries: channels.slice(0, 1), minimumEntries: 1 })),
  ).toStrictEqual([{ x: '541.5', y: '29', text: 'x 132' }]);
});

test('past the limit the rest are counted on a last row', () => {
  const markup = drawLegend({ limit: 2 });

  // `+ 1 more` is written in the same column as the names and is longer than
  // any of them here, so it is what the box was widened for: 31 + 8 × 6.1,
  // which moves the whole column left to 523.2.
  expect(markup).toContain('<rect x="498.2" y="16" width="79.8" height="54"');
  expect(textRows(markup)).toStrictEqual([
    { x: '523.2', y: '29', text: 'x 132' },
    { x: '523.2', y: '43', text: 'y 88' },
    { x: '523.2', y: '57', text: '+ 1 more' },
  ]);
});

test('an index is written before the name and a note at the right of the row', () => {
  const markup = drawLegend({
    entries: [
      { id: 'tic', name: 'x 1324', color: '#0072b2', index: 1, note: 'y 88' },
      { id: 'bpc', name: 'y 88', color: '#d55e00', index: 2 },
    ],
  });

  // The longest row now reads `1 · x 1324`, so the name column is sized on ten
  // characters — 31 + 10 × 6.1 — and the note takes 5 more of gap and 4 × 6.1
  // at the right, where it is anchored at the far edge of the box less its
  // padding rather than run on from the name.
  expect(markup).toContain('<rect x="456.6" y="16" width="121.4" height="40"');
  expect(textRows(markup)).toStrictEqual([
    { x: '481.6', y: '29', text: '1 · x 1324' },
    { x: '572', y: '29', text: 'y 88' },
    { x: '481.6', y: '43', text: '2 · y 88' },
  ]);
});

/**
 * Every line of writing in the legend, in the order it was drawn.
 * @param markup - What the legend rendered to.
 * @returns The horizontal position, the baseline and the words of each.
 */
function textRows(
  markup: string,
): Array<{ x: string; y: string; text: string }> {
  const rows: Array<{ x: string; y: string; text: string }> = [];
  const pattern = /<text x="(?<x>[^"]+)" y="(?<y>[^"]+)"[^>]*>(?<text>[^<]*)</g;
  let match = pattern.exec(markup);
  while (match !== null) {
    const { x, y, text } = match.groups as {
      x: string;
      y: string;
      text: string;
    };
    rows.push({ x, y, text });
    match = pattern.exec(markup);
  }
  return rows;
}
