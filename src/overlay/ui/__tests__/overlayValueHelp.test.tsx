// @vitest-environment jsdom
/**
 * A setting written as its value says what it does on the family's help
 * card, where it is given a sentence, and keeps its plain name and value as
 * the tooltip where it is not.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  cardsAfterTheDelay,
  cross,
} from '../../../help/ui/__tests__/pointerCrossing.ts';
import { OverlayValueButton } from '../OverlayValueButton.tsx';
import { OverlayValueMenu } from '../OverlayValueMenu.tsx';

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
  vi.unstubAllGlobals();
});

/**
 * What the pointer is told on the button: its plain tooltip and its cards.
 * @param element - The setting.
 * @returns The `title`, and the text of every card open after the delay.
 */
function toldOn(element: ReactElement) {
  act(() => root.render(element));
  const button = host.querySelector('button');
  if (button === null) throw new Error('no button');
  cross(button, { moved: true });
  return { title: button.getAttribute('title'), cards: cardsAfterTheDelay() };
}

test('a value button given a sentence opens it on the help card, with no plain tooltip', () => {
  expect(
    toldOn(
      <OverlayValueButton
        label="Showing"
        value="2 · Smoothed"
        help={{ body: 'The step whose output the image shows.' }}
      />,
    ),
  ).toStrictEqual({
    title: null,
    cards: ['The step whose output the image shows.'],
  });
});

test('a value menu hands its sentence to its button', () => {
  expect(
    toldOn(
      <OverlayValueMenu
        label="Background"
        value="source"
        options={[{ value: 'source', label: 'Original' }]}
        onChange={() => undefined}
        help={{ body: 'The image drawn under the objects.' }}
      />,
    ),
  ).toStrictEqual({
    title: null,
    cards: ['The image drawn under the objects.'],
  });
});

test('without a sentence, the button is told its name and its value', () => {
  expect(
    toldOn(<OverlayValueButton label="Showing" value="2 · Smoothed" />),
  ).toStrictEqual({ title: 'Showing — 2 · Smoothed', cards: [] });
});
