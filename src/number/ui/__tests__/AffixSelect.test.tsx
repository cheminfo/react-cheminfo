// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test, vi } from 'vitest';

import { AffixSelect } from '../AffixSelect.tsx';
import { NumberInput } from '../NumberInput.tsx';

test('a unit choice is a select in the box, and the box takes the affix rule', () => {
  const markup = renderToStaticMarkup(
    <NumberInput
      value={4}
      size="small"
      buttons={false}
      rightElement={
        <AffixSelect
          value="nm"
          options={['px', 'nm']}
          ariaLabel="Unit"
          onChange={noop}
        />
      }
      onChange={noop}
    />,
  );

  expect(
    /<div class="(?<classes>bp6-input-group[^"]*)"/u.exec(markup)?.groups
      ?.classes,
  ).toBe('bp6-input-group bp6-small input-affix');
  expect(markup.slice(markup.indexOf('<select'))).toBe(
    '<select class="affix-select" aria-label="Unit"><option value="px">px</option><option value="nm" selected="">nm</option></select></span></div>',
  );
});

test('choosing a unit hands up its value', () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const chosen: string[] = [];
  const host = document.createElement('div');
  document.body.append(host);
  const root = createRoot(host);
  const select = drawn(root, host, (unit) => chosen.push(unit));
  act(() => {
    select.value = 'µm';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  expect(chosen).toStrictEqual(['µm']);

  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function drawn(
  root: Root,
  host: HTMLElement,
  onChange: (unit: string) => void,
): HTMLSelectElement {
  act(() => {
    root.render(
      <AffixSelect
        value="px"
        options={['px', 'nm', 'µm']}
        ariaLabel="Unit"
        onChange={onChange}
      />,
    );
  });
  const select = host.querySelector('select');
  if (select === null) throw new Error('no select was drawn');
  return select;
}

function noop(): void {
  // The markup is all the first test reads.
}
