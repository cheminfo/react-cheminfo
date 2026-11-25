import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { OverlayReadoutRow } from '../OverlayReadout.tsx';
import { OverlayReadout } from '../OverlayReadout.tsx';

const MEASUREMENTS: readonly OverlayReadoutRow[] = [
  { label: 'Sepal length', value: '5.1 cm' },
  { label: 'Sepal width', value: '3.5 cm' },
  { label: 'Species', value: 'Setosa', color: '#e69f00' },
];

test('the card is a designed card: its title a step larger and ruled off, its values bold, at the everyday density', () => {
  const html = renderToStaticMarkup(
    <OverlayReadout
      x={10}
      y={10}
      boxWidth={600}
      boxHeight={400}
      title="#129"
      rows={MEASUREMENTS.slice(0, 1)}
    />,
  );
  const styles = [...html.matchAll(/style="(?<rules>[^"]*)"/g)].map(
    (match) => match.groups?.rules,
  );

  expect(styles.slice(0, 2)).toStrictEqual([
    'display:flex;flex-direction:column;gap:2px;box-sizing:border-box;padding:6px 8px;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface);box-shadow:var(--shadow-md);color:var(--text);font-size:12px;line-height:1.4;white-space:nowrap;max-width:280px;position:absolute;z-index:2;pointer-events:none;left:0;top:0;visibility:hidden',
    'display:flex;align-items:center;justify-content:space-between;gap:8px;padding-bottom:2px;margin-bottom:2px;border-bottom:1px solid var(--border);font-size:13px;font-weight:600',
  ]);
  expect(styles.at(-1)).toBe(
    'margin-left:auto;font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap',
  );
});

test('forty rows are cut to twelve, and the rest are one line saying so', () => {
  const html = renderToStaticMarkup(
    <OverlayReadout
      x={10}
      y={10}
      boxWidth={600}
      boxHeight={400}
      title="Sample 12"
      rows={rows(40)}
    />,
  );

  expect(html).toContain('Sample 12');
  expect(html).toContain('Row 11');
  expect(html).not.toContain('Row 12');
  expect(html).toContain('+ 28 more — click to keep this open');
});

test('a pinned card scrolls its rows rather than dropping them', () => {
  const html = renderToStaticMarkup(
    <OverlayReadout
      x={10}
      y={10}
      boxWidth={600}
      boxHeight={400}
      title="Sample 12"
      rows={rows(40)}
      pinned
    />,
  );

  expect(html).toContain('overflow-y:auto');
  expect(html).toContain('Row 39');
  expect(html).not.toContain('more —');
});

test('a pinned card takes the pointer back and offers the way out', () => {
  const following = renderToStaticMarkup(
    <OverlayReadout
      x={10}
      y={10}
      boxWidth={600}
      boxHeight={400}
      title="Sample 12"
      rows={MEASUREMENTS}
    />,
  );
  const pinned = renderToStaticMarkup(
    <OverlayReadout
      x={10}
      y={10}
      boxWidth={600}
      boxHeight={400}
      title="Sample 12"
      rows={MEASUREMENTS}
      pinned
      onUnpin={() => null}
    />,
  );

  expect(following).toContain('pointer-events:none');
  expect(following).toContain('role="tooltip"');
  expect(following).not.toContain('aria-label="Dismiss"');
  expect(pinned).toContain('pointer-events:auto');
  expect(pinned).toContain('user-select:text');
  expect(pinned).toContain('role="group"');
  expect(pinned).toContain('aria-label="Sample 12"');
  expect(pinned).toContain('aria-label="Dismiss"');
});

test('a row belonging to one series carries that series colour', () => {
  const html = renderToStaticMarkup(
    <OverlayReadout
      x={20}
      y={20}
      boxWidth={600}
      boxHeight={400}
      title="Sample 12"
      rows={MEASUREMENTS}
      testId="point-readout"
    />,
  );

  expect(html).toContain('background:#e69f00');
  expect(html).toContain('Sepal length');
  expect(html).toContain('5.1 cm');
  expect(html).toContain('data-testid="point-readout"');
});

function rows(count: number): OverlayReadoutRow[] {
  const written: OverlayReadoutRow[] = [];
  for (let index = 0; index < count; index++) {
    written.push({ label: `Row ${index}`, value: `${index} cm` });
  }
  return written;
}
