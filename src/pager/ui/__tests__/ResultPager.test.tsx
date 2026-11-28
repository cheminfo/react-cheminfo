// @vitest-environment jsdom

import { act } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { ResultPager } from '../ResultPager.tsx';

beforeEach(() => {
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  document.body.innerHTML = '';
});

function step(label: string): HTMLButtonElement {
  const found = document.querySelector<HTMLButtonElement>(
    `button[aria-label="${CSS.escape(label)}"]`,
  );
  if (found === null) throw new Error(`no ${label}`);
  return found;
}

function summary(): string | null | undefined {
  return document.querySelector('.result-pager__summary')?.textContent;
}

test('the pager says which results are on screen, and steps through pages', () => {
  const asked: number[] = [];
  act(() => {
    root.render(
      <ResultPager
        total={1234}
        limit={50}
        offset={50}
        noun="ligands"
        onOffsetChange={(offset) => asked.push(offset)}
      />,
    );
  });

  expect(summary()).toBe('51–100 of 1,234 ligands');

  act(() => {
    step('First page').click();
    step('Previous page').click();
    step('Next page').click();
    step('Last page').click();
  });

  expect(asked).toStrictEqual([0, 0, 100, 1200]);
});

test('a first page cannot step back, a last one cannot step on', () => {
  act(() => {
    root.render(
      <ResultPager
        total={30}
        limit={50}
        offset={0}
        onOffsetChange={() => undefined}
      />,
    );
  });

  expect(summary()).toBe('1–30 of 30 results');
  expect(step('Previous page').disabled).toBe(true);
  expect(step('Last page').disabled).toBe(true);
});

test('no result and a loading page say so', () => {
  act(() => {
    root.render(
      <ResultPager
        total={0}
        limit={50}
        offset={0}
        noun="ligands"
        onOffsetChange={() => undefined}
      />,
    );
  });

  expect(summary()).toBe('No ligands');

  act(() => {
    root.render(
      <ResultPager
        total={120}
        limit={50}
        offset={50}
        shown={0}
        onOffsetChange={() => undefined}
      />,
    );
  });

  expect(summary()).toBe('0–50 of 120 results');
});

test('the compact pager shows the page number, and nothing for one page', () => {
  const asked: number[] = [];
  act(() => {
    root.render(
      <ResultPager
        compact
        total={120}
        limit={10}
        offset={20}
        onOffsetChange={(offset) => asked.push(offset)}
      />,
    );
  });

  expect(summary()).toBe('3 / 12');

  act(() => {
    step('Next page').click();
  });

  expect(asked).toStrictEqual([30]);

  act(() => {
    root.render(
      <ResultPager
        compact
        total={8}
        limit={10}
        offset={0}
        onOffsetChange={() => undefined}
      />,
    );
  });

  expect(document.querySelector('.result-pager')).toBeNull();
});
