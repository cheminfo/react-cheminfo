// @vitest-environment jsdom
/**
 * The row under the strip, worked by hand: the anchor's colour and position,
 * its removal, the path between anchors and the two tone sliders — and the
 * Backspace that removes whichever anchor is pointed at.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  anchor,
  changes,
  colourBox,
  find,
  lastPositions,
  mountEditor,
  press,
  unmountEditor,
} from './colorEditorHarness.tsx';

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  mountEditor();
});

afterEach(() => {
  unmountEditor();
  vi.unstubAllGlobals();
});

function pointAt(index: number): void {
  act(() => {
    anchor(index).dispatchEvent(
      new MouseEvent('pointerover', { bubbles: true, relatedTarget: null }),
    );
  });
}

function leave(index: number): void {
  act(() => {
    anchor(index).dispatchEvent(
      new MouseEvent('pointerout', { bubbles: true, relatedTarget: null }),
    );
  });
}

// A controlled field only hears a value set past React's own setter.
function type(field: HTMLInputElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(field) as object;
  const setValue = Object.getOwnPropertyDescriptor(
    prototype,
    'value',
  )?.set?.bind(field);
  act(() => {
    setValue?.(value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

function swatchShadow(index: number): string {
  const swatch = anchor(index).lastElementChild as HTMLElement;
  return swatch.style.boxShadow;
}

test('pointing at an anchor rings it, and Backspace anywhere removes it', () => {
  pointAt(1);

  expect(swatchShadow(1)).toBe('0 0 0 2px var(--text-muted)');
  expect(swatchShadow(2)).toBe('0 0 0 1px var(--border-strong)');
  expect(press(document.body, 'Backspace')).toBe(true);
  expect(changes.at(-1)?.stops).toStrictEqual([
    { position: 0, color: '#0000ff' },
    { position: 1, color: '#ff0000' },
  ]);
});

test('Backspace typed into a field is the field’s, not the anchor’s', () => {
  pointAt(1);

  expect(press(colourBox(), 'Backspace')).toBe(false);
  expect(changes).toHaveLength(0);
});

test('an anchor left behind is no longer the one Backspace removes', () => {
  pointAt(1);
  leave(1);

  expect(swatchShadow(1)).toBe('0 0 0 1px var(--border-strong)');
  expect(press(document.body, 'Delete')).toBe(false);
  expect(changes).toHaveLength(0);
});

test('a key other than Backspace or Delete removes nothing', () => {
  pointAt(2);

  expect(press(document.body, 'x')).toBe(false);
  expect(changes).toHaveLength(0);
});

test('the colour box recolours the anchor shown', () => {
  type(colourBox(), '#123456');

  expect(changes.at(-1)?.stops[0]).toStrictEqual({
    position: 0,
    color: '#123456',
  });
});

test('the position box sets where the anchor shown stands', () => {
  act(() => {
    anchor(1).focus();
  });
  const position = find(
    'input[aria-label="Position of anchor 2"]',
  ) as HTMLInputElement;
  press(position, 'ArrowUp');

  expect(lastPositions()).toStrictEqual([0, 0.41, 1]);
});

test('the bin removes the anchor shown, down to the two a scale needs', () => {
  act(() => {
    anchor(1).focus();
  });
  const bin = find('button[aria-label="Remove anchor 2"]') as HTMLButtonElement;
  act(() => {
    bin.click();
  });

  expect(lastPositions()).toStrictEqual([0, 1]);
  expect(colourBox().getAttribute('aria-label')).toBe('Colour of anchor 1');
  expect(
    (find('button[aria-label="Remove anchor 1"]') as HTMLButtonElement)
      .disabled,
  ).toBe(true);
});

test('the path between anchors is changed without moving one', () => {
  type(find('select') as HTMLSelectElement, 'hsv-long');

  expect(changes.at(-1)).toStrictEqual({
    interpolation: 'hsv-long',
    stops: [
      { position: 0, color: '#0000ff' },
      { position: 0.4, color: '#00ff00' },
      { position: 1, color: '#ff0000' },
    ],
  });
});

test('the tone sliders change every anchor at once, each keeping its hue', () => {
  const [saturation, brightness] =
    document.querySelectorAll<HTMLElement>('.bp6-slider-handle');
  press(saturation as HTMLElement, 'ArrowLeft');
  act(() => {
    saturation?.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'ArrowLeft', bubbles: true }),
    );
  });

  expect(changes.at(-1)?.stops).toStrictEqual([
    { position: 0, color: '#0303ff' },
    { position: 0.4, color: '#03ff03' },
    { position: 1, color: '#ff0303' },
  ]);

  press(brightness as HTMLElement, 'ArrowLeft');

  expect(changes.at(-1)?.stops).toStrictEqual([
    { position: 0, color: '#0303fc' },
    { position: 0.4, color: '#03fc03' },
    { position: 1, color: '#fc0303' },
  ]);
});
