// @vitest-environment jsdom
import { expect, test } from 'vitest';

import { fromControl, fromPortal } from '../eventSource.ts';
import { handleListNavigationKey } from '../listNavigation.ts';

/**
 * A row of a list holding its text, its picture, a button with an icon, a
 * field and a menu item, and a menu opened from it in a portal at the end of
 * the page.
 * @returns The row and its parts.
 */
function row() {
  document.body.innerHTML = `
    <div id="row" role="option">
      <span id="name">Smooth</span>
      <canvas id="picture"></canvas>
      <button id="more"><svg id="icon"><path id="glyph"/></svg></button>
      <input id="field">
      <a id="item" role="menuitem">Duplicate</a>
      <a id="plain">a link without an address</a>
    </div>
    <div id="portal"><a id="portalItem" role="menuitem">Delete</a></div>`;
  const byId = (id: string) => document.querySelector(`#${id}`);
  return { row: byId('row'), byId };
}

test('a click on the row, its text or its picture is the row’s own; one on a button, its icon, a field or a menu item is the control’s', () => {
  const { row: holder, byId } = row();
  const source = ['row', 'name', 'picture', 'plain', 'more', 'glyph', 'field']
    .concat(['item'])
    .map((id) => fromControl({ target: byId(id), currentTarget: holder }));

  expect(source).toStrictEqual([
    false,
    false,
    false,
    false,
    true,
    true,
    true,
    true,
  ]);
});

test('an event of a menu opened from the row comes through a portal, and is a control’s', () => {
  const { row: holder, byId } = row();
  const portal = byId('portalItem');

  expect([
    fromPortal({ target: portal, currentTarget: holder }),
    fromControl({ target: portal, currentTarget: holder }),
    fromPortal({ target: byId('name'), currentTarget: holder }),
    fromPortal({ target: null, currentTarget: holder }),
  ]).toStrictEqual([true, true, false, false]);
});

test('a key reaching a list from a menu opened inside it never moves its selection; one of the list’s own rows does', () => {
  const { row: holder, byId } = row();
  const list = document.createElement('div');
  list.append(holder ?? '');
  document.body.prepend(list);
  const selected: number[] = [];
  const press = (target: Element | null) =>
    handleListNavigationKey(
      {
        key: 'ArrowDown',
        target,
        currentTarget: list,
        preventDefault: () => undefined,
      },
      {
        length: 3,
        selectedIndex: 0,
        onSelect: (index) => selected.push(index),
      },
    );

  expect([press(byId('portalItem')), press(holder), selected]).toStrictEqual([
    false,
    true,
    [1],
  ]);
});
