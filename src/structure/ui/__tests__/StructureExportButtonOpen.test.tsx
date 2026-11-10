// @vitest-environment jsdom
/**
 * The export glyph beside a figure: pressed, it opens the export dialog on the
 * structure it was given, and the glyph says whether its dialog is open.
 *
 * Blueprint draws the dialog in a portal on the document's body, so that is
 * where it is looked for.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { StructureExportButton } from '../StructureExportButton.tsx';

let host: HTMLDivElement;
let root: Root;

beforeAll(async () => {
  await import('../StructureExportPanel.tsx');
});

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

function smilesShown(): string | null {
  const row = [
    ...document.querySelectorAll('.structure-export__notation'),
  ].find(
    (candidate) =>
      candidate.querySelector('.copyable-value__label')?.textContent ===
      'SMILES',
  );
  return (
    row?.querySelector('.copyable-value__value')?.firstChild?.textContent ??
    null
  );
}

test('the glyph opens the dialog on its structure, and the dialog closes back to it', async () => {
  await act(async () => {
    root.render(
      <StructureExportButton smiles="OC1CCCCC1" name="cyclohexanol" />,
    );
  });
  const glyph = host.querySelector<HTMLElement>(
    '[data-testid="card-structure"]',
  );

  expect(smilesShown()).toBeNull();

  await act(async () => {
    glyph?.click();
  });

  expect(glyph?.getAttribute('aria-expanded')).toBe('true');
  expect(smilesShown()).toBe('OC1CCCCC1');

  await act(async () => {
    document
      .querySelector<HTMLButtonElement>(
        '.structure-export .bp6-dialog-close-button',
      )
      ?.click();
  });

  expect(glyph?.getAttribute('aria-expanded')).toBe('false');
});
