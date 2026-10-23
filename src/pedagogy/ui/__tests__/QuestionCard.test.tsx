// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { HiddenPartsProvider } from '../../../share/ui/HiddenPartsProvider.tsx';
import type { AttemptStore } from '../../core/attempts.ts';
import { createAttemptStore } from '../../core/attempts.ts';
import { QuestionCard } from '../QuestionCard.tsx';

import type { Ion } from './seriesFixture.ts';
import { ELECTRONS, IONS } from './seriesFixture.ts';

let host: HTMLDivElement;
let root: Root;
let store: AttemptStore;
const SODIUM = IONS[0] as Ion;
const KEY = 'electrons/7/Na+';

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  store = createAttemptStore({ key: 'test' });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function render(hidden: readonly string[] = []): void {
  act(() => {
    root.render(
      <HiddenPartsProvider hidden={hidden}>
        <QuestionCard
          tool={ELECTRONS}
          question={SODIUM}
          store={store}
          storageKey={KEY}
          number={2}
          total={5}
          prompt={(ion) => <p>How many electrons has {ion.name}?</p>}
          onNext={() => undefined}
        />
      </HiddenPartsProvider>,
    );
  });
}

function button(text: string): HTMLButtonElement {
  for (const candidate of host.querySelectorAll('button')) {
    if (candidate.textContent?.startsWith(text)) return candidate;
  }
  throw new Error(`no button "${text}"`);
}

function type(value: string): void {
  const input = host.querySelector('input');
  if (input === null) throw new Error('no box');
  act(() => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.bind(input);
    setValue?.(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('the card names the question, its place in the series and its level', () => {
  render();

  expect(host.querySelector('article')?.getAttribute('aria-label')).toBe(
    'Question 2',
  );
  expect(host.querySelector('.series-question__meta')?.textContent).toBe(
    'Question 2 of 5beginner',
  );
  expect(host.querySelector('label')?.textContent?.trim()).toBe('Electrons');
  expect(button('Check').disabled).toBe(true);
});

test('the verdict waits for Check, and a right answer is marked solved', () => {
  render();
  type('11');

  expect(host.querySelector('ul')).toBeNull();

  type('10');
  act(() => {
    button('Check').click();
  });

  expect(store.attemptFor(KEY).status).toBe('solved');
  expect(host.textContent).toContain('10 electrons');
  expect(host.textContent).toContain('Without a hint.');
  expect(button('Next question')).toBeDefined();
});

test('a changed answer hides the verdict until it is checked again', () => {
  render();
  type('12');
  act(() => {
    button('Check').click();
  });

  expect(store.attemptFor(KEY).status).toBe('attempted');
  expect(host.textContent).toContain('12 electrons, expected 10');

  type('13');

  expect(host.textContent).not.toContain('expected 10');
});

test('hints open one at a time and the solution is always offered', () => {
  render();
  act(() => {
    button('Reveal hint').click();
  });

  expect(store.attemptFor(KEY).hintsRevealed).toBe(1);
  expect(host.textContent).toContain('Count the protons first.');

  act(() => {
    button('Reveal solution').click();
  });

  expect(host.textContent).toContain('11 protons, charge 1: 10 electrons.');

  act(() => {
    button('Reset').click();
  });

  expect(store.attemptFor(KEY)).toStrictEqual({
    status: 'idle',
    answers: {},
    checked: null,
    hintsRevealed: 0,
    showSolution: false,
  });
});

test('a link hiding the solutions takes the button away', () => {
  render(['solutions']);

  expect(() => button('Reveal solution')).toThrow('no button');
});
