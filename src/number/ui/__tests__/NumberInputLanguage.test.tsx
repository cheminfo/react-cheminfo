// @vitest-environment jsdom
/**
 * A number box writes the decimal separator of the page's language, and reads
 * a comma or a point whatever the language.
 */

import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { NumberInput } from '../NumberInput.tsx';

let host: HTMLDivElement;
let root: Root;
const committed = vi.fn<(value: number) => void>();

beforeAll(async () => {
  await CHROME_CATALOG.load('fr');
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  committed.mockClear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

function Harness(props: { initial: number }) {
  const [value, setValue] = useState(props.initial);
  return (
    <NumberInput
      value={value}
      step={1}
      ariaLabel="Concentration"
      onChange={(next) => {
        committed(next);
        setValue(next);
      }}
    />
  );
}

function render(language: string, initial = 0.25): HTMLInputElement {
  act(() =>
    root.render(
      <SiteLanguage value={language}>
        <Harness initial={initial} />
      </SiteLanguage>,
    ),
  );
  const input = host.querySelector('input');
  if (input === null) throw new Error('the box was not rendered');
  return input;
}

function type(input: HTMLInputElement, text: string) {
  act(() => {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set?.bind(input);
    setValue?.(text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

test('a French box shows a decimal comma and reads one typed', () => {
  const input = render('fr');

  expect(input.value).toBe('0,25');

  type(input, '1,5');

  expect(committed).toHaveBeenLastCalledWith(1.5);

  act(() => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
  });

  expect(committed).toHaveBeenLastCalledWith(2.5);
  expect(input.value).toBe('2,5');
});

test('a point typed on a French page is read too', () => {
  const input = render('fr');

  type(input, '0.75');

  expect(committed).toHaveBeenLastCalledWith(0.75);
  expect(input.value).toBe('0.75');
});

test('a number shown as given follows the language, and text being typed stays', () => {
  const input = render('en');

  expect(input.value).toBe('0.25');

  render('fr');

  expect(input.value).toBe('0,25');

  type(input, '0.');
  render('en');

  expect(input.value).toBe('0.');
  expect(committed).toHaveBeenLastCalledWith(0);
});
