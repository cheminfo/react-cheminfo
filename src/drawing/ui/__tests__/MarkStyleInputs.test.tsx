// @vitest-environment jsdom
/**
 * A mark's opacity is typed in percent and stored as a fraction, its size in
 * pixels: the one way every panel of a drawing writes them.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { MarkOpacityInput, MarkSizeInput } from '../MarkStyleInputs.tsx';

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

function boxOf(id: string): HTMLInputElement {
  const box = host.querySelector<HTMLInputElement>(`input#${id}`);
  if (box === null) throw new Error(`no box ${id}`);
  return box;
}

function type(input: HTMLInputElement, text: string): void {
  act(() => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.bind(input);
    setValue?.(text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('an opacity of 0.25 reads 25 %, and 60 typed is 0.6; a width reads in px', () => {
  const opacity = vi.fn<(value: number) => void>();
  const width = vi.fn<(value: number) => void>();
  act(() =>
    root.render(
      <>
        <MarkOpacityInput id="o" value={0.25} onChange={opacity} />
        <MarkSizeInput id="w" value={1.5} onChange={width} />
      </>,
    ),
  );
  const box = boxOf('o');
  const widthBox = boxOf('w');
  const shown = [box.value, widthBox.value, host.textContent];
  type(box, '60');
  type(widthBox, '4');

  expect({
    shown,
    opacity: opacity.mock.calls,
    width: width.mock.calls,
  }).toStrictEqual({
    shown: ['25', '1.5', '%px'],
    opacity: [[0.6]],
    width: [[4]],
  });
});
