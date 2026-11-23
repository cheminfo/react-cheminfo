// @vitest-environment jsdom
/**
 * The two items saving the document on screen under a name: on this computer
 * first, then in this browser, each with its place's icon; the computer is
 * greyed out where the browser keeps no folder, and this browser is offered
 * only when the site keeps documents there.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { Toolbar } from 'react-science/ui';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { SavedDocuments } from '../../core/createSavedDocuments.ts';
import type { DocumentSaver } from '../../core/documentSaverTypes.ts';
import type { SiteFolder } from '../../core/siteFolderTypes.ts';
import { SaveToolbarItems } from '../SaveToolbarItems.tsx';

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

function stopNothing(): void {
  // Nothing was subscribed to.
}

function fakeSaver(keepsInBrowser: boolean): DocumentSaver<string> {
  const folder = {
    current: () => Promise.resolve(undefined),
    path: () => [],
    subscribe: () => stopNothing,
  } as unknown as SiteFolder;
  return {
    folder,
    suggestion: () => ({ name: 'Notes' }),
    takenNames: () => Promise.resolve(new Map()),
    ...(keepsInBrowser ? { savedDocuments: {} as SavedDocuments<string> } : {}),
  } as unknown as DocumentSaver<string>;
}

async function render(saver: DocumentSaver<string>): Promise<void> {
  await act(async () => {
    root.render(
      <Toolbar>
        <SaveToolbarItems saver={saver} notify={vi.fn()} />
      </Toolbar>,
    );
  });
}

function labels(): Array<string | null> {
  return [...host.querySelectorAll('[aria-label]')].map((element) =>
    element.getAttribute('aria-label'),
  );
}

test('the computer comes first, then this browser', async () => {
  vi.stubGlobal('showDirectoryPicker', vi.fn());
  await render(fakeSaver(true));

  expect(labels()).toStrictEqual([
    'Save in a folder of this computer…',
    'Save in this browser…',
  ]);
});

test('without folders the computer says which browsers keep them', async () => {
  await render(fakeSaver(false));

  expect(labels()).toStrictEqual([
    'Chrome and Edge can save in a folder of this computer.',
  ]);
});

test('this browser asks the name of the document on screen', async () => {
  await render(fakeSaver(true));
  const item = host.querySelector<HTMLElement>(
    '[aria-label="Save in this browser…"]',
  );

  await act(async () => {
    item?.click();
    await Promise.resolve();
  });

  expect(
    document.querySelector<HTMLInputElement>('.folder-panel__field input')
      ?.value,
  ).toBe('Notes');
  expect(
    document.querySelector('.bp6-dialog-header .bp6-heading')?.textContent,
  ).toBe('Save in this browser');
});
