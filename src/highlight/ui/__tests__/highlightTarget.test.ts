import { expect, test } from 'vitest';

import type { Highlight } from '../../core/highlight.ts';
import { highlightTarget } from '../highlightTarget.ts';

function modeHighlight(): Highlight<number> {
  return { hovered: { value: null }, selected: { value: null } };
}

test('pointing at an element lights it, and leaving it clears it', () => {
  const highlight = modeHighlight();
  highlightTarget(highlight, 4).onPointerEnter();

  expect(highlight.hovered.value).toBe(4);
  expect(highlightTarget(highlight, 4)['data-highlight']).toBe('hovered');
  expect(highlightTarget(highlight, 5)['data-highlight']).toBeUndefined();

  highlightTarget(highlight, 4).onPointerLeave();

  expect(highlight.hovered.value).toBeNull();
});

test('a leave heard after the next enter keeps what the next element lit', () => {
  const highlight = modeHighlight();
  const first = highlightTarget(highlight, 1);
  const second = highlightTarget(highlight, 2);
  first.onPointerEnter();
  second.onPointerEnter();
  first.onPointerLeave();

  expect(highlight.hovered.value).toBe(2);
});

test('a click chooses the element and keeps it chosen', () => {
  const highlight = modeHighlight();
  const target = highlightTarget(highlight, 7);
  target.onPointerEnter();
  target.onClick();
  target.onPointerLeave();

  expect(highlight.selected.value).toBe(7);
  expect(highlight.hovered.value).toBeNull();
  expect(highlightTarget(highlight, 7)['data-highlight']).toBe('selected');
});
