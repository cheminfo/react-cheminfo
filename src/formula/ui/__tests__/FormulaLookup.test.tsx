// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { FormulaLookup } from '../FormulaLookup.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function inputs(): HTMLInputElement[] {
  return [...host.querySelectorAll('input')];
}

function listed(): string[] {
  return [...host.querySelectorAll('.formula-lookup__list li')].map(
    (item) => item.textContent,
  );
}

function type(input: HTMLInputElement | undefined, text: string): void {
  if (input === undefined) throw new Error('no box to type into');
  act(() => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.bind(input);
    setValue?.(text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('the panel opens empty, on the default ranges', () => {
  act(() => root.render(<FormulaLookup className="rail" />));

  expect(host.querySelector('aside')?.className).toBe('formula-lookup rail');
  expect(inputs()).toHaveLength(17);
  expect(inputs()[0]?.value).toBe('');
  expect(
    [...host.querySelectorAll('.formula-lookup__range')].map(
      (row) => row.textContent,
    ),
  ).toStrictEqual(['C–', 'H–', 'O–', 'N–', 'S–', 'F–', 'Cl–', 'Br–']);
  expect(inputs()[1]?.getAttribute('aria-label')).toBe('Fewest C atoms');
  expect(inputs()[2]?.value).toBe('30');
  expect(host.querySelector('.formula-lookup__results')?.textContent).toBe(
    'Type a mass to list the formulas these ranges allow.',
  );
});

test('a typed mass lists the closest formulas with their ppm', async () => {
  act(() =>
    root.render(
      <FormulaLookup
        ranges={[
          { element: 'C', min: 0, max: 12 },
          { element: 'H', min: 0, max: 20 },
          { element: 'O', min: 0, max: 2 },
        ]}
        limit={2}
      />,
    ),
  );

  type(inputs()[0], '150.1045');

  await vi.waitFor(() => {
    expect(listed()).toStrictEqual(['C10H14O0.2 ppm', 'C11H18-242.1 ppm']);
  });

  expect(host.querySelector('.formula-lookup__count')?.textContent).toBe(
    'The 2 closest of 4 formulas',
  );

  const mostCarbon = host.querySelector<HTMLInputElement>(
    'input[aria-label="Most C atoms"]',
  );
  type(mostCarbon ?? undefined, '9');

  await vi.waitFor(() => {
    expect(listed()).toStrictEqual(['C9H10O2242.7 ppm']);
  });

  expect(host.querySelector('.formula-lookup__count')?.textContent).toBe(
    '1 formula',
  );
});

test('a page that owns the mass seeds it, and hears the reset', async () => {
  const onMassChange = vi.fn<(mass: number | undefined) => void>();
  act(() =>
    root.render(
      <FormulaLookup
        mass={78.047}
        onMassChange={onMassChange}
        ranges={[
          { element: 'C', min: 0, max: 10 },
          { element: 'H', min: 0, max: 10 },
        ]}
      />,
    ),
  );

  expect(inputs()[0]?.value).toBe('78.047');

  await vi.waitFor(() => {
    expect(listed()).toStrictEqual(['C6H60.6 ppm']);
  });

  act(() => {
    host.querySelector('button')?.click();
  });

  expect(onMassChange).toHaveBeenCalledExactlyOnceWith(undefined);
});
