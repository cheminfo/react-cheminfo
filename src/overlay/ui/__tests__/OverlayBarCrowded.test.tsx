// @vitest-environment jsdom
/**
 * A stretched bar folds its far end as soon as the row no longer holds every
 * control at its own width, measured off the controls, and unfolds it once
 * the row has room again: its glyphs never cover its start.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { OverlayBar } from '../OverlayBar.tsx';
import { OverlayLayer } from '../OverlayLayer.tsx';
import { naturalRowWidth } from '../overlayBarWidths.ts';

let host: HTMLDivElement;
let root: Root;

/** jsdom lays nothing out: a control is as wide as its `data-width` says. */
class DataWidth extends HTMLElement {
  override get offsetWidth(): number {
    return Number(this.dataset.width ?? 0);
  }
}

const LAID_OUT = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  'offsetWidth',
);
const DATA_WIDTH = Object.getOwnPropertyDescriptor(
  DataWidth.prototype,
  'offsetWidth',
);

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  if (DATA_WIDTH !== undefined) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', DATA_WIDTH);
  }
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  if (LAID_OUT !== undefined) {
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', LAID_OUT);
  }
  vi.unstubAllGlobals();
});

/**
 * The bar drawn over a figure of the given width, the start 300 px wide, the
 * far end 100 px and the glyphs 60 px.
 * @param width - The figure's width.
 * @param collapsed - What the caller answers for the bar's folding.
 * @default collapsed undefined — the bar folds on its own
 * @returns Whether the far end is in the row.
 */
function endShownAt(width: number, collapsed?: boolean): boolean {
  act(() =>
    root.render(
      <OverlayLayer density="compact" width={width}>
        <OverlayBar
          placement="stretch"
          collapsed={collapsed}
          end={<span data-width="100">Workflow</span>}
          tools={<span data-width="60">Save</span>}
        >
          <span data-width="300">Showing</span>
        </OverlayBar>
      </OverlayLayer>,
    ),
  );
  return host.textContent?.includes('Workflow') ?? false;
}

test('the far end folds once the row cannot hold every control, and comes back once it can', () => {
  // 300 + 100 + 60, two gaps of 4 px and a padding of 6 px on either side;
  // folded, the bar draws its button, which the row it unfolds into drops.
  expect([
    endShownAt(480),
    endShownAt(479),
    endShownAt(480),
    endShownAt(600),
  ]).toStrictEqual([true, false, true, true]);
});

test('a bar its caller keeps unfolded holds its far end on a crowded row', () => {
  expect([endShownAt(479, false), endShownAt(300, false)]).toStrictEqual([
    true,
    true,
  ]);
});

test('the natural width of a row adds its controls, their gaps and its padding', () => {
  const side = document.createElement('div');
  side.innerHTML = '<span data-width="30"></span><span data-width="50"></span>';
  const other = document.createElement('div');
  other.innerHTML = '<span data-width="20"></span>';
  const empty = document.createElement('div');

  expect([
    naturalRowWidth([side, other], 4, 6),
    naturalRowWidth([side, null, empty], 4, 6),
    naturalRowWidth([empty], 4, 0),
  ]).toStrictEqual([30 + 4 + 50 + 4 + 20 + 12, 30 + 4 + 50 + 12, 0]);
});
