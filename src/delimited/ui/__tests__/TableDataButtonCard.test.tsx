// @vitest-environment jsdom
/**
 * The card the default button of `TableDataButton` opens under the pointer:
 * the family's help card, never a native tooltip.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  cardsAfterTheDelay,
  cross,
} from '../../../help/ui/__tests__/pointerCrossing.ts';
import { TableDataButton } from '../TableDataButton.tsx';

const ROWS: ReadonlyArray<readonly string[]> = [['H2O', '18.015']];

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.useFakeTimers();
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
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/**
 * The pointer moving onto the button, as a reader's does.
 * @returns What the card under the pointer says, or `null` for none.
 */
function hover(): string | null {
  const button = host.querySelector('button');
  if (button === null) throw new Error('no button');
  cross(button, { moved: true });
  const [card = null] = cardsAfterTheDelay();
  return card;
}

test('the button names its deed in the family card under the pointer', () => {
  act(() => {
    root.render(<TableDataButton rows={ROWS} />);
  });

  expect(document.body.querySelector('.help-tooltip')).toBeNull();
  expect(hover()).toBe('Copy or download data');
});

test('a site naming the affordance has its words in the card', () => {
  act(() => {
    root.render(<TableDataButton rows={ROWS} tooltip="Peak table" />);
  });

  expect(host.querySelector('button')?.getAttribute('aria-label')).toBe(
    'Peak table',
  );
  expect(hover()).toBe('Peak table');
});
