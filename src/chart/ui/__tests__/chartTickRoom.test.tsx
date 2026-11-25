import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { textWidth } from '../../../drawing/render/metrics.ts';
import { chartSeriesColor } from '../../core/index.ts';
import type { ChartAxisSpec } from '../ChartFrame.tsx';
import { ChartFrame } from '../ChartFrame.tsx';
import { TrackedLineChart } from '../TrackedLineChart.tsx';
import { chartFrameGeometry } from '../chartFrameGeometry.ts';

const POSITIONS: ChartAxisSpec = { domain: [0, 10], label: 'Position' };
const VALUES: ChartAxisSpec = {
  domain: [0, 60_000],
  label: 'Value',
  format: String,
};

test('an axis is written by the writer it is handed, and grouped without one', () => {
  const written = chartFrameGeometry(400, 300, POSITIONS, VALUES);
  const grouped = chartFrameGeometry(400, 300, POSITIONS, {
    domain: [0, 60_000],
    label: 'Value',
  });

  expect(written.yAxis.labels).toStrictEqual([
    '0',
    '10000',
    '20000',
    '30000',
    '40000',
    '50000',
    '60000',
  ]);
  expect(grouped.yAxis.labels).toStrictEqual([
    '0',
    '10,000',
    '20,000',
    '30,000',
    '40,000',
    '50,000',
    '60,000',
  ]);
});

test('a vertical axis of wide labels takes their room, and its title clears them', () => {
  const { plot } = chartFrameGeometry(400, 300, POSITIONS, VALUES);
  const html = renderToStaticMarkup(
    <ChartFrame width={400} height={300} x={POSITIONS} y={VALUES}>
      {() => null}
    </ChartFrame>,
  );
  const title = /transform="rotate\(-90 (?<x>-?[\d.]+) /u.exec(html)?.groups;
  const titleX = Number(title?.x);

  expect(plot).toStrictEqual({
    left: 76,
    top: 10,
    right: 388,
    bottom: 249,
    width: 312,
    height: 239,
  });
  expect(html).toContain('transform="rotate(-90 23 129.5)"');
  expect(titleX).toBe(23);
  expect(titleX).toBeLessThan(
    plot.left - 8 - textWidth('60000', 12) * 1.15 - 4,
  );
});

test('labels that fit the usual room keep the geometry every chart had', () => {
  const { plot } = chartFrameGeometry(400, 300, POSITIONS, {
    domain: [-1, 1],
    label: 'PC 2 — 22.9 %',
  });

  expect(plot.left).toBe(61);
});

test('a line chart writes its values and makes its room with the same writer', () => {
  const html = renderToStaticMarkup(
    <TrackedLineChart
      width={400}
      height={300}
      categories={['a', 'b', 'c']}
      series={[
        {
          id: 'counts',
          label: 'Counts',
          values: [0, 60_000, 30_000],
          color: chartSeriesColor(0),
        },
      ]}
      y={{ label: 'Count', format: String }}
    />,
  );

  expect(html).toContain('>60000</text>');
  expect(html).not.toContain('60,000');
  expect(html).toContain('transform="rotate(-90 23 ');
});
