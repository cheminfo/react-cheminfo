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

import type { PanelDescriptor } from '../SidePanelStack.tsx';
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

function mount(openPanelIds: readonly string[] = ['spectra', 'peaks']) {
  act(() => {
    root.render(
      <SidePanelStack
        panels={panels}
        openPanelIds={openPanelIds}
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

test('the chevron is the first button of its header', () => {
  mount();
  const [header] = host.querySelectorAll('[role="button"]');

  expect(header?.querySelector('button')?.dataset.panelOpen).toBe('true');
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

/**
 * The focus button of a panel.
 * @param title - The panel, as its header names it.
 * @returns The button, or null where the header offers none.
 */
function focusButton(title: string): HTMLElement | null {
  return host.querySelector<HTMLElement>(
    `[aria-label="Focus on the ${CSS.escape(title)} panel"]`,
  );
}

test('a panel alone in the stack offers no focus', () => {
  mount(['spectra']);

  expect(focusButton('spectra')).toBeNull();
});

test('focus folds every other panel away', () => {
  mount();
  act(() => focusButton('peaks')?.click());

  expect(chevrons().map((button) => button.dataset.panelOpen)).toStrictEqual([
    'false',
    'true',
  ]);
  expect(focusButton('peaks')?.getAttribute('aria-pressed')).toBe('true');
  expect(focusButton('spectra')?.getAttribute('aria-pressed')).toBe('false');
});

test('focus pressed again unfolds the other panels', () => {
  mount();
  act(() => focusButton('peaks')?.click());
  act(() => focusButton('peaks')?.click());

  expect(chevrons().map((button) => button.dataset.panelOpen)).toStrictEqual([
    'true',
    'true',
  ]);
});

test('focusing a folded panel unfolds it', () => {
  mount();
  act(() => chevrons()[1]?.click());
  act(() => focusButton('peaks')?.click());

  expect(chevrons().map((button) => button.dataset.panelOpen)).toStrictEqual([
    'false',
    'true',
  ]);
});

test('a shift-click on a header puts its panel in focus', () => {
  mount();
  const header = host.querySelector<HTMLElement>('div[role="button"]');
  act(() => {
    header?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, shiftKey: true }),
    );
  });

  expect(chevrons().map((button) => button.dataset.panelOpen)).toStrictEqual([
    'true',
    'false',
  ]);
  expect(focusButton('spectra')?.getAttribute('aria-pressed')).toBe('true');
});

test('a panel closed while folded opens unfolded', () => {
  mount();
  act(() => chevrons()[1]?.click());
  mount(['spectra']);
  mount(['spectra', 'peaks']);

  expect(chevrons().map((button) => button.dataset.panelOpen)).toStrictEqual([
    'true',
    'true',
  ]);
});

/**
 * Draw the stack with folds the editor keeps, reporting each change without
 * drawing it, as an editor that has not rendered again yet.
 * @param foldedPanelIds - The panels the editor keeps folded.
 * @param stack - The panels on offer, all open.
 * @returns Every change reported, in order.
 */
function mountKept(
  foldedPanelIds: readonly string[],
  stack: readonly PanelDescriptor[] = panels,
): string[][] {
  const reported: string[][] = [];
  act(() => {
    root.render(
      <SidePanelStack
        panels={stack}
        openPanelIds={stack.map((panel) => panel.id)}
        onClose={(id) => closed.push(id)}
        foldedPanelIds={foldedPanelIds}
        onFoldedPanelIdsChange={(ids) => reported.push(ids)}
      >
        {(panel) => <p>{`the ${panel.id} body`}</p>}
      </SidePanelStack>,
    );
  });
  return reported;
}

test('the folds an editor keeps are the ones drawn', () => {
  mountKept(['peaks']);

  expect(chevrons().map((button) => button.dataset.panelOpen)).toStrictEqual([
    'true',
    'false',
  ]);
});

test('a chevron reports the folds to the editor that keeps them', () => {
  const reported = mountKept(['peaks']);
  act(() => chevrons()[0]?.click());

  expect(reported).toStrictEqual([['spectra', 'peaks']]);
});

test('a kept fold of a closed panel is neither drawn nor reported', () => {
  const reported = mountKept(['closed', 'peaks']);
  act(() => chevrons()[1]?.click());

  expect(reported).toStrictEqual([[]]);
});

test('a shift-click reports every other panel folded, one after another', () => {
  const reported = mountKept(
    [],
    [
      { id: 'spectra', title: 'Spectra', icon: 'chart' },
      { id: 'peaks', title: 'Peaks', icon: 'chart' },
      { id: 'metadata', title: 'Metadata', icon: 'chart' },
    ],
  );
  const header = host.querySelector<HTMLElement>('div[role="button"]');
  act(() => {
    header?.dispatchEvent(
      new MouseEvent('click', { bubbles: true, shiftKey: true }),
    );
  });

  expect(reported).toStrictEqual([['peaks'], ['peaks', 'metadata']]);
});

test('focus reports every other panel folded', () => {
  const reported = mountKept([]);
  act(() => focusButton('spectra')?.click());

  expect(reported).toStrictEqual([['peaks']]);
});
