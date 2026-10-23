// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { AttemptStore } from '../../core/attempts.ts';
import { createAttemptStore } from '../../core/attempts.ts';
import { pickSeeded } from '../../core/seed.ts';
import { ExerciseSeries } from '../ExerciseSeries.tsx';

import { ELECTRONS } from './seriesFixture.ts';

let host: HTMLDivElement;
let root: Root;
let store: AttemptStore;
let seeds: Array<[number, string]>;
let counts: number[];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  store = createAttemptStore({ key: 'test' });
  seeds = [];
  counts = [];
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

function render(seed: number | null, count = 3): void {
  act(() => {
    root.render(
      <ExerciseSeries
        tool={ELECTRONS}
        store={store}
        label={(ion) => ion.formula}
        prompt={(ion) => <p>How many electrons has {ion.name}?</p>}
        seed={seed}
        onSeed={(next, history) => {
          seeds.push([next, history]);
        }}
        count={count}
        onCount={(next) => {
          counts.push(next);
        }}
        split={null}
        onSplit={() => undefined}
      />,
    );
  });
}

function rows(): string[] {
  const labels: string[] = [];
  for (const row of host.querySelectorAll('.exercise-series__list button')) {
    labels.push(row.textContent ?? '');
  }
  return labels;
}

test('the list is the series the seed draws, numbered from one', () => {
  render(42);
  const drawn = pickSeeded(ELECTRONS.pool, 3, 42).map((ion) => ion.formula);

  expect(rows()).toStrictEqual(
    drawn.map((formula, index) => `${index + 1}. ${formula}`),
  );
  expect(host.querySelector('[data-selected="true"]')?.textContent).toBe(
    `1. ${drawn[0]}`,
  );
  expect(host.textContent).toContain('0 / 3 solved');
});

test('a page opened without a seed writes the one it falls back on', () => {
  store.storeSeed('electrons', 4271);
  render(null);

  expect(seeds).toStrictEqual([[4271, 'replace']]);
  expect(store.storedSeed('electrons')).toBe(4271);
});

test('the seed on screen is the one the tool reopens on', () => {
  render(17);

  expect(seeds).toStrictEqual([]);
  expect(store.storedSeed('electrons')).toBe(17);
});

test('the length picker offers what the pool can fill, then all of it', () => {
  render(42);
  const options: string[] = [];
  for (const option of host.querySelectorAll('option')) {
    options.push(`${option.value}:${option.textContent}`);
  }

  expect(options).toStrictEqual(['5:5 questions', '6:All 6 questions']);
});

test('a new series is pushed, and the others of the tool forgotten', () => {
  store.updateAttempt('electrons/42/Na+', { status: 'solved' });
  render(42);
  let newSeries: HTMLButtonElement | undefined;
  for (const button of host.querySelectorAll('button')) {
    if (button.textContent === 'New series') newSeries = button;
  }
  act(() => {
    newSeries?.click();
  });

  expect(seeds).toHaveLength(1);
  expect(seeds[0]?.[1]).toBe('push');
  expect(store.records()).toStrictEqual({});
});

class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured: the row stacks or splits on the window alone.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing was observed.
  }
}
