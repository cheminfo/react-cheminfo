/**
 * The hands the settings editors are driven with in jsdom: a root to mount
 * them in, and the clicks, keystrokes and picks a reader makes.
 *
 * The editors are controlled, so each test mounts one under a parent that
 * owns the value, as a page does, and reads every value it handed up.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { vi } from 'vitest';

/** A mounted editor, and the means to drive it. */
export interface Harness {
  /** The element the editor is mounted in. */
  host: HTMLDivElement;
  /** Render into the root. */
  render: (element: ReactElement) => void;
  /** Unmount and clean up. */
  dispose: () => void;
}

/**
 * Mount a root in the document, ready for `render`.
 * @returns The harness.
 */
export function createHarness(): Harness {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const host = document.createElement('div');
  document.body.append(host);
  const root: Root = createRoot(host);
  return {
    host,
    render: (element) => {
      act(() => root.render(element));
    },
    dispose: () => {
      act(() => root.unmount());
      host.remove();
      vi.unstubAllGlobals();
    },
  };
}

/**
 * Click the button a screen reader calls `label`, or whose text it is.
 * @param within - Where to look.
 * @param label - Its `aria-label`, or its text.
 */
export function press(within: ParentNode, label: string): void {
  const button = [...within.querySelectorAll('button')].find(
    (candidate) =>
      candidate.getAttribute('aria-label') === label ||
      candidate.textContent === label,
  );
  if (button === undefined) throw new Error(`no button for ${label}`);
  act(() => {
    button.click();
  });
}

/**
 * The text box under a visible label.
 * @param within - Where to look.
 * @param label - The label's text, exactly.
 * @param nth - Which of several boxes with that label, from zero.
 * @returns The box.
 */
export function field(
  within: ParentNode,
  label: string,
  nth = 0,
): HTMLInputElement {
  const found = [...within.querySelectorAll('label')].filter(
    (candidate) => candidate.querySelector('span')?.textContent === label,
  )[nth];
  const input = found?.querySelector('input');
  if (input === null || input === undefined) {
    throw new Error(`no box labelled ${label}`);
  }
  return input;
}

/**
 * One keystroke: what the box holds once the reader has typed `text`.
 * @param input - The box.
 * @param text - Its whole content afterwards.
 */
export function type(input: HTMLInputElement, text: string): void {
  act(() => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.bind(input);
    setValue?.(text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

/**
 * Pick an option of a menu.
 * @param select - The menu.
 * @param value - The option's value.
 */
export function pick(select: HTMLSelectElement | null, value: string): void {
  if (select === null) throw new Error('no menu');
  act(() => {
    select.value = value;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

/**
 * Flip the switch or the box a label names.
 * @param within - Where to look.
 * @param label - The text beside it, exactly.
 */
export function toggle(within: ParentNode, label: string): void {
  const control = [...within.querySelectorAll('label')].find(
    (candidate) => candidate.textContent === label,
  );
  const input = control?.querySelector('input');
  if (input === null || input === undefined) {
    throw new Error(`no switch for ${label}`);
  }
  act(() => {
    input.click();
  });
}
