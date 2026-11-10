// @vitest-environment jsdom
/**
 * The colour scale picker, opened and used: a scale picked from the strips,
 * one colour picked from its swatch, and a scale of one's own built in the
 * editor the menu turns into.
 */

import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ColorScaleSelectProps } from '../ColorScaleSelect.tsx';
import { ColorScaleSelect } from '../ColorScaleSelect.tsx';

let host: HTMLDivElement;
let root: Root;
const changes: string[] = [];

type HarnessProps = Omit<ColorScaleSelectProps, 'value' | 'onChange'> & {
  start: string;
};

function Harness(props: HarnessProps) {
  const { start, ...rest } = props;
  const [value, setValue] = useState(start);
  return (
    <ColorScaleSelect
      {...rest}
      value={value}
      onChange={(next) => {
        changes.push(next);
        setValue(next);
      }}
    />
  );
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  changes.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function open(props: HarnessProps): void {
  act(() => root.render(<Harness {...props} />));
  click(document.querySelector('button[aria-label="Colour scale"]'));
}

function click(target: Element | null | undefined): void {
  act(() => {
    (target as HTMLElement | null)?.click();
  });
}

function item(text: string): Element | undefined {
  return [...document.querySelectorAll('.bp6-menu-item')].find((entry) =>
    entry.textContent?.startsWith(text),
  );
}

function selected(text: string): string | null | undefined {
  return item(text)?.closest('[role="option"]')?.getAttribute('aria-selected');
}

function isOpen(): boolean {
  return document.querySelector('.bp6-popover-open') !== null;
}

function buttonNamed(text: string): Element | undefined {
  return [...document.querySelectorAll('button')].find(
    (entry) => entry.textContent === text,
  );
}

test('the menu draws every scale under the heading of its kind, the one in force selected', () => {
  open({ start: 'plasma' });
  const headings = [...document.querySelectorAll('.bp6-menu-header')].map(
    (heading) => heading.textContent,
  );

  expect(headings).toStrictEqual([
    'Low to high',
    'Away from a middle',
    'Around the wheel',
  ]);
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(10);
  expect(selected('Plasma')).toBe('true');
  expect(selected('Magma')).toBe('false');
});

test('a strip picked is the scale handed up, and its name goes on the button', () => {
  open({ start: 'viridis' });
  click(item('Magma'));

  expect(changes).toStrictEqual(['magma']);
  expect(
    document.querySelector('button[aria-label="Colour scale"]')?.textContent,
  ).toBe('Magma');
});

test('one colour is chosen from its row, and its swatch picks which', () => {
  open({ start: 'viridis', allowUniform: true });
  click(item('One colour'));

  expect(changes).toStrictEqual(['uniform']);

  click(document.querySelector('button[aria-label="Colour scale"]'));
  const swatch = document.querySelector(
    'input[aria-label="Pick the one colour"]',
  ) as HTMLInputElement;
  // A controlled field only hears a value set past React's own setter.
  const prototype = Object.getPrototypeOf(swatch) as object;
  const setValue = Object.getOwnPropertyDescriptor(
    prototype,
    'value',
  )?.set?.bind(swatch);
  act(() => {
    setValue?.('#123456');
    swatch.dispatchEvent(new Event('input', { bubbles: true }));
  });

  expect(changes).toStrictEqual(['uniform', 'uniform-123456']);
});

test('a click on the swatch picks a colour rather than choosing the row', () => {
  open({ start: 'viridis', allowUniform: true });
  click(document.querySelector('input[aria-label="Pick the one colour"]'));

  expect(changes).toStrictEqual([]);
  expect(isOpen()).toBe(true);
});

test('the one-colour row picked again keeps the colour it already had', () => {
  open({ start: 'uniform-123456', allowUniform: true });
  click(item('One colour'));

  expect(changes).toStrictEqual(['uniform-123456']);
});

test('Custom opens the editor, and an edit there hands up the scale as text', () => {
  open({ start: 'hsv-long,0-0000ff,1-ff0000' });

  expect(item('Custom')?.textContent).toBe('Custom…in use');

  click(item('Custom'));
  const select = document.querySelector(
    'select[aria-label="Path between two anchors"]',
  ) as HTMLSelectElement;
  act(() => {
    select.value = 'rgb';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  expect(changes).toStrictEqual(['rgb,0-0000ff,1-ff0000']);
});

test('the editor goes back to the strips, or closes the picker when done', () => {
  open({ start: 'viridis' });
  click(item('Custom'));
  click(buttonNamed('Scales'));

  expect(selected('Viridis')).toBe('true');
  expect(isOpen()).toBe(true);

  click(item('Custom'));
  click(buttonNamed('Done'));

  expect(buttonNamed('Done')).toBeUndefined();
  expect(isOpen()).toBe(false);
});

test('a picker that offers no scale of one’s own has no Custom row', () => {
  open({ start: 'viridis', allowCustom: false });

  expect(item('Custom')).toBeUndefined();
  expect(selected('Viridis')).toBe('true');
});
