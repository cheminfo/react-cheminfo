// @vitest-environment jsdom
/**
 * What a page playing a demo changes about itself: the demo's pointer is
 * taken as captured, since the browser never saw it press, and the focus is
 * not taken while the presenter's page holds the keyboard.
 *
 * Both are installed once per page, on the prototypes, so each runs once here.
 */

import { afterEach, expect, test, vi } from 'vitest';

import {
  DEMO_POINTER_ID,
  keepKeyboardOutside,
  tolerateDemoPointer,
} from '../demoEvents.ts';

const CAPTURE_METHODS = [
  'setPointerCapture',
  'releasePointerCapture',
  'hasPointerCapture',
] as const;

function ownMethod(prototype: object, name: string): unknown {
  return Object.getOwnPropertyDescriptor(prototype, name)?.value;
}

afterEach(() => {
  for (const name of CAPTURE_METHODS) {
    Reflect.deleteProperty(Element.prototype, name);
  }
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.resetModules();
});

test('the demo pointer is taken as captured, and any other goes to the browser', () => {
  const calls: Array<[string, number]> = [];
  for (const name of CAPTURE_METHODS) {
    Object.defineProperty(Element.prototype, name, {
      configurable: true,
      writable: true,
      value(pointerId: number) {
        calls.push([name, pointerId]);
        return name === 'hasPointerCapture' ? false : undefined;
      },
    });
  }
  const canvas = document.createElement('canvas');

  tolerateDemoPointer();
  const installed = ownMethod(Element.prototype, 'setPointerCapture');
  tolerateDemoPointer();

  expect(ownMethod(Element.prototype, 'setPointerCapture')).toBe(installed);
  expect(canvas.setPointerCapture(DEMO_POINTER_ID)).toBeUndefined();
  expect(canvas.hasPointerCapture(DEMO_POINTER_ID)).toBe(true);
  expect(canvas.releasePointerCapture(DEMO_POINTER_ID)).toBeUndefined();
  expect(calls).toStrictEqual([]);

  canvas.setPointerCapture(1);

  expect(canvas.hasPointerCapture(1)).toBe(false);

  canvas.releasePointerCapture(1);

  expect(calls).toStrictEqual([
    ['setPointerCapture', 1],
    ['hasPointerCapture', 1],
    ['releasePointerCapture', 1],
  ]);
});

test('a browser with no pointer capture is left without one', async () => {
  const fresh = await import('../demoEvents.ts');

  fresh.tolerateDemoPointer();

  for (const name of CAPTURE_METHODS) {
    expect(Object.hasOwn(Element.prototype, name)).toBe(false);
  }
});

test('the focus is not taken while the page framing the tool holds the keyboard', () => {
  const hasFocus = vi.spyOn(document, 'hasFocus').mockReturnValue(false);
  document.body.innerHTML = '<input><svg><rect tabindex="0"></rect></svg>';
  const field = document.querySelector('input') as HTMLInputElement;
  const shape = document.querySelector('rect') as SVGRectElement;

  keepKeyboardOutside();
  const installed = ownMethod(HTMLElement.prototype, 'focus');
  keepKeyboardOutside();

  expect(ownMethod(HTMLElement.prototype, 'focus')).toBe(installed);

  field.focus();
  shape.focus();

  expect(document.activeElement).toBe(document.body);

  hasFocus.mockReturnValue(true);
  field.focus({ preventScroll: true });

  expect(document.activeElement).toBe(field);

  shape.focus();

  expect(document.activeElement).toBe(shape);
});
