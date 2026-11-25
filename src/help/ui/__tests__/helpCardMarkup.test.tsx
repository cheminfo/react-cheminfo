// @vitest-environment jsdom
/**
 * A rail item's help card and a `HelpTooltip` say the same help with the
 * same markup: one rendering of a piece of help, wherever it opens.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PanelRail } from '../../../panel/ui/PanelRail.tsx';
import { HelpTooltip } from '../HelpTooltip.tsx';

import { cardsAfterTheDelay, cross } from './pointerCrossing.ts';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.useRealTimers();
});

/**
 * The markup of the help card open over a target.
 * @param target - Where the pointer lands.
 * @returns The card's help body.
 */
function openedBody(target: Element): string {
  cross(target, { moved: true });
  cardsAfterTheDelay();
  return document.querySelector('.help-tooltip .help-body')?.outerHTML ?? '';
}

test("a rail item's card is a help tooltip's, markup for markup", () => {
  act(() =>
    root.render(
      <PanelRail
        panels={[{ id: 'steps', icon: 'list', title: 'Steps' }]}
        openIds={[]}
        onToggle={() => undefined}
      />,
    ),
  );
  const rail = openedBody(host.querySelector('[aria-label="Steps"]') ?? host);
  act(() =>
    root.render(
      <HelpTooltip content={{ title: 'Steps' }}>
        <span id="tool">Steps</span>
      </HelpTooltip>,
    ),
  );
  const tooltip = openedBody(host.querySelector('#tool') ?? host);

  expect(rail).toBe(
    '<div class="help-body" style="display: flex; flex-direction: column; gap: 6px; max-width: 280px;"><div style="display: flex; align-items: baseline; justify-content: space-between; gap: 8px;"><div style="font-weight: 600;">Steps</div></div></div>',
  );
  expect(tooltip).toBe(rail);
});
