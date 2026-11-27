/**
 * What a test needs of a browser that jsdom does not do: watch an element
 * resize, and type into a field React controls.
 */

import { act } from 'react';

/** A `ResizeObserver` that observes nothing, for a DOM where nothing resizes. */
export class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing was observed.
  }
}

/**
 * Type a whole value into a field React controls, as one keystroke would
 * deliver it: the value is written through the element's own setter, which
 * React watches, and a bubbling `input` event follows.
 * @param field - The input or the text area.
 * @param text - The value it holds afterwards.
 */
export function typeInto(
  field: HTMLInputElement | HTMLTextAreaElement,
  text: string,
): void {
  act(() => {
    Reflect.set(Object.getPrototypeOf(field) as object, 'value', text, field);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
