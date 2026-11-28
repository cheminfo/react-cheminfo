// @vitest-environment jsdom
/**
 * The menu lining up what is selected: from two blocks, spacing out from
 * three, the button wrapped in whatever the site names its command with.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NoResizeObserver } from '../../../__tests__/dom.ts';
import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import type { Arrangement } from '../../core/arrangement.ts';
import { AlignButton } from '../AlignButton.tsx';

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

function render(blocks: number): Arrangement[] {
  const arranged: Arrangement[] = [];
  act(() => {
    root.render(
      <AlignButton
        blocks={blocks}
        onArrange={(arrangement) => {
          arranged.push(arrangement);
        }}
        wrapButton={(button) => <span className="hint">{button}</span>}
      />,
    );
  });
  return arranged;
}

function open(): HTMLElement[] {
  act(() => {
    host
      .querySelector('button')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  return [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')];
}

test('one block leaves the button off, inside the site’s wrapper', () => {
  render(1);

  expect(host.querySelector('.hint > button')?.hasAttribute('disabled')).toBe(
    true,
  );
});

test('two blocks align and line up, and spacing them out waits for a third', () => {
  const arranged = render(2);
  const items = open();

  expect(items.map((item) => item.textContent)).toStrictEqual([
    'Align left',
    'Align centre',
    'Align right',
    'Align top',
    'Align middle',
    'Align bottom',
    'Distribute horizontally',
    'Distribute vertically',
    'Arrange in a row',
    'Arrange in a column',
  ]);

  const disabled: string[] = [];
  for (const item of items) {
    if (item.getAttribute('aria-disabled') === 'true') {
      disabled.push(item.textContent ?? '');
    }
  }

  expect(disabled).toStrictEqual([
    'Distribute horizontally',
    'Distribute vertically',
  ]);

  act(() => {
    items[8]?.click();
  });

  expect(arranged).toStrictEqual(['row']);
});
