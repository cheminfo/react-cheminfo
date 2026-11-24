// @vitest-environment jsdom
/**
 * Saving in the site's folder under a name: the item and the dialog name the
 * folder as one of this computer, the name offered is one a file can take,
 * and a folder no longer on the disk is said to be gone.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { Toolbar } from 'react-science/ui';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type {
  DocumentSaver,
  SaveChoice,
  SaveOutcome,
} from '../../core/documentSaverTypes.ts';
import type { SiteFolder } from '../../core/siteFolderTypes.ts';
import { SaveToolbarItems } from '../SaveToolbarItems.tsx';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('showDirectoryPicker', vi.fn());
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

function stopNothing(): void {
  // Nothing was subscribed to.
}

function fakeSaver(outcome: SaveOutcome) {
  const saveTo = vi.fn<(choice: SaveChoice) => Promise<SaveOutcome>>(() =>
    Promise.resolve(outcome),
  );
  const folder = {
    current: () => Promise.resolve({ name: 'export' }),
    path: () => [],
    subscribe: () => stopNothing,
  } as unknown as SiteFolder;
  const saver = {
    folder,
    suggestion: () => ({ name: 'Caffeine, 16 Nov 2026, 07:01' }),
    takenNames: () => Promise.resolve(new Map()),
    saveTo,
  } as unknown as DocumentSaver<string>;
  return { saver, saveTo };
}

async function openDialog(saver: DocumentSaver<string>): Promise<void> {
  await act(async () => {
    root.render(
      <Toolbar>
        <SaveToolbarItems saver={saver} notify={vi.fn()} places={['folder']} />
      </Toolbar>,
    );
  });
  const item = host.querySelector<HTMLElement>('[aria-label]');
  await act(async () => {
    item?.click();
    await nextTask();
  });
}

async function submit(): Promise<void> {
  await act(async () => {
    document.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await nextTask();
  });
}

test('the folder is named as one of this computer, and offered a name a file takes', async () => {
  const { saver, saveTo } = fakeSaver({
    kind: 'saved',
    target: 'folder',
    name: 'Caffeine, 16 Nov 2026, 0701.write.html',
  });
  await openDialog(saver);

  expect(host.querySelector('[aria-label]')?.getAttribute('aria-label')).toBe(
    'Save in the folder “export” of this computer…',
  );
  expect(
    document.querySelector('.bp6-dialog-header .bp6-heading')?.textContent,
  ).toBe('Save in the folder “export” of this computer');
  expect(
    document.querySelector<HTMLInputElement>('.folder-panel__field input')
      ?.value,
  ).toBe('Caffeine, 16 Nov 2026, 0701');

  await submit();

  expect(saveTo.mock.calls[0]?.[0]).toStrictEqual({
    name: 'Caffeine, 16 Nov 2026, 0701',
    target: 'folder',
    replace: false,
  });
});

test('a folder no longer on the disk is said to be gone, in the dialog', async () => {
  const { saver } = fakeSaver({
    kind: 'failed',
    name: 'Caffeine.write.html',
    message: 'A requested file or directory could not be found.',
    missingFolder: 'export',
  });
  await openDialog(saver);

  await submit();

  expect(document.querySelector('.folder-panel__problem')?.textContent).toBe(
    'The folder “export” is no longer on this computer: it was moved, renamed or deleted, so nothing was written. Choose it again, or another folder.',
  );
});

function nextTask(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}
