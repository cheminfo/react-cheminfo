// @vitest-environment jsdom
/**
 * What the header says about a panel, which is what the flat styling reads.
 *
 * The accordion draws every header identically whether its panel is open or
 * folded, so the chevron and the `data-panel-open` it carries are the only mark
 * of that state anywhere in the DOM — an app's stylesheet colours the header
 * from it. A test rather than a look, because the mark travels through two
 * component libraries to reach the element, and losing it there would leave the
 * headers legible-looking and all the same colour.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { SidePanelStack } from '../SidePanelStack.tsx';

const panels = [
  { id: 'spectra', title: 'Spectra', icon: 'chart' },
  { id: 'peaks', title: 'Peaks', icon: 'th' },
] as const;

let host: HTMLDivElement;
let root: Root;
const closed: string[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  closed.length = 0;
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function mount() {
  act(() => {
    root.render(
      <SidePanelStack
        panels={panels}
        openPanelIds={['spectra', 'peaks']}
        onClose={(id) => closed.push(id)}
      >
        {(panel) => <p>{`the ${panel.id} body`}</p>}
      </SidePanelStack>,
    );
  });
}

/**
 * Every chevron in the stack, in the order the panels are drawn.
 * @returns The chevron of each open panel.
 */
function chevrons(): HTMLElement[] {
  return [...host.querySelectorAll<HTMLElement>('[data-panel-open]')];
}

test('a header says whether its panel is open', () => {
  mount();

  expect(chevrons().map((button) => button.dataset.panelOpen)).toStrictEqual([
    'true',
    'true',
  ]);
});

test('the chevron folds its own panel away', () => {
  mount();
  act(() => chevrons()[0]?.click());

  expect(chevrons().map((button) => button.dataset.panelOpen)).toStrictEqual([
    'false',
    'true',
  ]);
});

test('folding a panel is not closing it', () => {
  mount();
  act(() => chevrons()[0]?.click());

  expect(closed).toStrictEqual([]);
});

test('the cross closes the panel it stands in', () => {
  mount();
  const cross = host.querySelector<HTMLElement>(
    '[aria-label="Close the peaks panel"]',
  );
  act(() => cross?.click());

  expect(closed).toStrictEqual(['peaks']);
});
