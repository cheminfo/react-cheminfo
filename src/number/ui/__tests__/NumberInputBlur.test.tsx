// @vitest-environment jsdom
/**
 * A box a form drives: told when the box is left, once its number settled,
 * and drawn as refused when the form refuses its number.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NumberInput } from '../NumberInput.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

test('leaving the box settles its number, then tells the form; a number the form refuses is drawn as refused', () => {
  const told: string[] = [];
  act(() => {
    root.render(
      <NumberInput
        value={16}
        max={10}
        intent="danger"
        ariaLabel="Kernel size"
        onChange={(next) => told.push(`change ${next}`)}
        onBlur={() => told.push('left')}
      />,
    );
  });
  const input = host.querySelector('input');
  const refused = input?.closest('.bp6-intent-danger') !== null;
  act(() => {
    input?.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });

  expect([told, refused]).toStrictEqual([['change 10', 'left'], true]);
});
