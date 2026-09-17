import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { ParallelAxis } from '../../core/parallelTypes.ts';
import { ParallelCoordinates } from '../ParallelCoordinates.tsx';

// A drawing area of 600 × 200: the figure keeps 54 pixels either side and 26
// above, 22 below, so these are the numbers the markup is written in.
const WIDTH = 708;
const HEIGHT = 248;

const MW = Float64Array.from([50, 100, 150]);
const LOGP = Float64Array.from([0.5, 1, 1.5]);
const AXES: ParallelAxis[] = [
  { id: 'mw', label: 'MW', unit: 'g/mol', values: MW, domain: [0, 200] },
  { id: 'logP', label: 'logP', values: LOGP, domain: [0, 2] },
];

test('every axis is drawn once, named once, and can be found by its id', () => {
  const html = figure();

  expect(occurrences(html, 'class="parallel-axis"')).toBe(2);
  expect(html).toContain('data-parallel-axis="mw"');
  expect(html).toContain('data-parallel-axis="logP"');
  expect(html).toContain('data-parallel-brush="mw"');
  expect(occurrences(html, 'class="parallel-axis-label"')).toBe(2);
  expect(html).toContain('MW (g/mol)');
  expect(html).toContain('>logP<');
});

test('the first axis is flush with the left of the drawing area and the last with its right', () => {
  const html = figure();

  expect(html).toContain('transform="translate(0,0)"');
  expect(html).toContain('transform="translate(600,0)"');
  expect(html).toContain('transform="translate(54,26)"');
});

test('an axis carries the graduations the figure picked for it', () => {
  const html = figure();

  expect(occurrences(html, '<text')).toBe(10);
  expect(html).toContain('>0<');
  expect(html).toContain('>200<');
  expect(html).toContain('>1.5<');
});

test('a caller writes the graduations of a coded quantity itself', () => {
  const html = renderToStaticMarkup(
    <ParallelCoordinates
      axes={[
        {
          id: 'risk',
          label: 'Mutagenic',
          values: Float64Array.from([0, 1, 2]),
          domain: [0, 2],
          ticks: [
            { value: 0, label: 'none' },
            { value: 1, label: 'low' },
            { value: 2, label: 'high' },
          ],
        },
        AXES[0] as ParallelAxis,
      ]}
      width={WIDTH}
      height={HEIGHT}
    />,
  );

  expect(html).toContain('>none<');
  expect(html).toContain('>low<');
  expect(html).toContain('>high<');
});

test('a brushed interval is drawn as a band over the pixels it keeps', () => {
  const html = figure({ ranges: { mw: [50, 150] } });

  expect(html).toContain('class="parallel-axis-band"');
  expect(html).toContain('y="50"');
  expect(html).toContain('height="100"');
});

test('an unbrushed figure carries no band at all', () => {
  expect(figure()).not.toContain('class="parallel-axis-band"');
  expect(figure({ ranges: { mw: [] } })).not.toContain(
    'class="parallel-axis-band"',
  );
});

test('every interval of an axis that keeps several is drawn', () => {
  const html = figure({
    ranges: {
      mw: [
        [0, 50],
        [150, 200],
      ],
    },
    several: true,
  });

  expect(occurrences(html, 'class="parallel-axis-band"')).toBe(2);
  expect(html).toContain('y="0"');
  expect(html).toContain('y="150"');
});

test('the axis names are handles only when the caller takes the order', () => {
  expect(figure()).not.toContain('role="button"');

  const html = figure({ onAxisOrder: () => undefined });

  expect(occurrences(html, 'data-parallel-label=')).toBe(2);
  expect(html).toContain('role="button"');
  expect(html).toContain('tabindex="0"');
  expect(html).toContain('move this axis with the left and right arrow keys');
  expect(html).toContain('cursor:grab');
});

test('a figure with nothing to draw shows what the caller put in its place', () => {
  const html = renderToStaticMarkup(
    <ParallelCoordinates
      axes={[]}
      width={WIDTH}
      height={HEIGHT}
      empty={<p>Load a file to compare molecules.</p>}
    />,
  );

  expect(html).toContain('Load a file to compare molecules.');
  expect(html).not.toContain('<canvas');
});

test('the figure tells a screen reader what it shows, and the caller can say it better', () => {
  expect(figure()).toContain(
    'aria-label="Parallel coordinates of 3 rows, on MW, logP."',
  );
  expect(figure({ label: 'Nine properties of fourteen molecules' })).toContain(
    'aria-label="Nine properties of fourteen molecules"',
  );
});

test('a caller places the figure and finds it again', () => {
  const html = figure({ className: 'osiris-compare', testId: 'plot' });

  expect(html).toContain('class="parallel-coordinates osiris-compare"');
  expect(html).toContain('data-testid="plot"');
  expect(occurrences(html, '<canvas')).toBe(2);
});

test('a caller writes the axis names itself when a name has to explain itself', () => {
  const html = figure({
    renderAxisLabel: (axis) => <abbr title={axis.id}>{axis.label}</abbr>,
  });

  expect(html).toContain('<abbr title="mw">MW</abbr>');
});

function figure(
  props: Partial<Parameters<typeof ParallelCoordinates>[0]> = {},
): string {
  return renderToStaticMarkup(
    <ParallelCoordinates
      axes={AXES}
      width={WIDTH}
      height={HEIGHT}
      {...props}
    />,
  );
}

function occurrences(html: string, needle: string): number {
  let found = 0;
  let index = html.indexOf(needle);
  while (index >= 0) {
    found++;
    index = html.indexOf(needle, index + needle.length);
  }
  return found;
}
