import { expect, test } from 'vitest';

import type {
  DocumentListKeyEvent,
  DocumentListNavigationOptions,
} from '../documentListNavigation.ts';
import { handleDocumentListKey } from '../documentListNavigation.ts';
import { handleListNavigationKey } from '../listNavigation.ts';

test('the arrows move the selection from anywhere on the page', () => {
  const { options, selected, activated } = listOptions(2);
  const down = keyEvent('ArrowDown');
  const up = keyEvent('ArrowUp');

  handleDocumentListKey(down, options);
  handleDocumentListKey(up, options);

  expect(selected).toStrictEqual([3, 1]);
  expect(activated).toStrictEqual([]);
  expect(down.prevented + up.prevented).toBe(2);
});

test('the page keys scroll the page unless the list asks for them', () => {
  const plain = listOptions(2);
  const paged = listOptions(2, { pageKeys: true });
  const leftToPage = keyEvent('End');

  handleDocumentListKey(leftToPage, plain.options);
  handleDocumentListKey(keyEvent('End'), paged.options);

  expect(plain.selected).toStrictEqual([]);
  expect(leftToPage.prevented).toBe(0);
  expect(paged.selected).toStrictEqual([5]);
});

test('Enter activates the selected entry, but not over a button or with nothing selected', () => {
  const { options, activated } = listOptions(4);
  const button = {
    tagName: 'BUTTON',
    getAttribute: () => null,
  } as unknown as EventTarget;
  const onRow = keyEvent('Enter');

  handleDocumentListKey(onRow, options);
  handleDocumentListKey({ ...keyEvent('Enter'), target: button }, options);
  handleDocumentListKey(keyEvent('Enter'), { ...options, selectedIndex: -1 });
  handleDocumentListKey(keyEvent('Enter'), {
    ...options,
    onActivate: undefined,
  });

  expect(activated).toStrictEqual([4]);
  expect(onRow.prevented).toBe(1);
});

test('a used key, a modified key, a field, an ignored target and a disabled list are left alone', () => {
  const { options, selected } = listOptions(2);
  const input = { tagName: 'INPUT' } as unknown as EventTarget;
  const canvas = { tagName: 'CANVAS' } as unknown as EventTarget;

  handleDocumentListKey(
    { ...keyEvent('ArrowDown'), defaultPrevented: true },
    options,
  );
  handleDocumentListKey({ ...keyEvent('ArrowDown'), metaKey: true }, options);
  handleDocumentListKey({ ...keyEvent('ArrowDown'), shiftKey: true }, options);
  handleDocumentListKey({ ...keyEvent('ArrowDown'), target: input }, options);
  handleDocumentListKey(
    { ...keyEvent('ArrowDown'), target: canvas },
    {
      ...options,
      ignoreKey: (event) =>
        (event.target as { tagName?: string } | null)?.tagName === 'CANVAS',
    },
  );
  handleDocumentListKey(keyEvent('ArrowDown'), { ...options, enabled: false });

  expect(selected).toStrictEqual([]);
});

test('the handlers say whether the selection moved, so the page knows when to scroll', () => {
  const { options } = listOptions(2);

  expect(handleDocumentListKey(keyEvent('ArrowDown'), options)).toBe(true);
  expect(handleDocumentListKey(keyEvent('Enter'), options)).toBe(false);
  expect(handleDocumentListKey(keyEvent('Home'), options)).toBe(false);
  expect(
    handleListNavigationKey(keyEvent('ArrowUp'), {
      ...options,
      selectedIndex: 0,
    }),
  ).toBe(false);
  expect(handleListNavigationKey(keyEvent('End'), options)).toBe(true);
});

function listOptions(
  selectedIndex: number,
  extra: Partial<DocumentListNavigationOptions> = {},
) {
  const selected: number[] = [];
  const activated: number[] = [];
  const options: DocumentListNavigationOptions = {
    length: 6,
    selectedIndex,
    onSelect: (index) => selected.push(index),
    onActivate: (index) => activated.push(index),
    ...extra,
  };
  return { options, selected, activated };
}

function keyEvent(key: string): DocumentListKeyEvent & { prevented: number } {
  const event = {
    key,
    target: null,
    prevented: 0,
    preventDefault: () => {
      event.prevented += 1;
    },
  };
  return event;
}
