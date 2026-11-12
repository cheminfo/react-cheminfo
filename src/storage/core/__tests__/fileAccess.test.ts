/**
 * Files read and written in place through the File System Access API, which
 * only some browsers offer: a picker that is missing, cancelled or refused
 * each says so differently, and a write asks for its permission first.
 */

import { afterEach, expect, test, vi } from 'vitest';

import type { PickerType } from '../fileAccess.ts';
import {
  chooseFolder,
  chooseOpenFile,
  chooseSaveFile,
  freeFileName,
  writeFile,
} from '../fileAccess.ts';

const TYPE: PickerType = {
  description: 'Drawing',
  accept: { 'image/svg+xml': ['.svg'] },
};

const abort = () =>
  new DOMException('The user aborted a request.', 'AbortError');
const refusal = () =>
  new DOMException('Not allowed in a frame.', 'SecurityError');

afterEach(() => {
  vi.unstubAllGlobals();
});

test('without a picker, a save says the browser cannot, not that it was cancelled', async () => {
  vi.stubGlobal('showSaveFilePicker', undefined);

  await expect(chooseSaveFile('figure.svg', TYPE)).resolves.toBeUndefined();
});

test('a save picker opens on the suggested name, in the folder both pickers share', async () => {
  const handle = { name: 'figure.svg' };
  const picker = vi.fn(() => Promise.resolve(handle));
  vi.stubGlobal('showSaveFilePicker', picker);

  await expect(chooseSaveFile('figure.svg', TYPE)).resolves.toBe(handle);
  expect(picker.mock.calls).toStrictEqual([
    [{ id: 'draw', suggestedName: 'figure.svg', types: [TYPE] }],
  ]);
});

test('a save cancelled is null, and a save refused is undefined', async () => {
  vi.stubGlobal('showSaveFilePicker', () => Promise.reject(abort()));

  await expect(chooseSaveFile('a.svg', TYPE)).resolves.toBeNull();

  vi.stubGlobal('showSaveFilePicker', () => Promise.reject(refusal()));

  await expect(chooseSaveFile('a.svg', TYPE)).resolves.toBeUndefined();
});

test('an open picker gives the first file picked, or null for none', async () => {
  const handle = { name: 'figure.svg' };
  const picker = vi.fn(() => Promise.resolve([handle]));
  vi.stubGlobal('showOpenFilePicker', picker);

  await expect(chooseOpenFile(TYPE)).resolves.toBe(handle);
  expect(picker.mock.calls).toStrictEqual([[{ id: 'draw', types: [TYPE] }]]);

  vi.stubGlobal('showOpenFilePicker', () => Promise.resolve([]));

  await expect(chooseOpenFile(TYPE)).resolves.toBeNull();
});

test('an open cancelled is null, refused or missing is undefined', async () => {
  vi.stubGlobal('showOpenFilePicker', () => Promise.reject(abort()));

  await expect(chooseOpenFile(TYPE)).resolves.toBeNull();

  vi.stubGlobal('showOpenFilePicker', () => Promise.reject(new TypeError('x')));

  await expect(chooseOpenFile(TYPE)).resolves.toBeUndefined();

  vi.stubGlobal('showOpenFilePicker', undefined);

  await expect(chooseOpenFile(TYPE)).resolves.toBeUndefined();
});

// A file handle that records what happens to it, in order.
function recordingHandle(options: {
  permission?: string;
  failWrite?: boolean;
  failAbort?: boolean;
}) {
  const steps: string[] = [];
  const stream = {
    write: (content: string) => {
      steps.push(`write ${content}`);
      return options.failWrite
        ? Promise.reject(new Error('disk full'))
        : Promise.resolve();
    },
    close: () => {
      steps.push('close');
      return Promise.resolve();
    },
    abort: () => {
      steps.push('abort');
      return options.failAbort
        ? Promise.reject(new Error('gone'))
        : Promise.resolve();
    },
  };
  const handle = {
    createWritable: () => {
      steps.push('open');
      return Promise.resolve(stream);
    },
    ...(options.permission === undefined
      ? {}
      : {
          queryPermission: () => {
            steps.push('query');
            return Promise.resolve(options.permission);
          },
          requestPermission: () => {
            steps.push('request');
            return Promise.resolve('granted');
          },
        }),
  };
  return { steps, handle: handle as unknown as FileSystemFileHandle };
}

function content(steps: string[]): () => Promise<string> {
  return () => {
    steps.push('content');
    return Promise.resolve('<svg/>');
  };
}

test('a file is opened before its content is made, then written and closed', async () => {
  const { steps, handle } = recordingHandle({});
  await writeFile(handle, content(steps));

  expect(steps).toStrictEqual(['open', 'content', 'write <svg/>', 'close']);
});

test('a handle that lost its permission asks again before writing', async () => {
  const lost = recordingHandle({ permission: 'prompt' });
  await writeFile(lost.handle, content(lost.steps));

  expect(lost.steps).toStrictEqual([
    'query',
    'request',
    'open',
    'content',
    'write <svg/>',
    'close',
  ]);

  const granted = recordingHandle({ permission: 'granted' });
  await writeFile(granted.handle, content(granted.steps));

  expect(granted.steps).toStrictEqual([
    'query',
    'open',
    'content',
    'write <svg/>',
    'close',
  ]);
});

test('a write that fails is aborted and its error passed on', async () => {
  const failing = recordingHandle({ failWrite: true });

  await expect(
    writeFile(failing.handle, content(failing.steps)),
  ).rejects.toThrow('disk full');
  expect(failing.steps).toStrictEqual([
    'open',
    'content',
    'write <svg/>',
    'abort',
  ]);

  const stuck = recordingHandle({ failWrite: true, failAbort: true });

  await expect(writeFile(stuck.handle, content(stuck.steps))).rejects.toThrow(
    'disk full',
  );
  expect(stuck.steps.at(-1)).toBe('abort');
});

test('a folder is asked for read and write, and a cancel is null', async () => {
  const folder = { kind: 'directory', name: 'Notebook' };
  const picker = vi.fn(() => Promise.resolve(folder));
  vi.stubGlobal('showDirectoryPicker', picker);

  await expect(chooseFolder()).resolves.toBe(folder);
  expect(picker.mock.calls).toStrictEqual([
    [{ id: 'draw', mode: 'readwrite' }],
  ]);

  vi.stubGlobal('showDirectoryPicker', () => Promise.reject(abort()));

  await expect(chooseFolder()).resolves.toBeNull();
});

test('a name a folder already holds is numbered as a download would be', async () => {
  const held = new Set(['report.write.html', 'report (2).write.html']);
  const folder = {
    getFileHandle: (name: string) =>
      held.has(name)
        ? Promise.resolve({ name })
        : Promise.reject(new DOMException('absent', 'NotFoundError')),
  } as unknown as FileSystemDirectoryHandle;

  await expect(freeFileName(folder, 'report', '.write.html')).resolves.toBe(
    'report (3).write.html',
  );
  await expect(freeFileName(folder, 'notes', '.write.html')).resolves.toBe(
    'notes.write.html',
  );
});
