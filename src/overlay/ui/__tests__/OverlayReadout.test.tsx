import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { OverlayReadoutRow } from '../OverlayReadout.tsx';
import { OverlayReadout } from '../OverlayReadout.tsx';

const MEASUREMENTS: readonly OverlayReadoutRow[] = [
  { label: 'Sepal length', value: '5.1 cm' },
  { label: 'Sepal width', value: '3.5 cm' },
  { label: 'Species', value: 'Setosa', color: '#e69f00' },
];

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

test('with room, the card opens down and to the right of the pointer', () => {
  const html = renderToStaticMarkup(
    <OverlayReadout
      x={20}
      y={20}
      boxWidth={600}
      boxHeight={400}
      title="Sample 12"
      rows={MEASUREMENTS}
    />,
  );

  expect(html).toContain('left:34px');
  expect(html).toContain('top:34px');
});

test('near the right edge the card opens to the left, not off the figure', () => {
  const html = renderToStaticMarkup(
    <OverlayReadout
      x={380}
      y={20}
      boxWidth={400}
      boxHeight={400}
      title="Sample 12"
      rows={MEASUREMENTS}
    />,
  );

  expect(left(html)).toBe(146);
  expect(left(html)).toBeLessThan(380);
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

function left(html: string): number {
  const found = /left:(?<pixels>\d+)px/.exec(html);
  return found === null ? Number.NaN : Number(found.groups?.pixels);
}
