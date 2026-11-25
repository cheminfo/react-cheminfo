// @vitest-environment jsdom
/**
 * The settings gear's help is the family's help card, opening as every help
 * card does: the cross that takes the gear's place under a pointer standing
 * still stays silent until the pointer moves.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  cardsAfterTheDelay,
  cross,
} from '../../../help/ui/__tests__/pointerCrossing.ts';
import { PanelSettingsButton } from '../PanelSettingsButton.tsx';

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

function show(isOpen: boolean): void {
  act(() =>
    root.render(
      <PanelSettingsButton
        panel="Objects"
        isOpen={isOpen}
        onOpen={() => undefined}
        onConfirm={() => undefined}
        onCancel={() => undefined}
      />,
    ),
  );
}

function crossOnto(name: string, moved: boolean): string[] {
  const target = Array.from(host.querySelectorAll('[aria-label]')).find(
    (one) => one.getAttribute('aria-label') === name,
  );
  if (target === undefined) throw new Error(`no button ${name}`);
  cross(target, { moved });
  return cardsAfterTheDelay();
}

test('the gear’s help is a help card, and the cross that replaces it under a resting pointer says nothing', () => {
  show(false);
  const gear = crossOnto('Objects settings', true);
  act(() => {
    host
      .querySelector('[aria-label="Objects settings"]')
      ?.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
  });
  show(true);
  const cancel = crossOnto('Cancel the changes to the Objects settings', false);

  expect({ gear, cancel }).toStrictEqual({ gear: ['Settings'], cancel: [] });
});
