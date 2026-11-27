// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { host, mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import type { ExerciseListEntry } from '../ExerciseList.tsx';
import { ExerciseList } from '../ExerciseList.tsx';

const EXERCISES: readonly ExerciseListEntry[] = [
  { id: 'mf-ethanol', title: 'Count the rings of `C2H6O`', level: 'beginner' },
  { id: 'mf-benzene', title: 'Benzene', level: 'intermediate' },
  { id: 'mf-dmso', title: 'Dimethyl sulfoxide', level: 'advanced' },
];

const PROGRESS = {
  'mf-ethanol': { status: 'solved' as const, hintsRevealed: 2 },
  'mf-benzene': { status: 'attempted' as const, hintsRevealed: 0 },
};

let selected: string[];

beforeEach(() => {
  selected = [];
  mountRoot();
  act(() => {
    root.render(
      <ExerciseList
        exercises={EXERCISES}
        progress={PROGRESS}
        activeId="mf-benzene"
        onSelect={(id) => {
          selected.push(id);
        }}
      />,
    );
  });
});

afterEach(() => {
  unmountRoot();
  vi.unstubAllGlobals();
});

test('each row says where the student stands, the open one selected', () => {
  const rows = host.querySelectorAll<HTMLElement>('[role="option"]');

  expect(rows).toHaveLength(3);
  expect(rows[1]?.dataset.selected).toBe('true');
  expect(rows[1]?.getAttribute('aria-selected')).toBe('true');
  expect(rows[0]?.dataset.selected).toBeUndefined();
  expect(rows[0]?.textContent).toBe(
    'Count the rings of C2H6ObeginnerSolved with 2 hints',
  );
  expect(rows[2]?.textContent).toBe('Dimethyl sulfoxideadvanced');
  expect(host.textContent).toContain('1 / 3 solved');
});

test('a click and the arrow keys open an exercise', () => {
  act(() => {
    (host.querySelectorAll('[role="option"]')[2] as HTMLButtonElement).click();
  });
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
  });

  expect(selected).toStrictEqual(['mf-dmso', 'mf-ethanol']);
});
