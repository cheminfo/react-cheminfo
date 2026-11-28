// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { FilterColumn } from '../FilterColumn.tsx';

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  document.body.innerHTML = '';
});

function column(): HTMLElement {
  const found = document.querySelector<HTMLElement>(
    '[data-testid="filter-column"]',
  );
  if (found === null) throw new Error('no filter column');
  return found;
}

function button(text: string): HTMLButtonElement {
  for (const candidate of document.querySelectorAll('button')) {
    if (candidate.querySelector('.bp6-button-text')?.textContent === text) {
      return candidate;
    }
  }
  throw new Error(`no button ${text}`);
}

test('a column on a page is headed Filters and folds behind Show', () => {
  const cleared: number[] = [];
  act(() => {
    root.render(
      <FilterColumn canClear onClear={() => cleared.push(1)}>
        <fieldset>formula</fieldset>
      </FilterColumn>,
    );
  });

  expect(column().className).toBe('filter-column filter-column--page');
  expect(column().getAttribute('aria-label')).toBe('Filters');
  expect(column().getAttribute('aria-busy')).toBe('false');
  expect(document.querySelector('h2')?.textContent).toBe('Filters');
  expect(document.querySelector('.filter-column__body')?.textContent).toBe(
    'formula',
  );

  act(() => {
    button('Show').click();
  });

  expect(column().className).toBe(
    'filter-column filter-column--page filter-column--open',
  );
  expect(button('Hide').getAttribute('aria-expanded')).toBe('true');

  act(() => {
    button('Clear').click();
  });

  expect(cleared).toStrictEqual([1]);
});

test('a column in a pane counts its filters and says when it is busy', () => {
  act(() => {
    root.render(
      <FilterColumn
        canClear={false}
        onClear={() => undefined}
        count={3}
        loading
        layout="pane"
        testId="filter-column"
      >
        <fieldset>cell</fieldset>
      </FilterColumn>,
    );
  });

  expect(column().className).toBe(
    'filter-column filter-column--pane filter-column--loading',
  );
  expect(column().getAttribute('aria-busy')).toBe('true');
  expect(document.querySelector('h2')?.textContent).toBe('Filters (3)');
  expect(button('Clear').disabled).toBe(true);
});

test('no filter in force means no count in the title', () => {
  act(() => {
    root.render(
      <FilterColumn canClear={false} onClear={() => undefined} count={0}>
        nothing
      </FilterColumn>,
    );
  });

  expect(document.querySelector('h2')?.textContent).toBe('Filters');
});
