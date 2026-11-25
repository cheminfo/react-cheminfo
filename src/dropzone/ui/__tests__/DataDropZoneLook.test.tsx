// @vitest-environment jsdom
/**
 * How a page waiting for data looks: the zone's glyph, heading and sentence
 * set in Blueprint's empty state, which the family's stylesheet colours.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { DataDropZone } from '../DataDropZone.tsx';

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

function render(description: string): void {
  act(() => {
    root.render(
      <DataDropZone
        title="Drop a spectrum"
        description={description}
        onFiles={vi.fn()}
        onText={vi.fn()}
      />,
    );
  });
}

test('the zone sets its glyph, heading and sentence in Blueprint’s empty state, which the family colours', () => {
  render('A JCAMP-DX file, or a table of x and y.');
  const state = host.querySelector('.data-drop-zone > .bp6-non-ideal-state');

  expect([
    state?.firstElementChild?.classList.contains('bp6-non-ideal-state-visual'),
    state?.querySelector('h4.bp6-heading')?.textContent,
    state?.querySelector('h4.bp6-heading + div')?.textContent,
  ]).toStrictEqual([
    true,
    'Drop a spectrum',
    'A JCAMP-DX file, or a table of x and y.',
  ]);
});
