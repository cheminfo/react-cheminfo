// @vitest-environment jsdom
/**
 * What the reader does with a document saved in this browser: rename it,
 * forget it, open it once they agreed to replace the one on screen — and the
 * list follows every change the store reports.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type {
  SavedDocument,
  SavedDocuments,
} from '../../core/createSavedDocuments.ts';
import { SavedDocumentsSection } from '../SavedDocumentsSection.tsx';

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

/**
 * Documents kept in memory, telling its listeners of every change, as the
 * store does across tabs.
 * @param documents - What it holds at first, the latest first.
 * @param available - Whether the browser lets the page keep documents.
 * @returns The store, and what it was asked to change.
 */
function memoryStore(
  documents: Array<SavedDocument<string>>,
  available = true,
) {
  const listeners = new Set<() => void>();
  const asked: string[] = [];
  let held = documents;
  function changed(): void {
    for (const listener of listeners) listener();
  }
  const store: SavedDocuments<string> = {
    isAvailable: () => Promise.resolve(available),
    list: () => Promise.resolve(held),
    named: () => Promise.resolve(undefined),
    save: () => Promise.reject(new Error('not in this test')),
    rename: (id, name) => {
      asked.push(`rename ${id} ${name}`);
      held = held.map((document) =>
        document.id === id ? { ...document, name } : document,
      );
      changed();
      return Promise.resolve();
    },
    remove: (id) => {
      asked.push(`remove ${id}`);
      held = held.filter((document) => document.id !== id);
      changed();
      return Promise.resolve();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return { store, asked };
}

const NOW = Date.now();

const DOCUMENTS: Array<SavedDocument<string>> = [
  { id: 'b', name: 'Caffeine', savedAt: NOW, data: 'c' },
  { id: 'a', name: 'Aspirin', savedAt: NOW - 3 * 3_600_000, data: 'a' },
];

async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

function names(): string[] {
  return [...host.querySelectorAll('.folder-panel__name')].map(
    (name) => name.textContent ?? '',
  );
}

function rowButton(row: number, label: string): HTMLButtonElement {
  const item = host.querySelectorAll('.folder-panel__item')[row];
  const button = item?.querySelector<HTMLButtonElement>(
    `button[aria-label="${CSS.escape(label)}"]`,
  );
  if (button === null || button === undefined) throw new Error(`no ${label}`);
  return button;
}

function bodyButton(text: string): HTMLButtonElement {
  const button = [...document.body.querySelectorAll('button')].findLast(
    (candidate) => candidate.textContent === text,
  );
  if (button === undefined) throw new Error(`no ${text} button`);
  return button;
}

test('a browser that keeps nothing says to save to a file instead', async () => {
  const { store } = memoryStore(DOCUMENTS, false);
  await act(async () => {
    root.render(<SavedDocumentsSection store={store} onOpen={vi.fn()} />);
  });
  await settle();

  expect(host.textContent).toBe(
    'Saved in this browserThis browser does not let the page keep documents: save them to a file instead.',
  );
});

test('the pencil renames a document, and the list shows the new name', async () => {
  const { store, asked } = memoryStore(DOCUMENTS);
  await act(async () => {
    root.render(<SavedDocumentsSection store={store} onOpen={vi.fn()} />);
  });
  await settle();

  expect(names()).toStrictEqual(['Caffeine', 'Aspirin']);

  act(() => {
    rowButton(1, 'Rename this document').click();
  });
  const field = document.querySelector<HTMLInputElement>(
    '.folder-panel__field input',
  );

  expect(field?.value).toBe('Aspirin');

  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  act(() => {
    descriptor?.set?.call(field, 'caffeine');
    field?.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // Another document's name is refused; the document's own stays free.
  expect(document.querySelector('.folder-panel__problem')?.textContent).toBe(
    'A document is already saved as Caffeine: choose another name.',
  );

  act(() => {
    descriptor?.set?.call(field, 'Acetylsalicylic acid');
    field?.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await act(async () => {
    field?.form?.requestSubmit();
    await Promise.resolve();
  });
  await settle();

  expect(asked).toStrictEqual(['rename a Acetylsalicylic acid']);
  expect(names()).toStrictEqual(['Caffeine', 'Acetylsalicylic acid']);
});

test('the bin forgets a document only once the reader confirms', async () => {
  const { store, asked } = memoryStore(DOCUMENTS);
  await act(async () => {
    root.render(<SavedDocumentsSection store={store} onOpen={vi.fn()} />);
  });
  await settle();

  act(() => {
    rowButton(0, 'Delete this document').click();
  });

  expect(document.body.textContent).toContain(
    'Delete Caffeine? It cannot be brought back.',
  );
  expect(asked).toStrictEqual([]);

  await act(async () => {
    bodyButton('Delete').click();
    await Promise.resolve();
  });
  await settle();

  expect(asked).toStrictEqual(['remove b']);
  expect(names()).toStrictEqual(['Aspirin']);
});

test('a document replacing the one on screen opens once the reader agrees, and not when they cancel', async () => {
  const { store } = memoryStore(DOCUMENTS);
  const opened: string[] = [];
  await act(async () => {
    root.render(
      <SavedDocumentsSection
        store={store}
        onOpen={(document) => {
          opened.push(document.id);
        }}
        confirmOpen={() => 'Replace the drawing on screen?'}
        thumbnail={(document) => (
          <span className="thumbnail">{document.data}</span>
        )}
      />,
    );
  });
  await settle();

  expect(
    [...host.querySelectorAll('.thumbnail')].map((node) => node.textContent),
  ).toStrictEqual(['c', 'a']);

  const rows = host.querySelectorAll<HTMLButtonElement>('.folder-panel__open');
  act(() => {
    rows[1]?.click();
  });

  expect(opened).toStrictEqual([]);
  expect(document.body.textContent).toContain('Replace the drawing on screen?');

  act(() => {
    bodyButton('Cancel').click();
  });

  expect(opened).toStrictEqual([]);

  act(() => {
    rows[1]?.click();
  });
  act(() => {
    bodyButton('Open').click();
  });

  expect(opened).toStrictEqual(['a']);
});
