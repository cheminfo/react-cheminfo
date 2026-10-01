// @vitest-environment jsdom
/**
 * What a reader can type into a number box.
 *
 * The keystrokes are the test, not the rendered markup: every way of getting
 * this wrong — parsing the text on each keystroke, rendering the box from the
 * parsed number, clamping under the caret — looks right in a static render and
 * only shows up as a decimal point that will not stay typed.
 */

import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NumberInput } from '../NumberInput.tsx';

let host: HTMLDivElement;
let root: Root;
const committed = vi.fn<(value: number) => void>();

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

/**
 * A box wired the way a site wires it: the parent owns the number.
 * @param props
 * @param props.initial
 * @param props.min
 * @param props.max
 * @param props.step
 * @param props.integer
 */
function Harness(props: {
  initial: number;
  min?: number;
  max?: number;
  step?: number;
  integer?: boolean;
}) {
  const [value, setValue] = useState(props.initial);
  return (
    <NumberInput
      value={value}
      min={props.min}
      max={props.max}
      step={props.step}
      integer={props.integer}
      ariaLabel="Concentration"
      onChange={(next) => {
        committed(next);
        setValue(next);
      }}
    />
  );
}

function render(props: Parameters<typeof Harness>[0]): HTMLInputElement {
  act(() => root.render(<Harness {...props} />));
  const input = host.querySelector('input');
  if (input === null) throw new Error('the box was not rendered');
  return input;
}

/**
 * Dispatch an event inside `act`, so React has rendered before the assertion.
 * @param target
 * @param event
 */
function fire(target: EventTarget | null | undefined, event: Event) {
  act(() => {
    target?.dispatchEvent(event);
  });
}

/**
 * One keystroke: what the box holds once the reader has typed `text`.
 * @param input
 * @param text
 */
function type(input: HTMLInputElement, text: string) {
  act(() => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.bind(input);
    setValue?.(text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('a decimal can be typed one keystroke at a time', () => {
  const input = render({ initial: 0.1, min: 0, step: 0.01 });

  type(input, '0');

  expect(input.value).toBe('0');

  type(input, '0.');

  expect(input.value).toBe('0.');

  type(input, '0.2');

  expect(input.value).toBe('0.2');
  expect(committed).toHaveBeenLastCalledWith(0.2);
});

test('the box can be emptied and typed into again', () => {
  const input = render({ initial: 25, min: 0 });

  type(input, '');

  expect(input.value).toBe('');
  expect(committed).not.toHaveBeenCalled();

  type(input, '5');

  expect(input.value).toBe('5');
  expect(committed).toHaveBeenLastCalledWith(5);
});

test('an emptied required box shows its number again when it is left', () => {
  const input = render({ initial: 25 });

  type(input, '');
  fire(input, new FocusEvent('focusout', { bubbles: true }));

  expect(input.value).toBe('25');
  expect(committed).not.toHaveBeenCalled();
});

test('a minus sign stays typed long enough to reach the digits', () => {
  const input = render({ initial: 1, min: -5, max: 5 });

  type(input, '-');

  expect(input.value).toBe('-');

  type(input, '-2');

  expect(input.value).toBe('-2');
  expect(committed).toHaveBeenLastCalledWith(-2);
});

test('the bounds are applied when the box is left, not under the caret', () => {
  const input = render({ initial: 50, min: 10, max: 2000 });

  type(input, '1');

  expect(input.value).toBe('1');
  expect(committed).toHaveBeenLastCalledWith(1);

  type(input, '15');
  fire(input, new FocusEvent('focusout', { bubbles: true }));

  expect(input.value).toBe('15');

  type(input, '5000');
  fire(input, new FocusEvent('focusout', { bubbles: true }));

  expect(input.value).toBe('2000');
  expect(committed).toHaveBeenLastCalledWith(2000);
});

test('a whole-number box rounds what was typed when it is left', () => {
  const input = render({ initial: 3, integer: true });

  type(input, '3.6');

  expect(committed).not.toHaveBeenCalled();

  fire(input, new FocusEvent('focusout', { bubbles: true }));

  expect(input.value).toBe('4');
  expect(committed).toHaveBeenLastCalledWith(4);
});

test('text that cannot become a number marks the box and hands nothing up', () => {
  const input = render({ initial: 1 });

  type(input, '1x');

  expect(host.querySelector('.bp6-intent-danger')).not.toBeNull();
  expect(committed).not.toHaveBeenCalled();

  fire(input, new FocusEvent('focusout', { bubbles: true }));

  expect(input.value).toBe('1');
});

test('the arrow keys step without leaving float dust', () => {
  const input = render({ initial: 0.1, step: 0.1, min: 0 });

  act(() => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
  });

  expect(input.value).toBe('0.2');

  act(() => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        shiftKey: true,
      }),
    );
  });

  expect(input.value).toBe('1.2');
  expect(committed).toHaveBeenLastCalledWith(1.2);
});

test('the stepper buttons move the number and stop at the bounds', () => {
  const input = render({ initial: 1, min: 0, max: 2, step: 1 });
  const [up, down] = [...host.querySelectorAll('button')];

  fire(up, new MouseEvent('click', { bubbles: true }));

  expect(input.value).toBe('2');
  expect(host.querySelector('button')?.disabled).toBe(true);

  fire(down, new MouseEvent('click', { bubbles: true }));

  expect(input.value).toBe('1');
  expect(committed).toHaveBeenLastCalledWith(1);
});

test('a number changed elsewhere is shown, whatever the box last held', () => {
  function Preset() {
    const [value, setValue] = useState(0.1);
    return (
      <>
        <NumberInput value={value} onChange={setValue} ariaLabel="Amount" />
        <button type="button" onClick={() => setValue(5)}>
          Preset
        </button>
      </>
    );
  }
  act(() => root.render(<Preset />));
  const input = host.querySelector('input') as HTMLInputElement;
  type(input, '0.');

  expect(input.value).toBe('0.');

  const preset = [...host.querySelectorAll('button')].at(-1);
  fire(preset, new MouseEvent('click', { bubbles: true }));

  expect(input.value).toBe('5');
});
