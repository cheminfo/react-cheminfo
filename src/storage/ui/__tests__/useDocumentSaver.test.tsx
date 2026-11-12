// @vitest-environment jsdom
/**
 * The first Ctrl+S opens the choice of where documents are kept, before
 * anything is downloaded or picked; Firefox and Safari are told which browsers
 * also write files; the answer saves at once and is remembered.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { downloadBlob } from '../../../download/core/downloadBlob.ts';
import { createDocumentSaver } from '../../core/createDocumentSaver.ts';
import type {
  SavedDocument,
  SavedDocuments,
} from '../../core/createSavedDocuments.ts';
import type { Cell, DocumentFile } from '../../core/documentFile.ts';
import type { DocumentSaver } from '../../core/documentSaverTypes.ts';
import { useDocumentSaver } from '../useDocumentSaver.tsx';

vi.mock('../../../download/core/downloadBlob.ts', () => ({
  downloadBlob: vi.fn(),
}));

let host: HTMLDivElement;
let root: Root;
const said: string[] = [];

function stopNothing(): void {
  // Nothing was subscribed to.
}

function makeSaver(inBrowser = false): DocumentSaver<string> {
  const holder: Cell<DocumentFile<string> | null> = {
    value: null,
    peek: () => holder.value,
  };
  const rows: Array<SavedDocument<string>> = [];
  const savedDocuments: SavedDocuments<string> = {
    isAvailable: () => Promise.resolve(true),
    list: () => Promise.resolve([...rows]),
    named: () => Promise.resolve(undefined),
    save: (name, data) => {
      const row = { id: name, name, savedAt: 1, data };
      rows.push(row);
      return Promise.resolve(row);
    },
    update: () => Promise.resolve(undefined),
    rename: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    subscribe: () => stopNothing,
  };
  return createDocumentSaver<string>({
    ...(inBrowser ? { savedDocuments } : {}),
    site: 'test',
    formats: [
      {
        id: 'document',
        label: 'Document',
        extension: '.write.html',
        picker: { description: 'Document', accept: { 'text/html': ['.html'] } },
        write: (text) => `<p>${text}</p>`,
      },
    ],
    document: () => 'Aspirin',
    stem: () => 'report',
    file: holder,
  });
}

function Page(props: { saver: DocumentSaver<string> }): ReactElement {
  const { dialog } = useDocumentSaver(props.saver, {
    notify: (text) => {
      said.push(text);
    },
  });
  return dialog;
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  said.length = 0;
  vi.mocked(downloadBlob).mockClear();
  const entries = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
  });
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

async function pressSave(): Promise<void> {
  await act(async () => {
    globalThis.dispatchEvent(
      new KeyboardEvent('keydown', { key: 's', ctrlKey: true }),
    );
    await Promise.resolve();
  });
}

function places(): string[] {
  return [
    ...document.querySelectorAll('.save-document-dialog input[type="radio"]'),
  ]
    .map((radio) => radio.closest('label')?.textContent ?? '')
    .filter((label) => label.startsWith('In') || label.startsWith('Download'));
}

test('in Firefox, the first save asks first and names the browsers that write files', async () => {
  act(() => {
    root.render(<Page saver={makeSaver(true)} />);
  });

  await pressSave();

  expect(downloadBlob).not.toHaveBeenCalled();
  expect(
    document.querySelector('.bp6-dialog-header .bp6-heading')?.textContent,
  ).toBe('Where should Save keep your documents?');
  expect(places()).toStrictEqual([
    "In this browserOnly here: clearing this site's data loses it.",
    'Download a copy each timeEvery Save adds a new file to your downloads.',
  ]);
  expect(
    document.querySelector('.save-document-dialog__note')?.textContent,
  ).toBe(
    'Chrome and Edge can also keep it in a file or a folder of this computer: every Save then writes over it, with no copies to sort in your downloads.',
  );
});

test('the answer saves at once, and the next save asks nothing', async () => {
  act(() => {
    root.render(<Page saver={makeSaver()} />);
  });
  await pressSave();

  await act(async () => {
    document.querySelector('form')?.requestSubmit();
    await Promise.resolve();
  });

  expect(
    vi.mocked(downloadBlob).mock.calls.map((call) => call[1]),
  ).toStrictEqual(['report.write.html']);
  expect(said).toStrictEqual(['Downloaded report.write.html.']);

  await pressSave();

  expect(downloadBlob).toHaveBeenCalledTimes(2);
  expect(said).toStrictEqual([
    'Downloaded report.write.html.',
    'Downloaded report.write.html.',
  ]);
});

test('in Chrome, a file and a folder are offered and no browser is recommended', async () => {
  vi.stubGlobal('showSaveFilePicker', vi.fn());
  vi.stubGlobal('showDirectoryPicker', vi.fn());
  act(() => {
    root.render(<Page saver={makeSaver()} />);
  });

  await pressSave();

  expect(places()).toStrictEqual([
    'In a file on this computerYou pick the file once; every Save writes over it.',
    'In a folderYou pick the folder once; every document of this site is saved there.',
    'Download a copy each timeEvery Save adds a new file to your downloads.',
  ]);
  expect(document.querySelector('.save-document-dialog__note')).toBeNull();
});
