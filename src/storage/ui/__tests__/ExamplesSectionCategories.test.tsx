// @vitest-environment jsdom
/**
 * Examples sorted into categories carry their category as a pill, and a row of
 * capsules keeps only the examples of the categories picked.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { ExamplesSection } from '../ExamplesSection.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
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

const CATEGORIES = [
  { id: 'chemistry', label: 'Chemistry', color: '#009e73' },
  { id: 'physics', label: 'Physics', color: '#0072b2' },
  { id: 'biology', label: 'Biology', color: '#cc79a7' },
];

const EXAMPLES = [
  {
    id: 'nernst',
    name: 'Nernst',
    description: 'Electrochemistry',
    category: 'chemistry',
  },
  { id: 'snell', name: 'Snell', description: 'Optics', category: 'physics' },
  { id: 'gibbs', name: 'Gibbs', description: 'Thermo', category: 'chemistry' },
  { id: 'loose', name: 'Loose', description: 'No category' },
];

function rowTexts(): string[] {
  return [...host.querySelectorAll('.folder-panel__open')].map(
    (row) => row.textContent ?? '',
  );
}

function capsule(text: string): HTMLElement {
  const found = [...host.querySelectorAll<HTMLElement>('[aria-pressed]')].find(
    (element) => element.textContent === text,
  );
  if (!found) throw new Error(`no capsule reads ${text}`);
  return found;
}

function render(): void {
  act(() => {
    root.render(
      <ExamplesSection
        examples={EXAMPLES}
        categories={CATEGORIES}
        onOpen={vi.fn()}
      />,
    );
  });
}

test('each row carries its category as a pill in its colour', () => {
  render();

  expect(rowTexts()).toStrictEqual([
    'NernstChemistryElectrochemistry',
    'SnellPhysicsOptics',
    'GibbsChemistryThermo',
    'LooseNo category',
  ]);

  const pills = host.querySelectorAll<HTMLElement>('.folder-panel__category');

  expect(pills).toHaveLength(3);
  expect(pills[1]?.style.getPropertyValue('--category')).toBe('#0072b2');
});

test('the capsules count each category and leave out the empty ones', () => {
  render();

  const capsules = [...host.querySelectorAll('[aria-pressed]')].map(
    (element) => element.textContent,
  );

  expect(capsules).toStrictEqual(['All (4)', 'Chemistry (2)', 'Physics (1)']);
  expect(host.querySelector('[role="group"]')?.getAttribute('aria-label')).toBe(
    'Categories',
  );
});

test('a capsule keeps only its examples, and All brings them all back', () => {
  render();

  act(() => {
    capsule('Chemistry (2)').click();
  });

  expect(rowTexts()).toStrictEqual([
    'NernstChemistryElectrochemistry',
    'GibbsChemistryThermo',
  ]);

  act(() => {
    capsule('Physics (1)').click();
  });

  expect(rowTexts()).toStrictEqual([
    'NernstChemistryElectrochemistry',
    'SnellPhysicsOptics',
    'GibbsChemistryThermo',
  ]);

  act(() => {
    capsule('All (4)').click();
  });

  expect(rowTexts()).toHaveLength(4);
});

test('without categories there are no pills and no capsules', () => {
  act(() => {
    root.render(<ExamplesSection examples={EXAMPLES} onOpen={vi.fn()} />);
  });

  expect(host.querySelector('.folder-panel__category')).toBeNull();
  expect(host.querySelector('[role="group"]')).toBeNull();
  expect(rowTexts()).toStrictEqual([
    'NernstElectrochemistry',
    'SnellOptics',
    'GibbsThermo',
    'LooseNo category',
  ]);
});
