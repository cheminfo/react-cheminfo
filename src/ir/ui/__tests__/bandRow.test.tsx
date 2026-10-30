// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { assignBands } from '../../core/assignBands.ts';
import type { IrBand } from '../../core/irBand.ts';
import { BandRow } from '../BandRow.tsx';

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

/**
 * Draws the row of one band, inside the table it belongs to.
 * @param wavenumber - Where the band sits.
 */
function render(wavenumber: number): void {
  const band: IrBand = {
    spectrumId: 'film',
    wavenumber,
    absorbance: 0.2,
    transmittance: 61,
    strength: 'm',
  };
  const [entry] = assignBands([band]);
  act(() => {
    root.render(
      <table>
        <tbody>
          <BandRow
            entry={entry as never}
            mode="transmittance"
            assignments
            lit={false}
          />
        </tbody>
      </table>,
    );
  });
}

/**
 * The cell holding the candidates.
 * @returns The cell.
 */
function candidatesCell(): HTMLTableCellElement {
  return host.querySelectorAll('td')[3] as HTMLTableCellElement;
}

/**
 * What the candidates cell reads, with the gap the icon leaves closed up.
 * @returns The text.
 */
function candidatesText(): string {
  return (candidatesCell().textContent ?? '').replaceAll(/\s+/g, ' ');
}

test('a band opens onto every candidate, each with its note', () => {
  render(1604);
  const more = host.querySelector('button') as HTMLButtonElement;

  expect(candidatesText()).toBe('amine, amide N–H bend 1 more');
  expect(more.getAttribute('aria-expanded')).toBe('false');

  act(() => {
    more.click();
  });

  expect(more.getAttribute('aria-expanded')).toBe('true');
  expect(
    [...candidatesCell().querySelectorAll('li')].map(
      (item) => item.textContent,
    ),
  ).toStrictEqual([
    'amine, amide N–H bendOnly beside an N–H stretch between 3300 and 3500',
    'arene C=C aromatic stretchUsually a pair, near 1500 and 1600',
  ]);

  act(() => {
    more.click();
  });

  expect(candidatesText()).toBe('amine, amide N–H bend 1 more');
});

test('a band with one candidate has nothing to open', () => {
  render(1955);

  expect(candidatesText()).toBe('allene C=C=C asymmetric stretch');
  expect(host.querySelector('button')).toBeNull();
});
