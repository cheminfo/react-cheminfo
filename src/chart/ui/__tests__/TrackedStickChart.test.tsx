import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { TrackedStickChart } from '../TrackedStickChart.tsx';

/** Four peaks with a wide gap in the middle, the shape a peak list has. */
const POSITIONS = [206.1176, 252.0398, 725.5566, 881.7559];
const NAMES = POSITIONS.map((mass) => `${mass} m/z`);

test('a series is one path however many peaks it holds', () => {
  const html = renderToStaticMarkup(
    <TrackedStickChart
      positions={POSITIONS}
      categories={NAMES}
      series={[
        {
          id: 'pc1',
          label: 'PC1',
          values: [0.4, -0.2, 0.1, 0.3],
          color: '#e69f00',
        },
      ]}
      width={600}
      height={160}
    />,
  );

  // One element for the series, however many peaks it holds.
  expect(occurrences(html, 'data-series=')).toBe(1);

  // Four sticks, each a move and a vertical line, in the one `d`.
  const drawn = pathOf(html, 'pc1');

  expect(occurrences(drawn, 'M')).toBe(4);
  expect(occurrences(drawn, 'V')).toBe(4);
});

test('a peak stands where it was measured, not in a slot of its own', () => {
  const html = renderToStaticMarkup(
    <TrackedStickChart
      positions={POSITIONS}
      categories={NAMES}
      series={[
        { id: 'pc1', label: 'PC1', values: [1, 1, 1, 1], color: '#e69f00' },
      ]}
      width={600}
      height={160}
    />,
  );

  const at = stickPositions(pathOf(html, 'pc1'));

  expect(at).toHaveLength(4);

  // 206 to 252 is 46 of the 675 the axis covers; 252 to 725 is 473 of it. The
  // second gap is over ten times the first, and the drawing has to say so —
  // this is the whole difference from a band axis, where both are one slot.
  const first = (at[1] as number) - (at[0] as number);
  const second = (at[2] as number) - (at[1] as number);

  expect(second / first).toBeGreaterThan(9);
});

test('a stick stands on the zero rule, and a span stands between its two ends', () => {
  const html = renderToStaticMarkup(
    <TrackedStickChart
      positions={POSITIONS}
      categories={NAMES}
      series={[
        {
          id: 'span',
          label: 'PC1',
          values: [0.9, 0.9, 0.9, 0.9],
          from: [0.5, 0.5, 0.5, 0.5],
          color: '#e69f00',
        },
        {
          id: 'plain',
          label: 'PC2',
          values: [0.9, 0.9, 0.9, 0.9],
          color: '#56b4e9',
        },
      ]}
      width={600}
      height={160}
    />,
  );

  const span = endsOf(pathOf(html, 'span'));
  const plain = endsOf(pathOf(html, 'plain'));

  // Both end at the same height; only the one with `from` starts above zero.
  expect(span.to).toBeCloseTo(plain.to, 6);
  expect(span.from).toBeLessThan(plain.from);
  // Every value here is positive, so zero is the foot of the axis and the
  // frame rules nothing across the plot; the plain stick stands on it anyway.
  expect(html).not.toContain('data-chart-rule="zero"');
  expect(plain.from).toBe(130);
});

test('a signed series stands on the rule the frame draws through zero', () => {
  const html = renderToStaticMarkup(
    <TrackedStickChart
      positions={POSITIONS}
      categories={NAMES}
      series={[
        {
          id: 'pc1',
          label: 'PC1',
          values: [0.4, -0.2, 0.1, 0.3],
          color: '#e69f00',
        },
      ]}
      width={600}
      height={160}
    />,
  );

  // Weights go both ways, so zero is inside the plot and is ruled there.
  expect(html).toContain('data-chart-rule="zero"');

  const feet = new Set(
    [...pathOf(html, 'pc1').matchAll(/M[\d.]+ (?<y>[\d.]+)V/g)].map(
      (found) => found.groups?.y,
    ),
  );

  // Every stick starts from the same place, and that place is the rule.
  expect(feet.size).toBe(1);
  expect(Number([...feet][0])).toBeCloseTo(ruleAt(html), 1);
});

test('a single peak still draws an axis rather than collapsing to a point', () => {
  const html = renderToStaticMarkup(
    <TrackedStickChart
      positions={[782.5669]}
      categories={['782.5669 m/z']}
      series={[{ id: 'pc1', label: 'PC1', values: [0.256], color: '#e69f00' }]}
      width={600}
      height={160}
    />,
  );

  const at = stickPositions(pathOf(html, 'pc1'));

  expect(at).toHaveLength(1);
  expect(Number.isFinite(at[0] as number)).toBe(true);
});

test('a measurement that is not a number is left out rather than drawn at zero', () => {
  const html = renderToStaticMarkup(
    <TrackedStickChart
      positions={POSITIONS}
      categories={NAMES}
      series={[
        {
          id: 'pc1',
          label: 'PC1',
          values: [0.4, Number.NaN, 0.1, 0.3],
          color: '#e69f00',
        },
      ]}
      width={600}
      height={160}
    />,
  );

  expect(stickPositions(pathOf(html, 'pc1'))).toHaveLength(3);
});

function pathOf(html: string, id: string): string {
  const start = html.indexOf(`data-series="${id}"`);
  if (start === -1) return '';
  const from = html.indexOf('d="', start) + 3;
  return html.slice(from, html.indexOf('"', from));
}

function stickPositions(path: string): number[] {
  const found: number[] = [];
  for (const match of path.matchAll(/M(?<x>-?[\d.]+) /g)) {
    found.push(Number(match.groups?.x));
  }
  return found;
}

function endsOf(path: string): { from: number; to: number } {
  const match = /M-?[\d.]+ (?<from>-?[\d.]+)V(?<to>-?[\d.]+)/.exec(path);
  return {
    from: Number(match?.groups?.from),
    to: Number(match?.groups?.to),
  };
}

function ruleAt(html: string): number {
  const match = /data-chart-rule="zero"[^>]*y1="(?<y>[\d.]+)"/.exec(html);
  return Number(match?.groups?.y);
}

function occurrences(html: string, needle: string): number {
  return html.split(needle).length - 1;
}

test('the axis covers the peaks, not a stretch of masses nothing was measured at', () => {
  const html = renderToStaticMarkup(
    <TrackedStickChart
      positions={POSITIONS}
      categories={NAMES}
      series={[
        { id: 'pc1', label: 'PC1', values: [1, 1, 1, 1], color: '#e69f00' },
      ]}
      width={600}
      height={160}
      xLabel="m/z"
    />,
  );

  const labels = [
    ...html.matchAll(/user-select:none">(?<text>[\d,]+)<\/text>/g),
  ]
    .map((found) => Number((found.groups?.text ?? '').replaceAll(',', '')))
    .filter((value) => value >= 100);

  // The lowest peak is at 206, so the axis starts at 200 and not at 0: a pad
  // before nicing would have dropped it a whole step and given a fifth of the
  // plot to masses the run never reached.
  expect(Math.min(...labels)).toBe(200);
});
