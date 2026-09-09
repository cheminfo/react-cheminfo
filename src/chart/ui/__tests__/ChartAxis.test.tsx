import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { chartAxisScale, chartScale } from '../../core/index.ts';
import type { ChartAxisProps } from '../ChartAxis.tsx';
import { ChartAxis } from '../ChartAxis.tsx';
import type { ChartPlotArea } from '../ChartFrame.tsx';

const PLOT: ChartPlotArea = {
  left: 40,
  top: 10,
  right: 340,
  bottom: 210,
  width: 300,
  height: 200,
};

const LOADINGS = chartAxisScale(-0.5, 0.5, { count: 5 });
const COUNTS = chartAxisScale(0, 10, { count: 5 });

test('an axis writes one label per tick, and one more for what it measures', () => {
  const html = render({
    orientation: 'bottom',
    scale: LOADINGS,
    pixels: chartScale(-0.6, 0.6, PLOT.left, PLOT.right),
    plot: PLOT,
    label: 'PC 1 — 73.0 %',
  });

  expect(LOADINGS.values).toHaveLength(7);
  expect(html.match(/<text /gu)).toHaveLength(8);
  expect(html).toContain('>PC 1 — 73.0 %</text>');
  expect(html).toContain('>-0.6</text>');
  expect(html).toContain('>0.0</text>');
});

test('a domain that straddles zero gets exactly one rule there', () => {
  const html = render({
    orientation: 'left',
    scale: LOADINGS,
    pixels: chartScale(-0.6, 0.6, PLOT.bottom, PLOT.top),
    plot: PLOT,
  });

  expect(html.match(/data-chart-rule="zero"/gu)).toHaveLength(1);
  expect(html).toContain('<line data-chart-rule="zero" x1="40" x2="340"');
  expect(html).toContain(
    'stroke:var(--border-strong);stroke-width:1;stroke-opacity:0.6',
  );
});

test('the rule at zero stands in for its own grid line rather than doubling it', () => {
  const html = render({
    orientation: 'bottom',
    scale: LOADINGS,
    pixels: chartScale(-0.6, 0.6, PLOT.left, PLOT.right),
    plot: PLOT,
    layer: 'grid',
  });

  expect(html.match(/stroke:var\(--border\);/gu)).toHaveLength(6);
  expect(html.match(/data-chart-rule="zero"/gu)).toHaveLength(1);
});

test('an axis that never reaches zero draws no rule there', () => {
  const html = render({
    orientation: 'bottom',
    scale: COUNTS,
    pixels: chartScale(0, 10, PLOT.left, PLOT.right),
    plot: PLOT,
  });

  expect(html).not.toContain('data-chart-rule="zero"');
});

test('a cell that drops its grid keeps the line that says which side of nothing', () => {
  const html = render({
    orientation: 'bottom',
    scale: LOADINGS,
    pixels: chartScale(-0.6, 0.6, PLOT.left, PLOT.right),
    plot: PLOT,
    layer: 'grid',
    showGrid: false,
  });

  expect(html).not.toContain('stroke:var(--border);');
  expect(html.match(/data-chart-rule="zero"/gu)).toHaveLength(1);
});

test('the title carries the power of ten the labels were divided by', () => {
  const tiny = chartAxisScale(0, 1e-9, { count: 5 });
  const html = render({
    orientation: 'bottom',
    scale: tiny,
    pixels: chartScale(tiny.domain[0], tiny.domain[1], PLOT.left, PLOT.right),
    plot: PLOT,
    label: 'Wavelength',
  });

  expect(tiny.exponent).toBe(-9);
  expect(html).toContain('>Wavelength (×10⁻⁹)</text>');
  expect(html).toContain('>1.0</text>');
});

test('an unnamed axis whose labels were divided still says by what', () => {
  const tiny = chartAxisScale(0, 1e-9, { count: 5 });
  const html = render({
    orientation: 'bottom',
    scale: tiny,
    pixels: chartScale(tiny.domain[0], tiny.domain[1], PLOT.left, PLOT.right),
    plot: PLOT,
  });

  expect(html).toContain('> (×10⁻⁹)</text>');
});

test('an unnamed axis at everyday magnitudes writes nothing but its ticks', () => {
  const html = render({
    orientation: 'bottom',
    scale: COUNTS,
    pixels: chartScale(0, 10, PLOT.left, PLOT.right),
    plot: PLOT,
  });

  expect(html.match(/<text /gu)).toHaveLength(COUNTS.values.length);
});

test('the grid half rules the plot and says nothing; the axis half speaks', () => {
  const shared = {
    orientation: 'bottom',
    scale: COUNTS,
    pixels: chartScale(0, 10, PLOT.left, PLOT.right),
    plot: PLOT,
    label: 'Samples',
  } as const;

  const grid = render({ ...shared, layer: 'grid' });

  expect(grid).not.toContain('<text ');
  expect(grid).not.toContain('var(--border-strong)');
  expect(grid.match(/<line /gu)).toHaveLength(6);

  const axis = render({ ...shared, layer: 'axis' });

  expect(axis).not.toContain('stroke:var(--border);');
  expect(axis.match(/<text /gu)).toHaveLength(7);
});

test('an inner cell that drops its ticks pulls its title in to where they were', () => {
  const shared = {
    orientation: 'bottom',
    scale: COUNTS,
    pixels: chartScale(0, 10, PLOT.left, PLOT.right),
    plot: PLOT,
    label: 'Samples',
    layer: 'axis',
  } as const;

  expect(render(shared)).toContain('<text x="190" y="245"');
  expect(render({ ...shared, showTicks: false })).toContain(
    '<text x="190" y="223"',
  );
  expect(
    render({ ...shared, showTicks: false }).match(/<text /gu),
  ).toHaveLength(1);
});

test('a vertical axis writes its ticks to the left and its title on its side', () => {
  const html = render({
    orientation: 'left',
    scale: COUNTS,
    pixels: chartScale(0, 10, PLOT.bottom, PLOT.top),
    plot: PLOT,
    label: 'Counts',
    layer: 'axis',
  });

  expect(html).toContain('class="chart-axis chart-axis-left"');
  expect(html).toContain('text-anchor="end" dominant-baseline="middle"');
  expect(html).toContain('transform="rotate(-90 4 110)"');
  expect(html).toContain('<line x1="40" x2="40" y1="10" y2="210"');
});

function render(props: ChartAxisProps): string {
  return renderToStaticMarkup(
    <svg>
      <ChartAxis {...props} />
    </svg>,
  );
}
