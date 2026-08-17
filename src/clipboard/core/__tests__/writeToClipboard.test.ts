import { afterEach, expect, test, vi } from 'vitest';

import { writeToClipboard } from '../writeToClipboard.ts';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the async clipboard takes the text and the write reports success', async () => {
  const written: string[] = [];
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: (text: string) => {
        written.push(text);
        return Promise.resolve();
      },
    },
  });

  await expect(writeToClipboard('CC(=O)O')).resolves.toBe(true);
  expect(written).toStrictEqual(['CC(=O)O']);
});

test('a refused clipboard falls back to the textarea', async () => {
  vi.stubGlobal('navigator', {
    clipboard: {
      writeText: () => Promise.reject(new Error('NotAllowedError')),
    },
  });
  const documentStub = stubDocument(true);

  await expect(writeToClipboard('c1ccccc1')).resolves.toBe(true);
  expect(documentStub.copied).toStrictEqual(['c1ccccc1']);
  expect(documentStub.leftBehind).toBe(0);
});

test('a page with no clipboard at all uses the textarea', async () => {
  vi.stubGlobal('navigator', {});
  const documentStub = stubDocument(true);

  await expect(writeToClipboard('CCO')).resolves.toBe(true);
  expect(documentStub.copied).toStrictEqual(['CCO']);
});

test('a textarea the browser refuses to copy reports failure', async () => {
  vi.stubGlobal('navigator', {});
  const documentStub = stubDocument(false);

  await expect(writeToClipboard('CCO')).resolves.toBe(false);
  expect(documentStub.leftBehind).toBe(0);
});

test('a command that throws is an answer of false, never an exception', async () => {
  vi.stubGlobal('navigator', {});
  const documentStub = stubDocument(new Error('unsupported'));

  await expect(writeToClipboard('CCO')).resolves.toBe(false);
  expect(documentStub.leftBehind).toBe(0);
});

test('nothing to write to at all is false rather than a crash', async () => {
  vi.stubGlobal('navigator', undefined);
  vi.stubGlobal('document', undefined);

  await expect(writeToClipboard('CCO')).resolves.toBe(false);
});

interface DocumentStub {
  /** Text held by the textarea each time the copy command was run. */
  copied: string[];
  /** Textareas still in the document once the write is over. */
  leftBehind: number;
}

function stubDocument(outcome: boolean | Error): DocumentStub {
  const stub: DocumentStub = { copied: [], leftBehind: 0 };
  let current: { value: string } | null = null;

  vi.stubGlobal('document', {
    createElement: () => {
      const element = {
        value: '',
        style: {} as Record<string, string>,
        setAttribute: () => undefined,
        select: () => undefined,
        remove: () => {
          stub.leftBehind--;
        },
      };
      current = element;
      return element;
    },
    body: {
      append: () => {
        stub.leftBehind++;
      },
    },
    execCommand: () => {
      stub.copied.push(current?.value ?? '');
      if (outcome instanceof Error) throw outcome;
      return outcome;
    },
  });

  return stub;
}
