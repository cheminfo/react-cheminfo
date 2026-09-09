import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { chartSeriesColor } from '../../core/index.ts';
import type { ChartSeries } from '../TrackedLineChart.tsx';
import { TrackedLineChart } from '../TrackedLineChart.tsx';

test('every visible series is drawn as one path, and a hidden one is not drawn', () => {
  const html = render({ series: [line(0), line(1), line(2), hidden(3)] });

  expect(count(html, /data-series="/g)).toBe(3);
  expect(count(html, /<path/g)).toBe(3);
  expect(html).toContain(`data-series="series-0"`);
  expect(html).not.toContain(`data-series="series-3"`);
});

test('a line is one path over the slot centres, with no element per point', () => {
  const html = render({ series: [line(0)], categories: ['a', 'b', 'c'] });

  expect(html).toContain('d="M83 46.67L229 193.33L375 46.67"');
  expect(count(html, /<circle/g)).toBe(0);
});

test('a bar series is one rect per slot, growing from the zero line', () => {
  const html = render({ series: [bars(0)], categories: ['a', 'b', 'c'] });

  const marks = html.slice(html.indexOf('data-series="series-0"'));

  expect(count(marks.slice(0, marks.indexOf('</g>')), /<rect/g)).toBe(3);
  expect(html).toContain(
    '<rect x="24.6" y="46.67" width="116.8" height="73.33"',
  );
  expect(html).toContain(
    '<rect x="170.6" y="120" width="116.8" height="73.33"',
  );
});

test('a muted series is drawn behind the rest, so it reads as background', () => {
  const first = { ...line(0), muted: true };
  const html = render({ series: [line(1), first] });

  expect(html.indexOf('data-series="series-0"')).toBeLessThan(
    html.indexOf('data-series="series-1"'),
  );
  expect(html).toContain('stroke-dasharray="4 3"');
});

test('sixty measurements write far fewer names than there are slots', () => {
  const categories = Array.from({ length: 60 }, (_, at) => `Measure ${at}`);
  const html = render({ categories, series: [line(0)] });

  expect(count(html, /<text/g)).toBe(6);
  expect(count(html, /<text/g)).toBeLessThanOrEqual(24);
  expect(html).toContain('>Measure 0</text>');
});

test('the pointer target is one focusable rectangle over the whole plot', () => {
  const html = render({ series: [line(0)], testId: 'variables' });

  expect(count(html, /role="button"/g)).toBe(1);
  expect(html).toContain('data-testid="variables"');
  expect(html).toContain('aria-label="Measurements"');
  expect(html).toContain('cursor:crosshair');
});

test('a tracked slot draws the crosshair and a marker on each series', () => {
  const html = render({ series: [line(0), line(1)], trackedIndex: 1 });

  expect(count(html, /<circle/g)).toBe(2);
  expect(html).toContain('d="M229 10V230"');
  expect(html).toContain('aria-label="Measurement b"');
});

test('the axis title and the y ticks are written outside the plot', () => {
  const html = renderToStaticMarkup(
    <TrackedLineChart
      categories={['a', 'b', 'c']}
      series={[line(0)]}
      width={460}
      height={260}
      xLabel="Wavenumber"
      y={{ label: 'Weight' }}
      label="What differs"
    />,
  );

  expect(html).toContain('>Wavenumber</text>');
  expect(html).toContain('>Weight</text>');
  expect(html).toContain('role="img"');
  expect(html).toContain('aria-label="What differs"');
});

test('the axis writes the tick labels it is handed, and the slot keeps its name', () => {
  const html = render({
    series: [line(0)],
    categories: ['878.9834 cm⁻¹', '879.9668 cm⁻¹', '880.9502 cm⁻¹'],
    tickLabels: ['879 cm⁻¹', '880 cm⁻¹', '881 cm⁻¹'],
    trackedIndex: 0,
  });

  expect(html).toContain('>879 cm⁻¹</text>');
  expect(html).not.toContain('>878.9834 cm⁻¹</text>');
  expect(html).toContain('aria-label="Measurement 878.9834 cm⁻¹"');
});

function render(over: Partial<Parameters<typeof TrackedLineChart>[0]>): string {
  return renderToStaticMarkup(
    <TrackedLineChart
      categories={['a', 'b', 'c']}
      series={[]}
      width={460}
      height={260}
      y={{ showTicks: false }}
      {...over}
    />,
  );
}

function line(index: number): ChartSeries {
  return {
    id: `series-${index}`,
    label: `Series ${index}`,
    values: [1, -1, 1],
    color: chartSeriesColor(index, 'component'),
  };
}

function bars(index: number): ChartSeries {
  return { ...line(index), kind: 'bar' };
}

function hidden(index: number): ChartSeries {
  return { ...line(index), visible: false };
}

function count(html: string, pattern: RegExp): number {
  return html.match(pattern)?.length ?? 0;
}

test('two sets of bars share a slot side by side rather than one hiding the other', () => {
  const both = render({
    series: [bars(0), bars(1)],
    categories: ['a', 'b', 'c'],
  });
  const alone = render({ series: [bars(0)], categories: ['a', 'b', 'c'] });

  // Each of the two is half as wide as one drawn on its own, and the second
  // starts where the first ends. Before this, both sets were the full slot
  // width at the same x, so the second simply painted over the first and a
  // reader saw one series where two were drawn.
  const first = widths(both, 'series-0');
  const second = widths(both, 'series-1');
  const only = widths(alone, 'series-0');

  expect(first[0]?.width).toBeCloseTo((only[0]?.width ?? 0) / 2, 5);
  expect(second[0]?.width).toBeCloseTo((only[0]?.width ?? 0) / 2, 5);
  expect(first[0]?.x).toBeLessThan(second[0]?.x ?? 0);
  expect((first[0]?.x ?? 0) + (first[0]?.width ?? 0)).toBeCloseTo(
    second[0]?.x ?? 0,
    5,
  );
});

/**
 * Every bar of one series, as numbers.
 * @param html - The rendered markup.
 * @param id - The `data-series` the bars carry.
 * @returns One entry per bar, in the order they are drawn.
 */
function widths(html: string, id: string): Array<{ x: number; width: number }> {
  const from = html.indexOf(`data-series="${id}"`);
  const group = html.slice(from, from + html.slice(from).indexOf('</g>'));
  const out: Array<{ x: number; width: number }> = [];
  for (const hit of group.matchAll(
    /<rect x="([\d.-]+)"[^>]*width="([\d.-]+)"/g,
  )) {
    out.push({ x: Number(hit[1]), width: Number(hit[2]) });
  }
  return out;
}
