// @vitest-environment jsdom
/**
 * What a range slider tells a screen reader and leaves out for the pointer:
 * its clear and its two values are named, none carries a native title, and the
 * clear is offered only where a range can be cleared.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { RangeBounds, RangeDomain } from '../../core/rangeBounds.ts';
import type { RangeSliderProps } from '../RangeSlider.tsx';
import { RangeSlider } from '../RangeSlider.tsx';

let host: HTMLDivElement;
let root: Root;
const settled = vi.fn<(range: RangeBounds) => void>();

const YEARS: RangeDomain = [1970, 2026];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  settled.mockClear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function render(props: Partial<RangeSliderProps> = {}) {
  act(() =>
    root.render(
      <RangeSlider
        label="Year"
        domain={YEARS}
        value={{ min: 1990, max: 2010 }}
        onChange={settled}
        {...props}
      />,
    ),
  );
}

function named(name: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(
    `[aria-label="${CSS.escape(name)}"]`,
  );
  if (element === null) throw new Error(`nothing is named "${name}"`);
  return element;
}

test('the clear and the values are named for a screen reader, with no native title', () => {
  render({ integer: true });

  expect(named('Clear Year').tagName).toBe('BUTTON');
  expect(named('Year, lowest: 1990').textContent).toBe('1990');
  expect(host.querySelectorAll('[title]')).toHaveLength(0);
});

test('a range that is not clearable offers no clear', () => {
  render({ clearable: false });

  expect(host.querySelector('[aria-label="Clear Year"]')).toBeNull();
  expect(named('Year, highest: 2010').textContent).toBe('2010');
});
