// @vitest-environment jsdom
/**
 * What a drawing is set on: nothing, white, a pale grey, or a colour picked.
 */

import { act } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { BackgroundRow } from '../BackgroundRow.tsx';

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
});

function render(value: string | undefined): Array<string | undefined> {
  const picked: Array<string | undefined> = [];
  act(() => {
    root.render(
      <BackgroundRow
        value={value}
        onChange={(background) => {
          picked.push(background);
        }}
      />,
    );
  });
  return picked;
}

function button(text: string): HTMLButtonElement {
  for (const candidate of host.querySelectorAll('button')) {
    if (candidate.textContent === text) return candidate;
  }
  throw new Error(`no ${text} button`);
}

test('the background in use is pressed, and a preset is picked with one click', () => {
  const picked = render('#ffffff');

  expect(button('White').classList.contains('bp6-active')).toBe(true);
  expect(button('None').classList.contains('bp6-active')).toBe(false);

  act(() => {
    button('Grey').click();
    button('None').click();
  });

  expect(picked).toStrictEqual(['#f2f2f2', undefined]);
  expect(host.textContent).toContain(
    'Journals want none: the page is the paper.',
  );
});
