// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { isEditingField } from '../isEditingField.ts';

/** Where an SVG element is created, the chart being one. */
const SVG_NAMESPACE = 'https://www.w3.org/2000/svg';

test('the fields a key belongs to rather than to the chart', () => {
  expect(isEditingField(document.createElement('input'))).toBe(true);
  expect(isEditingField(document.createElement('textarea'))).toBe(true);
  // The background is chosen from one of these, and `c` picks an option in it
  // rather than hiding the components behind it.
  expect(isEditingField(document.createElement('select'))).toBe(true);
});

test('everything else is the viewer, and answers its keys', () => {
  expect(isEditingField(document.createElement('div'))).toBe(false);
  expect(isEditingField(document.createElement('button'))).toBe(false);
  expect(isEditingField(document.createElementNS(SVG_NAMESPACE, 'svg'))).toBe(
    false,
  );
});

test('a press delivered to nothing at all is not a press being typed', () => {
  expect(isEditingField(null)).toBe(false);
  expect(isEditingField(new EventTarget())).toBe(false);
});
