// @vitest-environment jsdom
/**
 * `BackupMenu` hands a restore's sentence to a site that says it in a place of
 * its own, through the hook it is drawn on.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { BackupMenu } from '../BackupMenu.tsx';

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
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

test('the menu forwards the sentence once, and opens no alert', async () => {
  const onRestored = vi.fn();
  act(() => {
    root.render(
      <BackupMenu
        onBackup={() => Promise.resolve()}
        onRestore={() => Promise.resolve('Restored 2 documents.')}
        onRestored={onRestored}
        accept=".zip"
      />,
    );
  });
  const input = host.querySelector<HTMLInputElement>('input[type="file"]');
  const file = new File(['PK'], 'backup.zip');
  Object.defineProperty(input, 'files', { value: [file], configurable: true });

  await act(async () => {
    input?.dispatchEvent(new Event('change', { bubbles: true }));
    await Promise.resolve();
  });

  expect(onRestored.mock.calls).toStrictEqual([['Restored 2 documents.']]);
  expect(document.body.querySelector('.bp6-alert')).toBeNull();
});
