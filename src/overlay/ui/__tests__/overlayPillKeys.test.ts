import { expect, test } from 'vitest';

import { handleOverlayPillKey } from '../overlayPillKeys.ts';

/**
 * A key arriving at a strip of four pills with the second one in force.
 * @param key - The key that was pressed.
 * @returns What the strip did with it.
 */
function press(key: string): { selected: number | null; prevented: boolean } {
  let selected: number | null = null;
  let prevented = false;
  handleOverlayPillKey(
    {
      key,
      preventDefault: () => {
        prevented = true;
      },
    },
    {
      length: 4,
      selectedIndex: 1,
      onSelect: (index) => {
        selected = index;
      },
    },
  );
  return { selected, prevented };
}

test('the sideways arrows move along the strip', () => {
  expect(press('ArrowRight').selected).toBe(2);
  expect(press('ArrowLeft').selected).toBe(0);
});

test('Home and End reach the two ends', () => {
  expect(press('Home').selected).toBe(0);
  expect(press('End').selected).toBe(3);
});

test('the strip stops at its ends rather than wrapping past them', () => {
  let selected: number | null = null;
  handleOverlayPillKey(
    { key: 'ArrowLeft', preventDefault: () => null },
    {
      length: 4,
      selectedIndex: 0,
      onSelect: (index) => {
        selected = index;
      },
    },
  );

  expect(selected).toBeNull();
});

test('a key the strip acts on never also scrolls the page under it', () => {
  expect(press('ArrowRight').prevented).toBe(true);
  expect(press('Home').prevented).toBe(true);
});

test('a key the strip has no use for is left to the page', () => {
  const typed = press('a');

  expect(typed.selected).toBeNull();
  expect(typed.prevented).toBe(false);
});

test('an arrow typed into a field inside the strip leaves the choice alone', () => {
  let selected: number | null = null;
  handleOverlayPillKey(
    {
      key: 'ArrowRight',
      target: { tagName: 'INPUT' } as unknown as EventTarget,
      preventDefault: () => null,
    },
    {
      length: 4,
      selectedIndex: 1,
      onSelect: (index) => {
        selected = index;
      },
    },
  );

  expect(selected).toBeNull();
});
