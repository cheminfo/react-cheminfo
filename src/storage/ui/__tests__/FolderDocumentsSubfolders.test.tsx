// @vitest-environment jsdom
/**
 * The folder section names the folder open as a breadcrumb, lists the folders
 * inside before the files, opens one on a click, and makes a new one.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { SiteFolder } from '../../core/siteFolderTypes.ts';
import { FolderDocumentsSection } from '../FolderDocumentsSection.tsx';

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

function stopNothing(): void {
  // Nothing was subscribed to.
}

function folderOf(path: string[]): SiteFolder {
  return {
    current: () =>
      Promise.resolve({ name: 'Course' } as FileSystemDirectoryHandle),
    writable: vi.fn(),
    choose: vi.fn(),
    readable: () => Promise.resolve(true),
    allow: vi.fn(),
    list: () =>
      Promise.resolve([
        {
          name: 'Nernst.tex.svg',
          handle: {} as FileSystemFileHandle,
          modified: Date.now(),
        },
      ]),
    search: () => Promise.resolve([]),
    folders: () => Promise.resolve(['Lab', 'Week 2']),
    path: () => path,
    open: vi.fn(),
    createFolder: vi.fn(() => Promise.resolve()),
    forget: vi.fn(),
    changed: vi.fn(),
    subscribe: () => stopNothing,
  };
}

async function show(folder: SiteFolder): Promise<void> {
  await act(async () => {
    root.render(
      <FolderDocumentsSection
        folder={folder}
        extensions={['.tex.svg']}
        onOpen={vi.fn()}
      />,
    );
    await Promise.resolve();
    await Promise.resolve();
  });
}

test('the breadcrumb leads back up, and the folders inside come before the files', async () => {
  const folder = folderOf(['Week 2']);
  await show(folder);

  expect(host.querySelector('h3')?.textContent).toBe('Course › Week 2');
  expect(
    [...host.querySelectorAll('.folder-panel__name')].map(
      (name) => name.textContent,
    ),
  ).toStrictEqual(['Lab', 'Week 2', 'Nernst.tex.svg']);

  act(() => {
    host.querySelector<HTMLButtonElement>('.folder-panel__crumb-link')?.click();
    host
      .querySelector<HTMLButtonElement>('.folder-panel__open--folder')
      ?.click();
  });

  expect(vi.mocked(folder.open).mock.calls).toStrictEqual([
    [[]],
    [['Week 2', 'Lab']],
  ]);
});
