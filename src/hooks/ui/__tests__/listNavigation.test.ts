import { expect, test } from 'vitest';

import type { ListNavigationKeyEvent } from '../listNavigation.ts';
import {
  handleListNavigationKey,
  nextSelectedIndex,
} from '../listNavigation.ts';

test('the arrows move the selection one entry at a time', () => {
  expect(nextSelectedIndex('ArrowDown', { length: 5, selectedIndex: 2 })).toBe(
    3,
  );
  expect(nextSelectedIndex('ArrowUp', { length: 5, selectedIndex: 2 })).toBe(1);
});

test('with nothing selected, down enters at the top and up at the bottom', () => {
  expect(nextSelectedIndex('ArrowDown', { length: 5, selectedIndex: -1 })).toBe(
    0,
  );
  expect(nextSelectedIndex('ArrowUp', { length: 5, selectedIndex: -1 })).toBe(
    4,
  );
});

test('the ends of the list hold the selection instead of wrapping it', () => {
  expect(nextSelectedIndex('ArrowDown', { length: 5, selectedIndex: 4 })).toBe(
    4,
  );
  expect(nextSelectedIndex('ArrowUp', { length: 5, selectedIndex: 0 })).toBe(0);
});

test('home and end jump to the first and the last entry', () => {
  expect(nextSelectedIndex('Home', { length: 5, selectedIndex: 3 })).toBe(0);
  expect(nextSelectedIndex('End', { length: 5, selectedIndex: 3 })).toBe(4);
  expect(nextSelectedIndex('Home', { length: 5, selectedIndex: -1 })).toBe(0);
});

test('a page moves ten entries by default and stops at the ends', () => {
  expect(nextSelectedIndex('PageDown', { length: 40, selectedIndex: 5 })).toBe(
    15,
  );
  expect(nextSelectedIndex('PageUp', { length: 40, selectedIndex: 25 })).toBe(
    15,
  );
  expect(nextSelectedIndex('PageDown', { length: 40, selectedIndex: 35 })).toBe(
    39,
  );
  expect(nextSelectedIndex('PageUp', { length: 40, selectedIndex: 3 })).toBe(0);
});

test('a page starts at the near end when nothing is selected', () => {
  expect(nextSelectedIndex('PageDown', { length: 40, selectedIndex: -1 })).toBe(
    10,
  );
  expect(nextSelectedIndex('PageUp', { length: 40, selectedIndex: -1 })).toBe(
    29,
  );
});

test('a list may set how far a page moves', () => {
  expect(
    nextSelectedIndex('PageDown', {
      length: 40,
      selectedIndex: 0,
      pageStep: 25,
    }),
  ).toBe(25);
});

test('a page step that is not a usable number falls back to ten', () => {
  expect(
    nextSelectedIndex('PageDown', {
      length: 40,
      selectedIndex: 0,
      pageStep: 0,
    }),
  ).toBe(10);
  expect(
    nextSelectedIndex('PageDown', {
      length: 40,
      selectedIndex: 0,
      pageStep: Number.NaN,
    }),
  ).toBe(10);
  expect(
    nextSelectedIndex('PageDown', {
      length: 40,
      selectedIndex: 0,
      pageStep: -4,
    }),
  ).toBe(10);
});

test('a selected index pointing outside the list is read as no selection', () => {
  expect(nextSelectedIndex('ArrowDown', { length: 3, selectedIndex: 9 })).toBe(
    0,
  );
});

test('a key the list does not act on, and an empty list, move nothing', () => {
  expect(nextSelectedIndex('a', { length: 5, selectedIndex: 0 })).toBeNull();
  expect(
    nextSelectedIndex('Enter', { length: 5, selectedIndex: 0 }),
  ).toBeNull();
  expect(
    nextSelectedIndex('ArrowDown', { length: 0, selectedIndex: -1 }),
  ).toBeNull();
});

test('a handled key selects the new entry and keeps the page still', () => {
  const selected: number[] = [];
  const event = keyEvent('ArrowDown');

  handleListNavigationKey(event, {
    length: 5,
    selectedIndex: 1,
    onSelect: (index) => selected.push(index),
  });

  expect(selected).toStrictEqual([2]);
  expect(event.prevented).toBe(1);
});

test('a key that lands on the entry already selected still keeps the page still', () => {
  const selected: number[] = [];
  const event = keyEvent('ArrowDown');

  handleListNavigationKey(event, {
    length: 5,
    selectedIndex: 4,
    onSelect: (index) => selected.push(index),
  });

  expect(selected).toStrictEqual([]);
  expect(event.prevented).toBe(1);
});

test('a key the list ignores leaves the browser to it', () => {
  const selected: number[] = [];
  const event = keyEvent('Tab');

  handleListNavigationKey(event, {
    length: 5,
    selectedIndex: 1,
    onSelect: (index) => selected.push(index),
  });

  expect(selected).toStrictEqual([]);
  expect(event.prevented).toBe(0);
});

test('typing inside the list never moves the selection', () => {
  const selected: number[] = [];
  const targets = [
    { tagName: 'INPUT' },
    { tagName: 'TEXTAREA' },
    { tagName: 'SELECT' },
    { tagName: 'DIV', isContentEditable: true },
  ];
  let prevented = 0;

  for (const target of targets) {
    const event = keyEvent('ArrowDown');
    handleListNavigationKey(
      { ...event, target: target as unknown as EventTarget },
      {
        length: 5,
        selectedIndex: 1,
        onSelect: (index) => selected.push(index),
      },
    );
    prevented += event.prevented;
  }

  expect(selected).toStrictEqual([]);
  expect(prevented).toBe(0);
});

function keyEvent(key: string): ListNavigationKeyEvent & { prevented: number } {
  const event = {
    key,
    prevented: 0,
    preventDefault: () => {
      event.prevented += 1;
    },
  };
  return event;
}
