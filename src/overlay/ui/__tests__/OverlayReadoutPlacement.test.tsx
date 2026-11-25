// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';

import type { OverlayReadoutRow } from '../OverlayReadout.tsx';
import { OverlayReadout } from '../OverlayReadout.tsx';

const MEASUREMENTS: readonly OverlayReadoutRow[] = [
  { label: 'Sepal length', value: '5.1 cm' },
  { label: 'Sepal width', value: '3.5 cm' },
];

let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  vi.unstubAllGlobals();
});

/**
 * A readout drawn, then measured at a size, as the browser measures it.
 * @param props - Where the pointer is, and the figure's size.
 * @param props.x - The pointer, from the figure's left.
 * @param props.y - The pointer, from its top.
 * @param props.boxWidth - The figure's width.
 * @param card - The card's size as drawn.
 * @param card.width - Its width.
 * @param card.height - Its height.
 * @returns The card's style before and after it is measured.
 */
function measuredAt(
  props: { x: number; y: number; boxWidth: number },
  card: { width: number; height: number },
): { before: string; after: string } {
  const observers: Array<(entries: unknown[]) => void> = [];
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: (entries: unknown[]) => void) {
        observers.push(callback);
      }

      observe(): void {
        // The test reports the size itself.
      }

      disconnect(): void {
        // Nothing to release.
      }
    },
  );
  const host = document.createElement('div');
  document.body.append(host);
  const created = createRoot(host);
  root = created;
  act(() => {
    created.render(
      <OverlayReadout
        {...props}
        boxHeight={400}
        title="Sample 12"
        rows={MEASUREMENTS}
      />,
    );
  });
  const style = () =>
    host.querySelector('[role="tooltip"]')?.getAttribute('style') ?? '';
  const before = style();
  act(() => {
    for (const observer of observers) {
      observer([
        {
          contentRect: card,
          borderBoxSize: [{ inlineSize: card.width, blockSize: card.height }],
        },
      ]);
    }
  });
  return { before, after: style() };
}

/**
 * Where a card's style puts it.
 * @param style - The card's style attribute.
 * @returns Its left and top, CSS pixels, and whether it is hidden.
 */
function placeOf(style: string): {
  left: number;
  top: number;
  hidden: boolean;
} {
  return {
    left: Number(/left: (?<px>[\d.]+)px/.exec(style)?.groups?.px),
    top: Number(/top: (?<px>[\d.]+)px/.exec(style)?.groups?.px),
    hidden: style.includes('visibility: hidden'),
  };
}

test('the card is hidden until measured, then opens down and to the right of the pointer', () => {
  const { before, after } = measuredAt(
    { x: 20, y: 20, boxWidth: 600 },
    { width: 200, height: 80 },
  );

  expect([placeOf(before), placeOf(after)]).toStrictEqual([
    { left: 0, top: 0, hidden: true },
    { left: 34, top: 34, hidden: false },
  ]);
});

test('measured near the right edge, the card opens to the left, not off the figure', () => {
  const { after } = measuredAt(
    { x: 380, y: 20, boxWidth: 400 },
    { width: 220, height: 80 },
  );

  expect(placeOf(after)).toStrictEqual({ left: 146, top: 34, hidden: false });
});
