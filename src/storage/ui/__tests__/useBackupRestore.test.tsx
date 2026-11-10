// @vitest-environment jsdom
/**
 * Backing up and restoring what a site stores: the file chooser, what the
 * reader is told afterwards, and a failure said in a sentence rather than lost.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type {
  BackupRestore,
  BackupRestoreOptions,
} from '../useBackupRestore.tsx';
import { useBackupRestore } from '../useBackupRestore.tsx';

let host: HTMLDivElement;
let root: Root;
const seen: BackupRestore[] = [];

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
  seen.length = 0;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function Site(props: BackupRestoreOptions): ReactElement {
  const backupRestore = useBackupRestore(props);
  seen.push(backupRestore);
  return backupRestore.dialogs;
}

function render(options: Partial<BackupRestoreOptions>): void {
  act(() => {
    root.render(
      <Site
        onBackup={() => Promise.resolve()}
        onRestore={() => Promise.resolve('Restored 3 drawings.')}
        accept=".json"
        {...options}
      />,
    );
  });
}

function current(): BackupRestore {
  const actions = seen.at(-1);
  if (actions === undefined) throw new Error('nothing rendered');
  return actions;
}

function chooser(): HTMLInputElement {
  const input = host.querySelector<HTMLInputElement>('input[type="file"]');
  if (input === null) throw new Error('no file chooser');
  return input;
}

async function pick(files: File[]): Promise<void> {
  const input = chooser();
  Object.defineProperty(input, 'files', { value: files, configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await Promise.resolve();
  });
}

function alertText(): string | null {
  return (
    document.body.querySelector('.bp6-alert-contents')?.textContent ?? null
  );
}

function alertIcon(): string | null {
  return (
    document.body.querySelector<HTMLElement>('.bp6-alert [data-icon]')?.dataset
      .icon ?? null
  );
}

test('a backup is busy while it runs, and says nothing when it worked', async () => {
  let finish: (() => void) | undefined;
  const onBackup = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render({ onBackup });

  expect(current().busy).toBe(false);

  act(() => {
    current().backup();
  });

  expect(onBackup).toHaveBeenCalledOnce();
  expect(current().busy).toBe(true);

  await act(async () => {
    finish?.();
    await Promise.resolve();
  });

  expect(current().busy).toBe(false);
  expect(alertText()).toBeNull();
});

test('a backup that fails says why in an alert of its own', async () => {
  render({ onBackup: () => Promise.reject(new Error('The disk is full.')) });

  await act(async () => {
    current().backup();
    await Promise.resolve();
  });

  expect(alertText()).toBe('The backup failed. The disk is full.');
  expect(current().busy).toBe(false);
});

test('a site that shows failures itself is handed the sentence', async () => {
  const onError = vi.fn();
  render({
    onBackup: () => Promise.reject(new Error('The disk is full.')),
    onError,
  });

  await act(async () => {
    current().backup();
    await Promise.resolve();
  });

  expect(onError.mock.calls).toStrictEqual([
    ['The backup failed. The disk is full.'],
  ]);
  expect(alertText()).toBeNull();
});

test('a restore opens the chooser, reads the file, and says what it restored', async () => {
  const onRestore = vi.fn(() => Promise.resolve('Restored 3 drawings.'));
  render({ onRestore });
  const click = vi.spyOn(chooser(), 'click').mockImplementation(() => {
    // jsdom opens no chooser.
  });

  expect(chooser().accept).toBe('.json');

  act(() => {
    current().restore();
  });

  expect(click).toHaveBeenCalledOnce();

  const file = new File(['{}'], 'backup.json', { type: 'application/json' });
  await pick([file]);

  expect(onRestore.mock.calls).toStrictEqual([[file]]);
  expect(alertText()).toBe('Restored 3 drawings.');
  expect(alertIcon()).toBe('import');

  act(() => {
    [...document.body.querySelectorAll('button')]
      .find((button) => button.textContent === 'Close')
      ?.click();
  });

  expect(document.body.querySelector('.bp6-overlay-open')).toBeNull();
});

test('a chooser closed with no file restores nothing', async () => {
  const onRestore = vi.fn(() => Promise.resolve('Restored.'));
  render({ onRestore });

  await pick([]);

  expect(onRestore).not.toHaveBeenCalled();
  expect(alertText()).toBeNull();
});

test('a backup refused whole says why', async () => {
  render({
    onRestore: () =>
      Promise.reject(new Error('This file is not a backup of this site.')),
  });

  await pick([new File(['x'], 'notes.txt')]);

  expect(alertText()).toBe(
    'The restore failed. This file is not a backup of this site.',
  );
  expect(alertIcon()).toBe('error');
});
