// @vitest-environment jsdom
/**
 * A button pressed with the pointer gives its focus up, so a tooltip its
 * focus opened closes; a key press, or a press inside an overlay, keeps it.
 */

import { afterEach, beforeAll, expect, test } from 'vitest';

import { releaseFocusOnPress } from '../releaseFocusOnPress.ts';

beforeAll(() => {
  releaseFocusOnPress();
});

afterEach(() => {
  document.body.replaceChildren();
});

function mount(html: string): HTMLElement {
  document.body.insertAdjacentHTML('beforeend', html);
  const target = document.body.querySelector<HTMLElement>('[data-target]');
  if (!target) throw new Error('no target');
  return target;
}

function press(element: Element, detail: number): void {
  element.dispatchEvent(new MouseEvent('click', { bubbles: true, detail }));
}

test('a button pressed with the pointer gives its focus up', () => {
  const button = mount('<button data-target>Save</button>');
  button.focus();
  press(button, 1);

  expect(document.activeElement).toBe(document.body);
});

test('a press on what a button holds, or on a role="button", blurs that button', () => {
  const icon = mount('<button id="b"><span data-target>✓</span></button>');
  const button = document.querySelector<HTMLElement>('#b');
  button?.focus();
  press(icon, 1);

  expect(document.activeElement).toBe(document.body);

  const tile = mount('<div role="button" tabindex="0" data-target="x"></div>');
  tile.focus();
  press(tile, 2);

  expect(document.activeElement).toBe(document.body);
});

test('a key press keeps the focus where the keyboard is working', () => {
  const button = mount('<button data-target>Save</button>');
  button.focus();
  press(button, 0);

  expect(document.activeElement).toBe(button);
});

test('a button inside an overlay keeps its focus', () => {
  const button = mount(
    '<div class="bp6-overlay"><button data-target>Close</button></div>',
  );
  button.focus();
  press(button, 1);

  expect(document.activeElement).toBe(button);
});

test('a press outside any button changes nothing', () => {
  const field = mount('<input data-target />');
  field.focus();
  press(field, 1);

  expect(document.activeElement).toBe(field);

  document.dispatchEvent(new MouseEvent('click', { detail: 1 }));

  expect(document.activeElement).toBe(field);
});
