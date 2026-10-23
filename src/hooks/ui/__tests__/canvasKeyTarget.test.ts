import { expect, test } from 'vitest';

import { isInteractiveTarget, isTextEntryTarget } from '../keyTargets.ts';
import { handleListNavigationKey } from '../listNavigation.ts';

test('a key aimed at a canvas belongs to it, as an editor reads its own keys', () => {
  expect(
    isTextEntryTarget({ tagName: 'CANVAS' } as unknown as EventTarget),
  ).toBe(true);
  expect(
    isInteractiveTarget({ tagName: 'CANVAS' } as unknown as EventTarget),
  ).toBe(false);
  expect(isTextEntryTarget({ tagName: 'DIV' } as unknown as EventTarget)).toBe(
    false,
  );
});

test('the arrows on a structure editor never move the list around it', () => {
  const selected: number[] = [];
  let prevented = 0;

  const handled = handleListNavigationKey(
    {
      key: 'ArrowDown',
      target: { tagName: 'CANVAS' } as unknown as EventTarget,
      preventDefault: () => {
        prevented++;
      },
    },
    { length: 3, selectedIndex: 0, onSelect: (index) => selected.push(index) },
  );

  expect(handled).toBe(false);
  expect(selected).toStrictEqual([]);
  expect(prevented).toBe(0);
});
