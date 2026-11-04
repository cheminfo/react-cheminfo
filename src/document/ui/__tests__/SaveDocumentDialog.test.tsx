// @vitest-environment jsdom
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { SaveDocumentChoice } from '../SaveDocumentDialog.tsx';
import { SaveDocumentDialog } from '../SaveDocumentDialog.tsx';

let host: HTMLDivElement;
let root: Root;
const saved: SaveDocumentChoice[] = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  saved.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(
      <SaveDocumentDialog
        isOpen
        onClose={() => undefined}
        onSave={(choice) => {
          saved.push(choice);
        }}
        formats={[
          {
            id: 'document',
            label: 'Drawing',
            extension: '.draw.zip',
            holdsParts: true,
          },
          { id: 'svg', label: 'Picture', extension: '.svg', holdsParts: false },
        ]}
        initial={{
          name: 'benzene',
          format: 'document',
          view: false,
          workspace: true,
        }}
      />,
    );
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

function submit(): void {
  act(() => {
    document.querySelector('form')?.requestSubmit();
  });
}

test('the name sits beside the extension of the format picked', () => {
  expect(document.querySelector('.input-affix input')).toHaveProperty(
    'value',
    'benzene',
  );
  expect(document.querySelector('.bp6-input-action')?.textContent).toBe(
    '.draw.zip',
  );
});

test('a document keeps what was ticked beside its data', () => {
  submit();

  expect(saved).toStrictEqual([
    { name: 'benzene', format: 'document', view: false, workspace: true },
  ]);
});

test('a format that holds no part keeps none', () => {
  const svg = document.querySelector<HTMLInputElement>('input[value="svg"]');
  act(() => {
    svg?.click();
  });

  expect(
    [...document.querySelectorAll<HTMLInputElement>('[type="checkbox"]')].map(
      (box) => box.disabled,
    ),
  ).toStrictEqual([true, true]);

  submit();

  expect(saved).toStrictEqual([
    { name: 'benzene', format: 'svg', view: false, workspace: false },
  ]);
});
