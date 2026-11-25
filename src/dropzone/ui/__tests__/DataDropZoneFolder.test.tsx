// @vitest-environment jsdom
/**
 * A folder dropped on the zone is walked, and the files inside it are handed
 * over named by their path; a drop holding no folder is handed over at once.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { DataDropZone } from '../DataDropZone.tsx';

import type { EntryStandIn } from './dropEntries.ts';
import {
  fileEntry,
  folderEntry,
  itemsOf,
  unreadableFolder,
} from './dropEntries.ts';

const onFiles = vi.fn<(files: File[]) => void>();

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  onFiles.mockClear();
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(<DataDropZone title="Drop images" onFiles={onFiles} />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function dispatch(type: string, target: Element | null, data: object): void {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { dataTransfer: data });
  act(() => {
    target?.dispatchEvent(event);
  });
}

function drop(files: File[], entries: readonly EntryStandIn[]): void {
  const data = {
    types: ['Files'],
    files,
    getData: () => '',
    dropEffect: 'none',
    items: itemsOf(entries),
  };
  dispatch('dragenter', host.querySelector('.data-drop-zone'), data);
  dispatch(
    'drop',
    host.querySelector('[data-testid="structure-drop-overlay"]'),
    data,
  );
}

test('a dropped folder is walked, and its files handed over', async () => {
  drop([new File([], 'a')], [folderEntry('/a', [[fileEntry('/a/b.tif')]])]);

  await vi.waitFor(() => {
    expect(onFiles).toHaveBeenCalledOnce();
  });

  expect(onFiles.mock.calls[0]?.[0].map((file) => file.name)).toStrictEqual([
    'a/b.tif',
  ]);
});

test('files dropped beside no folder are handed over at once', () => {
  const image = new File(['x'], 'x.png');
  drop([image], [fileEntry('/x.png')]);

  expect(onFiles).toHaveBeenCalledExactlyOnceWith([image]);
});

test('a folder the browser cannot read is handed over as the drop listed it', async () => {
  const folder = new File([], 'a');
  drop([folder], [unreadableFolder('/a')]);

  await vi.waitFor(() => {
    expect(onFiles).toHaveBeenCalledExactlyOnceWith([folder]);
  });
});

test('an item the walk cannot read hands over the drop as listed, and says why once', async () => {
  const onUnread = vi.fn<(reason: Error) => void>();
  act(() => {
    root.render(
      <DataDropZone
        title="Drop images"
        onFiles={onFiles}
        onUnread={onUnread}
      />,
    );
  });
  const folder = new File([], 'a');
  const data = {
    types: ['Files'],
    files: [folder],
    getData: () => '',
    dropEffect: 'none',
    items: [
      ...itemsOf([folderEntry('/a', [[fileEntry('/a/b.tif')]])]),
      { kind: 'file', getAsFile: () => null, webkitGetAsEntry: () => null },
    ],
  };
  dispatch('dragenter', host.querySelector('.data-drop-zone'), data);
  dispatch(
    'drop',
    host.querySelector('[data-testid="structure-drop-overlay"]'),
    data,
  );

  await vi.waitFor(() => {
    expect(onUnread).toHaveBeenCalledOnce();
  });

  expect(onFiles).toHaveBeenCalledExactlyOnceWith([folder]);
  expect(onUnread.mock.calls[0]?.[0]).toBeInstanceOf(Error);
});
