// @vitest-environment jsdom
/**
 * The decimals the masses are written with, picked in the Peaks panel.
 *
 * Mounted rather than rendered to a string, because the peak table draws only
 * the rows it has room for and a string has no room at all.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { installProbeStubs } from '../../../chart/ui/__tests__/zoomProbe.tsx';
import { massFixture } from '../../core/__tests__/massFixtures.ts';
import { MassEditor } from '../MassEditor.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  installProbeStubs();
  Element.prototype.scrollIntoView = () => undefined;
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  // jsdom lays nothing out, so the boxes the chart and the table measure are
  // given a size.
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
    new DOMRect(0, 0, 600, 400),
  );
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(400);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

test('a number of decimals picked rewrites the masses of the peak table', async () => {
  const data = await massFixture('taxine-b-ms2.jdx');
  act(() => root.render(<MassEditor data={data} />));

  expect(firstMasses()).toStrictEqual(['71.4512', '79.0544', '80.5207']);

  const button = host.querySelector('[aria-label="Decimals of the masses"]');
  act(() => (button as HTMLElement).click());
  const entries = [...document.querySelectorAll('[role="option"]')];

  // The automatic entry says what it comes to before anybody picks it.
  expect(entries.map((entry) => entry.textContent)).toStrictEqual([
    'Automatic — by resolution (now 4 decimals)',
    'Nominal mass (0 decimals)',
    '1 decimal',
    '2 decimals',
    '3 decimals',
    '4 decimals',
    '5 decimals',
  ]);

  // Blueprint puts the option role on the item and the handler on its link.
  act(() => entries[3]?.querySelector('a')?.click());

  expect(firstMasses()).toStrictEqual(['71.45', '79.05', '80.52']);
});

/**
 * The first three masses the peak table lists.
 * @returns Them, as written.
 */
function firstMasses(): Array<string | null> {
  const cells = host.querySelectorAll('tbody tr td:first-child');
  return [...cells].slice(0, 3).map((cell) => cell.textContent);
}

class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing was observed.
  }
}
