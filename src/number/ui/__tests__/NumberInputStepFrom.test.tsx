// @vitest-environment jsdom
/**
 * Where an empty box steps from: a box standing for several values that
 * differ steps from the one it is given, not from zero.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NumberInput } from '../NumberInput.tsx';

let host: HTMLDivElement;
let root: Root;
const committed = vi.fn<(value: number | undefined) => void>();

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  committed.mockClear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function render(props: { stepFrom?: number; max?: number }): HTMLInputElement {
  act(() =>
    root.render(
      <NumberInput
        allowEmpty
        value={undefined}
        stepFrom={props.stepFrom}
        min={1}
        max={props.max}
        step={0.5}
        placeholder="Mixed"
        ariaLabel="Height"
        onChange={committed}
      />,
    ),
  );
  const input = host.querySelector('input');
  if (input === null) throw new Error('the box was not rendered');
  return input;
}

function press(input: HTMLInputElement, key: string) {
  act(() => {
    input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  });
}

function click(button: Element | undefined) {
  act(() => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

test('an empty box steps from the number it is given', () => {
  const input = render({ stepFrom: 12 });

  press(input, 'ArrowUp');

  expect(committed).toHaveBeenLastCalledWith(12.5);
});

test('the stepper buttons of an empty box step from it too', () => {
  render({ stepFrom: 12 });
  const [, down] = host.querySelectorAll('button');

  click(down);

  expect(committed).toHaveBeenLastCalledWith(11.5);
});

test('an empty box given nothing steps from zero, onto its minimum', () => {
  const input = render({});

  press(input, 'ArrowUp');

  expect(committed).toHaveBeenLastCalledWith(1);
});

test('an empty box at its bound by the number given cannot step past it', () => {
  render({ stepFrom: 20, max: 20 });
  const [up, down] = host.querySelectorAll('button');

  expect(up?.hasAttribute('disabled')).toBe(true);
  expect(down?.hasAttribute('disabled')).toBe(false);
});
