// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, expect, test, vi } from 'vitest';

import { useMeasuredPlace } from '../useMeasuredPlacement.ts';

let root: Root | null = null;

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  vi.unstubAllGlobals();
});

/**
 * A card placed by a rule of its own: against the right edge of a 300 px
 * box, as far down as it is tall.
 * @returns The card.
 */
function RightCard(): ReactElement {
  const { attach, style } = useMeasuredPlace((size) => ({
    left: 300 - size.width,
    top: size.height,
  }));
  return (
    <div
      ref={attach}
      data-testid="card"
      style={{ position: 'absolute', ...style }}
    >
      Smooth
    </div>
  );
}

test('a card placed by its own rule is hidden until measured, then put where the rule says for its size', () => {
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
    created.render(<RightCard />);
  });
  const style = () =>
    host.querySelector('[data-testid="card"]')?.getAttribute('style') ?? '';
  const before = style();
  act(() => {
    for (const observer of observers) {
      observer([
        {
          contentRect: { width: 120, height: 40 },
          borderBoxSize: [{ inlineSize: 120, blockSize: 40 }],
        },
      ]);
    }
  });

  expect([before, style()]).toStrictEqual([
    'position: absolute; left: 0px; top: 0px; visibility: hidden;',
    'position: absolute; left: 180px; top: 40px;',
  ]);
});
