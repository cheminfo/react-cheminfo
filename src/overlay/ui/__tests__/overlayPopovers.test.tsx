// @vitest-environment jsdom
/**
 * The bar's question mark and a toggle the bar draws as a bare button: the
 * question mark says its explanation is open while it is, and neither hands
 * Blueprint a popover it would warn about.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { OverlayInfo } from '../OverlayInfo.tsx';
import { OverlayToggle } from '../OverlayToggle.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('the question mark opens its explanation and says it is open, with no warning', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  act(() => {
    root.render(
      <OverlayInfo label="What does the image show?">
        The output of the step selected.
      </OverlayInfo>,
    );
  });
  const glyph = host.querySelector<HTMLButtonElement>(
    'button[aria-label="What does the image show?"]',
  );
  const closed = glyph?.getAttribute('aria-expanded');

  act(() => {
    glyph?.click();
  });

  expect([
    closed,
    glyph?.getAttribute('aria-expanded'),
    document.body.textContent?.includes('The output of the step selected.'),
  ]).toStrictEqual(['false', 'true', true]);
  expect(warned(warn, 'onInteraction is ignored when uncontrolled')).toBe(0);
});

test('a toggle drawn as a button keeps its help on the button, and no tooltip waits on a name it does not write', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  act(() => {
    root.render(
      <OverlayToggle
        appearance="button"
        icon="fork"
        label="Workflow"
        help={{ body: 'Show the steps as a graph.' }}
        checked={false}
        onChange={() => undefined}
      />,
    );
  });

  expect([
    host.querySelectorAll('.bp6-popover-target').length,
    host
      .querySelector('.bp6-popover-target button')
      ?.getAttribute('aria-label'),
  ]).toStrictEqual([1, 'Workflow']);
  expect(warned(warn, 'requires renderTarget prop or a child element')).toBe(0);
});

/**
 * How many warnings carried a sentence.
 * @param warn - The spy on `console.warn`.
 * @param sentence - What the warning says.
 * @returns The count.
 */
function warned(warn: MockInstance, sentence: string): number {
  let count = 0;
  for (const call of warn.mock.calls) {
    if (String(call[0]).includes(sentence)) count++;
  }
  return count;
}
