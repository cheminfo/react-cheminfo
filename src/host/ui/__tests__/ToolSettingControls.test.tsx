// @vitest-environment jsdom
/**
 * The controls a host draws for a framed tool's settings, from the tool's own
 * description: what each shows is what the tool says, and a change goes to the
 * tool as the values an address writes.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ToolSettingField, ToolSettings } from '../../core/protocol.ts';
import { ToolSettingControls } from '../ToolSettingControls.tsx';

let host: HTMLDivElement;
let root: Root;
const changed = vi.fn<(settings: ToolSettings) => void>();

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  changed.mockClear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const FIELDS: ToolSettingField[] = [
  {
    key: 'style',
    label: 'Style',
    description: 'How the atoms and bonds are drawn.',
    type: 'choice',
    choices: [
      { value: 'ball', label: 'Balls' },
      { value: 'stick', label: 'Sticks' },
    ],
  },
  {
    key: 'conformer',
    label: 'Conformer',
    type: 'choice',
    choices: [
      { value: 'c1', label: '1 · 0.00 kcal/mol' },
      { value: 'c2', label: '2 · 0.84 kcal/mol' },
    ],
  },
  { key: 'surface', label: 'Surface', type: 'toggle' },
  { key: 'zoom', label: 'Zoom', type: 'number', min: 1, max: 4, unit: '×' },
];

const VALUES: ToolSettings = {
  style: 'stick',
  conformer: 'c2',
  surface: '1',
  zoom: '2',
};

function draw(values: ToolSettings | null, layout?: 'row' | 'form'): void {
  act(() => {
    root.render(
      <ToolSettingControls
        fields={FIELDS}
        values={values}
        onChange={changed}
        {...(layout === undefined ? {} : { layout })}
      />,
    );
  });
}

test('a few short choices side by side, a long list as a list, each showing what the tool says', () => {
  draw(VALUES);

  const segments = host.querySelectorAll<HTMLButtonElement>(
    '[aria-label="Style"] button',
  );
  const select = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Conformer"]',
  );

  expect([...segments].map((button) => button.textContent)).toStrictEqual([
    'Balls',
    'Sticks',
  ]);
  expect(segments[1]?.getAttribute('aria-checked')).toBe('true');
  expect(select?.value).toBe('c2');
  expect(
    host.querySelector<HTMLInputElement>('input[aria-label="Surface"]')
      ?.checked,
  ).toBe(true);
  expect(
    host.querySelector<HTMLInputElement>('input[aria-label="Zoom"]')?.value,
  ).toBe('2');
  expect(
    host.querySelector('[title="How the atoms and bonds are drawn."]'),
  ).not.toBeNull();
});

test('a change goes to the tool as the value an address writes', () => {
  draw(VALUES);

  act(() => {
    host
      .querySelector<HTMLButtonElement>('[aria-label="Style"] button')
      ?.click();
  });
  act(() => {
    host
      .querySelector<HTMLInputElement>('input[aria-label="Surface"]')
      ?.click();
  });
  const select = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Conformer"]',
  );
  act(() => {
    if (select === null) return;
    select.value = 'c1';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  expect(changed.mock.calls).toStrictEqual([
    [{ style: 'ball' }],
    [{ surface: '0' }],
    [{ conformer: 'c1' }],
  ]);
});

test('nothing is drawn until the tool has said what it shows, and a form names each control', () => {
  draw(null);

  expect(host.innerHTML).toBe('');

  draw(VALUES, 'form');

  expect(
    [...host.querySelectorAll('.tool-setting-controls > span')].map(
      (span) => span.textContent,
    ),
  ).toContain('Conformer');
});
