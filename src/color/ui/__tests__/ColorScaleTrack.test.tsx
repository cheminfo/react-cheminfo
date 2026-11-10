// @vitest-environment jsdom
/**
 * The strip of a colour scale, worked by hand: a press adds an anchor, a drag
 * moves one, and the keys nudge it.
 *
 * Driven through the editor rather than on its own, because the strip only
 * reports — which anchor is selected, which is pointed at — and the editor is
 * what turns a report into the anchor shown below and the scale handed up.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ColorStop } from '../../core/interpolate.ts';

import {
  anchor,
  changes,
  colourBox,
  lastPositions,
  mountEditor,
  pointer,
  press,
  track,
  unmountEditor,
} from './colorEditorHarness.tsx';

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  unmountEditor();
  vi.unstubAllGlobals();
});

test('a press on the strip adds an anchor there, in the colour already there', () => {
  mountEditor();
  pointer(track(), 'pointerdown', 50);

  expect(changes).toStrictEqual([
    {
      interpolation: 'rgb',
      stops: [
        { position: 0, color: '#0000ff' },
        { position: 0.25, color: '#009f60' },
        { position: 0.4, color: '#00ff00' },
        { position: 1, color: '#ff0000' },
      ],
    },
  ]);
  expect(colourBox().getAttribute('aria-label')).toBe('Colour of anchor 2');
  expect(colourBox().value).toBe('#009f60');
});

test('the anchor just added follows the drag past its neighbour, and stops on release', () => {
  mountEditor();
  pointer(track(), 'pointerdown', 50);
  pointer(track(), 'pointermove', 150);

  expect(lastPositions()).toStrictEqual([0, 0.4, 0.75, 1]);
  expect(changes.at(-1)?.stops[2]?.color).toBe('#009f60');
  expect(colourBox().getAttribute('aria-label')).toBe('Colour of anchor 3');

  pointer(track(), 'pointerup', 150);
  pointer(track(), 'pointermove', 10);

  expect(changes).toHaveLength(2);
});

test('a press on an anchor selects and drags it, adding nothing', () => {
  mountEditor();
  pointer(anchor(2).firstElementChild as Element, 'pointerdown', 200);

  expect(changes).toHaveLength(0);
  expect(colourBox().value).toBe('#ff0000');

  pointer(track(), 'pointermove', 20);

  expect(changes.at(-1)?.stops).toStrictEqual([
    { position: 0, color: '#0000ff' },
    { position: 0.1, color: '#ff0000' },
    { position: 0.4, color: '#00ff00' },
  ]);
  expect(colourBox().getAttribute('aria-label')).toBe('Colour of anchor 2');
});

test('a drag that is lost to the browser ends like a release', () => {
  mountEditor();
  pointer(anchor(1), 'pointerdown', 80);
  pointer(track(), 'pointercancel', 80);
  pointer(track(), 'pointermove', 120);

  expect(changes).toHaveLength(0);
});

test('only the main button adds an anchor', () => {
  mountEditor();
  pointer(track(), 'pointerdown', 50, 2);
  pointer(track(), 'pointermove', 90);

  expect(changes).toHaveLength(0);
});

test('a scale holding as many anchors as a link carries takes no more', () => {
  const stops: ColorStop[] = [];
  for (let index = 0; index < 12; index++) {
    stops.push({ position: index / 11, color: '#808080' });
  }
  mountEditor({ interpolation: 'rgb', stops });
  pointer(track(), 'pointerdown', 50);
  pointer(track(), 'pointermove', 90);

  expect(changes).toHaveLength(0);
});

test('the arrows nudge an anchor, Shift by ten times as much', () => {
  mountEditor();

  expect(press(anchor(1), 'ArrowRight')).toBe(true);
  expect(lastPositions()).toStrictEqual([0, 0.41, 1]);

  press(anchor(1), 'ArrowLeft', { shiftKey: true });

  expect(lastPositions()).toStrictEqual([0, 0.31, 1]);

  press(anchor(1), 'ArrowDown');
  press(anchor(1), 'ArrowUp', { shiftKey: true });

  expect(lastPositions()).toStrictEqual([0, 0.4, 1]);
});

test('from the keyboard an anchor stops at its neighbour', () => {
  mountEditor();
  for (let count = 0; count < 6; count++) {
    press(anchor(0), 'ArrowRight', { shiftKey: true });
  }

  expect(lastPositions()).toStrictEqual([0.4, 0.4, 1]);
  expect(changes).toHaveLength(6);
});

test('a key that is not an arrow leaves the anchor where it is', () => {
  mountEditor();

  expect(press(anchor(1), 'a')).toBe(false);
  expect(changes).toHaveLength(0);
});

test('Backspace on an anchor removes it and selects the one before', () => {
  mountEditor();

  expect(press(anchor(2), 'Backspace')).toBe(true);
  expect(changes).toStrictEqual([
    {
      interpolation: 'rgb',
      stops: [
        { position: 0, color: '#0000ff' },
        { position: 0.4, color: '#00ff00' },
      ],
    },
  ]);
  expect(colourBox().value).toBe('#00ff00');

  press(anchor(1), 'Delete');

  expect(changes).toHaveLength(1);
});

test('focusing an anchor shows it below the strip', () => {
  mountEditor();
  act(() => {
    anchor(2).focus();
  });

  expect(colourBox().getAttribute('aria-label')).toBe('Colour of anchor 3');
  expect(colourBox().value).toBe('#ff0000');
});

test('a double click on an anchor opens the colour picker', () => {
  const picker = vi.fn();
  const prototype = HTMLInputElement.prototype as { showPicker?: () => void };
  const native = prototype.showPicker;
  prototype.showPicker = picker;
  try {
    mountEditor();
    act(() => {
      anchor(1).dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    });

    expect(picker).toHaveBeenCalledOnce();
  } finally {
    prototype.showPicker = native;
  }
});
