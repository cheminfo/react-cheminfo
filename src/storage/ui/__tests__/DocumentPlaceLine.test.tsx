// @vitest-environment jsdom
/**
 * The line saying where the document on screen is: not saved, in this browser
 * only, or on this computer and in which folder — and what it offers, where
 * the browser keeps folders, to get it onto this computer.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DocumentFile } from '../../core/documentFile.ts';
import type { DocumentSaver } from '../../core/documentSaverTypes.ts';
import type { SiteFolder } from '../../core/siteFolderTypes.ts';
import { DocumentPlaceLine } from '../DocumentPlaceLine.tsx';

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

const NOTES = { kind: 'file', name: 'notes.write.html' };

/** What subscribing hands back: nothing to stop in a folder that never changes. */
function stopListening(): void {
  // Nothing is listened to.
}

function fakeSaver(moveToFolder = vi.fn()): DocumentSaver<string> {
  const root = {
    kind: 'directory',
    name: 'Course',
    resolve: (handle: unknown) =>
      Promise.resolve(handle === NOTES ? ['Week 3', 'notes.write.html'] : null),
  };
  const folder = {
    current: () => Promise.resolve(root),
    path: () => [],
    subscribe: () => stopListening,
  } as unknown as SiteFolder;
  return { folder, moveToFolder } as unknown as DocumentSaver<string>;
}

async function show(
  file: DocumentFile<string> | null,
  live: string,
  saver = fakeSaver(),
): Promise<HTMLElement> {
  await act(async () => {
    root.render(
      <DocumentPlaceLine
        saver={saver}
        file={file}
        live={live}
        untitled="Orbitals"
        notify={vi.fn()}
      />,
    );
  });
  const line = host.querySelector<HTMLElement>('.document-place');
  if (!line) throw new Error('no line');
  return line;
}

test('a document saved nowhere says so, and that it is a draft', async () => {
  const line = await show(null, 'text');

  expect(line.dataset.place).toBe('draft');
  expect(line.classList.contains('document-place--nowhere')).toBe(true);
  expect(line.textContent).toBe('OrbitalsNot saved · a draft in this browser');
  expect(line.title).toBe(
    'Saved nowhere yet. This browser keeps it as a draft, so it comes back after a reload, but only here: save it to keep it.',
  );
});

test('a file of the folder names the folders it is in', async () => {
  const handle = NOTES as unknown as FileSystemFileHandle;
  const saved = 'text';
  const line = await show({ name: 'x', handle, saved }, saved);

  expect(line.dataset.place).toBe('folder');
  expect(line.classList.contains('document-place--computer')).toBe(true);
  expect(line.textContent).toBe(
    'notes.write.htmlOn this computer · Course › Week 3',
  );
});

test('a change since the save is said beside the place', async () => {
  const line = await show(
    { name: 'Notes', savedId: 'n', saved: 'before' },
    'after',
  );

  expect(line.textContent).toBe('NotesIn this browser onlyUnsaved changes');
  expect(line.title).toBe(
    "Saved in this browser only, as Notes. Another browser or computer cannot open it, and clearing this site's data deletes it. It changed since it was saved.",
  );
});

test('a browser document moves to this computer where folders are kept', async () => {
  vi.stubGlobal('showDirectoryPicker', vi.fn());
  const move = vi.fn(() => Promise.resolve({ kind: 'cancelled' }));
  const line = await show(
    { name: 'Notes', savedId: 'n', saved: 'text' },
    'text',
    fakeSaver(move),
  );
  const button = line.querySelector('button');

  expect(button?.textContent).toBe('Move to this computer…');

  await act(async () => {
    button?.click();
  });

  expect(move).toHaveBeenCalledWith(['n']);
});

test('nothing is offered where the browser keeps no folder', async () => {
  const line = await show({ name: 'Notes', savedId: 'n', saved: 't' }, 't');

  expect(line.querySelector('button')).toBeNull();
});
