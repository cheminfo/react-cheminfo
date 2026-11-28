// @vitest-environment jsdom
import { act } from 'react';
import { Toolbar } from 'react-science/ui';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { NoResizeObserver } from '../../../__tests__/dom.ts';
import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { PaletteEntry } from '../PaletteEntry.tsx';

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

function show(active: boolean) {
  const taken: string[] = [];
  const added: string[] = [];
  const started: string[] = [];
  act(() => {
    root.render(
      <Toolbar vertical aria-label="Pieces">
        <PaletteEntry
          icon={<svg viewBox="0 0 16 16" />}
          tooltip="Spring: drag it onto the bench."
          label="Add a spring"
          active={active}
          onTake={() => taken.push('spring')}
          onAdd={() => added.push('spring')}
          drag={{
            draggable: true,
            onDragStart: () => {
              started.push('spring');
            },
          }}
        />
      </Toolbar>,
    );
  });
  const button = host.querySelector<HTMLButtonElement>(
    '[aria-label="Add a spring"]',
  );
  if (!button) throw new Error('no entry');
  return { button, taken, added, started };
}

function click(button: HTMLElement, detail: number): void {
  act(() => {
    button.dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true, detail }),
    );
  });
}

test('a click takes the entry in hand, a double click or a key adds it', () => {
  const { button, taken, added } = show(false);
  click(button, 1);
  click(button, 2);
  click(button, 0);

  expect(taken).toStrictEqual(['spring']);
  expect(added).toStrictEqual(['spring', 'spring']);
});

test('the entry is draggable, and lit while in hand', () => {
  const { button, started } = show(true);

  expect(button.getAttribute('draggable')).toBe('true');

  act(() => {
    button.dispatchEvent(new Event('dragstart', { bubbles: true }));
  });

  expect(started).toStrictEqual(['spring']);
  expect(button.className).toContain('bp6-active');
});
