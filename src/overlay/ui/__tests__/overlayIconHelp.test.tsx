// @vitest-environment jsdom
/**
 * A glyph of the figure bar is named by the family's help card, as every
 * control of the chrome is, never by the browser's own tooltip.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  cardsAfterTheDelay,
  cross,
} from '../../../help/ui/__tests__/pointerCrossing.ts';
import { OverlayIconButton } from '../OverlayIconButton.tsx';
import { OverlayInfo } from '../OverlayInfo.tsx';
import { OverlayToggle } from '../OverlayToggle.tsx';

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

function cardOf(name: string): string[] {
  const button = Array.from(host.querySelectorAll('button')).find(
    (one) => one.getAttribute('aria-label') === name,
  );
  if (button === undefined) throw new Error(`no button ${name}`);
  cross(button, { moved: true });
  return cardsAfterTheDelay();
}

test('the question mark and a setting’s glyph open the help card naming them, and carry no native title', () => {
  act(() =>
    root.render(
      <>
        <OverlayInfo label="What does the image show?">Grains.</OverlayInfo>
        <OverlayIconButton icon="cog" label="Colour by" value="species" />
      </>,
    ),
  );
  const info = cardOf('What does the image show?');
  act(() => {
    document.body.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true }),
    );
  });
  const cog = cardOf('Colour by — species');

  expect({
    info,
    cog,
    titles: host.querySelectorAll('[title]').length,
  }).toStrictEqual({
    info: ['What does the image show?'],
    cog: ['Colour by — species'],
    titles: 0,
  });
});

test('a glyph that opens a card of its own is named to the screen reader only', () => {
  act(() =>
    root.render(<OverlayIconButton icon="cog" label="Colour by" untitled />),
  );

  expect(cardOf('Colour by')).toStrictEqual([]);
});

test('a toggle drawn as its glyph alone is named by the help card, and one with help of its own opens that help', () => {
  act(() =>
    root.render(
      <>
        <OverlayToggle
          label="Workflow"
          icon="fork"
          hideLabel
          checked={false}
          onChange={() => null}
        />
        <OverlayToggle
          label="Scale bar"
          icon="numerical"
          hideLabel
          help={{ title: 'Scale bar', body: 'Draws the length of 10 µm.' }}
          checked
          onChange={() => null}
        />
      </>,
    ),
  );
  const named = cardOf('Workflow');
  act(() => {
    document.body.dispatchEvent(
      new MouseEvent('pointerdown', { bubbles: true }),
    );
  });
  const helped = cardOf('Scale bar');

  expect({
    named,
    helped,
    titles: host.querySelectorAll('[title]').length,
  }).toStrictEqual({
    named: ['Workflow'],
    helped: ['Scale barDraws the length of 10 µm.'],
    titles: 0,
  });
});
