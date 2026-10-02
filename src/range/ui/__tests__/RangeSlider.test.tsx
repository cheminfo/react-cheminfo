// @vitest-environment jsdom
/**
 * What a reader can do with a range slider without a pointer: read its two
 * values, type either, clear it, and step a handle from the keyboard. Dragging
 * needs a laid-out track, which jsdom has not got; the e2e suite drags.
 */

import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { RangeBounds, RangeDomain } from '../../core/rangeBounds.ts';
import { OPEN_RANGE } from '../../core/rangeBounds.ts';
import { RangeSlider } from '../RangeSlider.tsx';

let host: HTMLDivElement;
let root: Root;
const settled = vi.fn<(range: RangeBounds) => void>();
const previewed = vi.fn<(range: RangeBounds) => void>();

const YEARS: RangeDomain = [1970, 2026];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  settled.mockClear();
  previewed.mockClear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

/**
 * A slider wired the way a site wires it: the parent owns the range.
 * @param props - What the slider starts from.
 * @param props.initial - The range in force when the slider is drawn.
 * @param props.domain - The track; the years 1970 to 2026 when left out.
 * @param props.histogram - Counts drawn over the track, when there are any.
 * @returns The slider.
 */
function Harness(props: {
  initial: RangeBounds;
  domain?: RangeDomain;
  histogram?: number[];
}) {
  const [range, setRange] = useState(props.initial);
  return (
    <RangeSlider
      label="Year"
      domain={props.domain ?? YEARS}
      value={range}
      histogram={props.histogram}
      integer
      onPreview={previewed}
      onChange={(next) => {
        settled(next);
        setRange(next);
      }}
    />
  );
}

function render(props: Parameters<typeof Harness>[0]) {
  act(() => root.render(<Harness {...props} />));
}

function named(name: string): HTMLElement {
  const element = host.querySelector<HTMLElement>(
    `[aria-label="${CSS.escape(name)}"]`,
  );
  if (element === null) throw new Error(`nothing is named "${name}"`);
  return element;
}

function click(element: HTMLElement) {
  act(() => element.click());
}

function key(target: HTMLElement, type: 'keydown' | 'keyup', name: string) {
  act(() => {
    target.dispatchEvent(new KeyboardEvent(type, { key: name, bubbles: true }));
  });
}

/**
 * Open one value as a box and type into it.
 * @param name - The value's accessible name.
 * @param text - What the reader types.
 * @returns The box.
 */
function typeInto(name: string, text: string): HTMLInputElement {
  click(named(name));
  const input = document.activeElement;
  if (!(input instanceof HTMLInputElement)) throw new Error('no box opened');
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return input;
}

test('an open range writes the ends of the track, faint, and offers no clear', () => {
  render({ initial: OPEN_RANGE });

  const low = named('Year: no lower bound');
  const high = named('Year: no upper bound');

  expect(low.textContent).toBe('1970');
  expect(high.textContent).toBe('2026');
  expect(low.classList.contains('range-slider__value--open')).toBe(true);
  expect(host.querySelector('[aria-label="Clear Year"]')).toBeNull();
});

test('a typed value is kept on Enter, without grouping', () => {
  render({ initial: OPEN_RANGE });

  const input = typeInto('Year: no lower bound', '1990');

  expect(input.getAttribute('aria-label')).toBe('Year, lowest');

  key(input, 'keydown', 'Enter');

  expect(settled).toHaveBeenCalledOnce();
  expect(settled).toHaveBeenLastCalledWith({ min: 1990, max: null });
  expect(named('Year, lowest: 1990').textContent).toBe('1990');
});

test('Escape drops what was typed', () => {
  render({ initial: { min: 1990, max: null } });

  const input = typeInto('Year, lowest: 1990', '2000');
  key(input, 'keydown', 'Escape');

  expect(settled).not.toHaveBeenCalled();
  expect(named('Year, lowest: 1990').textContent).toBe('1990');
});

test('an emptied box opens its side again', () => {
  render({ initial: { min: 1990, max: 2010 } });

  const input = typeInto('Year, highest: 2010', '');
  act(() => input.blur());

  expect(settled).toHaveBeenLastCalledWith({ min: 1990, max: null });
});

test('a typed lowest value is held below the highest', () => {
  render({ initial: { min: null, max: 2000 } });

  const input = typeInto('Year: no lower bound', '2010');
  key(input, 'keydown', 'Enter');

  expect(settled).toHaveBeenLastCalledWith({ min: 2000, max: 2000 });
});

test('a value past the track is typed and kept', () => {
  render({ initial: OPEN_RANGE });

  const input = typeInto('Year: no upper bound', '2100');
  key(input, 'keydown', 'Enter');

  expect(settled).toHaveBeenLastCalledWith({ min: null, max: 2100 });
  expect(named('Year, highest: 2100').textContent).toBe('2100');
});

test('clearing opens both sides', () => {
  render({ initial: { min: 1990, max: 2010 } });

  click(named('Clear Year'));

  expect(settled).toHaveBeenLastCalledWith(OPEN_RANGE);
  expect(host.querySelector('[aria-label="Clear Year"]')).toBeNull();
});

test('an arrow key previews each step and settles when it is let go', () => {
  render({ initial: OPEN_RANGE });
  const handle = named('Year, lowest');

  expect(handle.getAttribute('role')).toBe('slider');

  key(handle, 'keydown', 'ArrowRight');

  expect(previewed).toHaveBeenLastCalledWith({ min: 1971, max: null });
  expect(settled).not.toHaveBeenCalled();
  expect(named('Year, lowest: 1971').textContent).toBe('1971');

  key(handle, 'keyup', 'ArrowRight');

  expect(settled).toHaveBeenCalledOnce();
  expect(settled).toHaveBeenLastCalledWith({ min: 1971, max: null });
});

test('stepping a handle back to the end of the track opens its side', () => {
  render({ initial: { min: null, max: 2025 } });
  const handle = named('Year, highest');

  key(handle, 'keydown', 'ArrowRight');
  key(handle, 'keyup', 'ArrowRight');

  expect(settled).toHaveBeenLastCalledWith(OPEN_RANGE);
});

test('a track that cannot be drawn still takes a typed value', () => {
  render({ initial: OPEN_RANGE, domain: [0, 0] });

  expect(host.querySelector('[role="slider"]')).toBeNull();

  const input = typeInto('Year: no upper bound', '12');
  key(input, 'keydown', 'Enter');

  expect(settled).toHaveBeenLastCalledWith({ min: null, max: 12 });
});

test('the histogram keeps, in the brand colour, the part between the handles', () => {
  render({ initial: { min: 1984, max: 2012 }, histogram: [1, 2, 0, 4] });

  const clip = host.querySelector('clipPath rect');

  expect(clip?.getAttribute('x')).toBe('0.25');
  expect(clip?.getAttribute('width')).toBe('0.5');

  const outlines = host.querySelectorAll('path.range-slider__bars');

  expect(outlines).toHaveLength(2);
  expect(outlines[0]?.getAttribute('d')).toBe(
    'M0 1V0.75H0.25V0.5H0.5V1H0.75V0H1V1Z',
  );
  expect(outlines[1]?.getAttribute('clip-path')).toMatch(
    /^url\(#range-histogram-\w+\)$/,
  );
});
