// @vitest-environment jsdom
import { expect, test } from 'vitest';

import type { FocusedControl } from '../focusKeys.ts';
import { keyBelongsTo, keyBelongsToFocus } from '../focusKeys.ts';

/**
 * A focused control.
 * @param role - Its role.
 * @param chosen - Whether it is already chosen.
 * @param multiple - Whether its list takes several options.
 * @returns The control.
 */
function control(
  role: string,
  chosen = false,
  multiple = false,
): FocusedControl {
  return { role, chosen, multiple };
}

/**
 * The first element of some markup, put in the document.
 * @param markup - The markup.
 * @param selector - The element the key is aimed at.
 * @returns It.
 */
function aimedAt(markup: string, selector: string): HTMLElement {
  document.body.innerHTML = markup;
  const element = document.querySelector<HTMLElement>(selector);
  if (element === null) throw new Error(`no ${selector}`);
  return element;
}

test('Space goes to the page over a control that does nothing with it: a slider, a link, the radio or option already chosen', () => {
  expect(keyBelongsTo(' ', control('slider'))).toBe(false);
  expect(keyBelongsTo(' ', control('link'))).toBe(false);
  expect(keyBelongsTo(' ', control('radio', true))).toBe(false);
  expect(keyBelongsTo(' ', control('option', true))).toBe(false);
  expect(keyBelongsTo(' ', control('tab', true))).toBe(false);
  expect(keyBelongsTo(' ', null)).toBe(false);
});

test('Space stays with a control that acts on it', () => {
  expect(keyBelongsTo(' ', control('button'))).toBe(true);
  expect(keyBelongsTo(' ', control('checkbox', true))).toBe(true);
  expect(keyBelongsTo(' ', control('switch'))).toBe(true);
  expect(keyBelongsTo(' ', control('summary'))).toBe(true);
  expect(keyBelongsTo(' ', control('menuitemradio', true))).toBe(true);
  expect(keyBelongsTo(' ', control('radio'))).toBe(true);
  expect(keyBelongsTo(' ', control('option'))).toBe(true);
  expect(keyBelongsTo(' ', control('option', true, true))).toBe(true);
  expect(keyBelongsTo(' ', control('tab'))).toBe(true);
});

test('Enter stays with every control but a slider; other keys are the page’s', () => {
  expect(keyBelongsTo('Enter', control('link'))).toBe(true);
  expect(keyBelongsTo('Enter', control('radio', true))).toBe(true);
  expect(keyBelongsTo('Enter', control('slider'))).toBe(false);
  expect(keyBelongsTo('Enter', null)).toBe(false);
  expect(keyBelongsTo('x', control('button'))).toBe(false);
});

test('every key typed in a text field, a text area, an editable region or a select is theirs', () => {
  const fields = [
    aimedAt('<input type="text" />', 'input'),
    aimedAt('<textarea></textarea>', 'textarea'),
    aimedAt('<div contenteditable="true"><b>label</b></div>', 'b'),
    aimedAt('<select><option>one</option></select>', 'option'),
  ];

  for (const target of fields) {
    expect(keyBelongsToFocus({ key: ' ', target })).toBe(true);
    expect(keyBelongsToFocus({ key: 'f', target })).toBe(true);
  }
});

test('over a control, Space and Enter follow it, and other keys are the page’s', () => {
  const button = aimedAt('<button><span>Run</span></button>', 'span');
  const chosen = aimedAt(
    '<div role="radiogroup"><div role="radio" aria-checked="true">x</div></div>',
    '[role="radio"]',
  );
  const checkbox = aimedAt('<input type="checkbox" />', 'input');

  expect(keyBelongsToFocus({ key: ' ', target: button })).toBe(true);
  expect(keyBelongsToFocus({ key: 'f', target: button })).toBe(false);
  expect(keyBelongsToFocus({ key: ' ', target: chosen })).toBe(false);
  expect(keyBelongsToFocus({ key: 'Enter', target: chosen })).toBe(true);
  expect(keyBelongsToFocus({ key: ' ', target: checkbox })).toBe(true);
  expect(keyBelongsToFocus({ key: 'Delete', target: checkbox })).toBe(false);
  expect(keyBelongsToFocus({ key: ' ', target: document.body })).toBe(false);
  expect(keyBelongsToFocus({ key: ' ', target: null })).toBe(false);
});
