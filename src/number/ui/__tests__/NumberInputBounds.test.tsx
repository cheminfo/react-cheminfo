// @vitest-environment jsdom
/**
 * A box shown is not a box edited: bounds that arrive or move after the box
 * was drawn — the frames of a movie read after its settings opened — never
 * write the number back. Blueprint's `NumericInput` hands the clamped number
 * to `onValueChange` whenever its bounds change, so a range of frames would be
 * rewritten by being shown. The bounds apply when the reader leaves the box,
 * as every other correction does.
 */

import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NumberInput } from '../NumberInput.tsx';

let host: HTMLDivElement;
let root: Root;
const written = vi.fn<(value: number) => void>();

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  written.mockClear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

/**
 * A box wired the way a site wires it: the parent owns the number, and the
 * bounds come from elsewhere.
 * @param props - The box's largest value.
 * @param props.max - Its largest value, when known.
 * @returns The box.
 */
function Frames(props: { max: number | undefined }) {
  const [value, setValue] = useState(3);
  return (
    <NumberInput
      value={value}
      min={1}
      max={props.max}
      integer
      ariaLabel="To"
      onChange={(next) => {
        written(next);
        setValue(next);
      }}
    />
  );
}

function show(max: number | undefined): HTMLInputElement {
  act(() => root.render(<Frames max={max} />));
  const input = host.querySelector('input');
  if (input === null) throw new Error('the box was not rendered');
  return input;
}

test('bounds that arrive below the number write nothing until the box is left', () => {
  show(undefined);
  show(1);
  const input = show(15);

  expect([input.value, written.mock.calls]).toStrictEqual(['3', []]);

  show(1);
  act(() => {
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  });

  expect([input.value, written.mock.calls]).toStrictEqual(['1', [[1]]]);
});
