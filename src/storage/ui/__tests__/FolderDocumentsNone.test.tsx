// @vitest-environment jsdom
/**
 * Before any folder was chosen, the folder section still says where documents
 * can go on this computer, and offers to choose the folder — or, in a browser
 * that keeps none, says which browsers do.
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

function noFolder(): SiteFolder {
  return {
    current: () => Promise.resolve(undefined),
    choose: vi.fn(() => Promise.resolve(null)),
    path: () => [],
    subscribe: () => stopNothing,
  } as unknown as SiteFolder;
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
  });
}

test('with no folder chosen, the section offers to choose one', async () => {
  vi.stubGlobal('showDirectoryPicker', vi.fn());
  const folder = noFolder();
  await show(folder);

  expect(host.querySelector('h3')?.textContent).toBe('On this computer');
  expect(host.querySelector('.folder-panel__none > div')?.textContent).toBe(
    "No folder chosen yet. Choose one to keep this site's documents as files on this computer, where you can find, copy and back them up.",
  );

  const button = host.querySelector<HTMLButtonElement>(
    '.folder-panel__none button',
  );

  expect(button?.textContent).toBe('Choose a folder…');

  await act(async () => {
    button?.click();
  });

  expect(folder.choose).toHaveBeenCalledOnce();
});

test('a browser that keeps no folder says which browsers do', async () => {
  await show(noFolder());

  expect(host.querySelector('h3')?.textContent).toBe('On this computer');
  expect(host.querySelector('.folder-panel__none')).toBeNull();
  expect(host.textContent).toBe(
    'On this computerChrome and Edge can save in a folder of this computer.',
  );
});
