// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type {
  SavedDocument,
  SavedDocuments,
} from '../../core/createSavedDocuments.ts';
import { ExamplesSection } from '../ExamplesSection.tsx';
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
  vi.unstubAllGlobals();
});

/** What subscribing hands back: nothing to stop in a store that never changes. */
function stopListening(): void {
  // Nothing is listened to.
}

/**
 * Documents kept in memory, as the store would list them.
 * @param documents - What it holds, the latest first.
 * @returns The store.
 */
function memoryStore(
  documents: Array<SavedDocument<string>>,
): SavedDocuments<string> {
  return {
    isAvailable: () => Promise.resolve(true),
    list: () => Promise.resolve(documents),
    named: () => Promise.resolve(undefined),
    save: () => Promise.reject(new Error('not in this test')),
    update: () => Promise.resolve(undefined),
    rename: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    subscribe: () => stopListening,
  };
}

async function show(element: ReactElement): Promise<void> {
  await act(async () => {
    root.render(element);
    await Promise.resolve();
  });
}

function rowTexts(): string[] {
  return [...host.querySelectorAll('.folder-panel__open')].map(
    (row) => row.textContent ?? '',
  );
}

test('the saved documents are listed the latest first, the one on screen marked', async () => {
  const opened: string[] = [];
  const now = Date.now();
  await show(
    <SavedDocumentsSection
      store={memoryStore([
        { id: 'b', name: 'Caffeine', savedAt: now, data: 'c' },
        { id: 'a', name: 'Aspirin', savedAt: now - 3 * 3_600_000, data: 'a' },
      ])}
      currentId="b"
      onOpen={(document) => {
        opened.push(document.data);
      }}
    />,
  );

  expect(host.querySelector('h3')?.textContent).toBe('Saved in this browser');
  expect(rowTexts()).toStrictEqual([
    'CaffeineOn screen',
    'AspirinSaved 3 hours ago',
  ]);
  expect(host.querySelector('[aria-current="true"]')?.textContent).toBe(
    'CaffeineOn screen',
  );

  act(() => {
    host.querySelectorAll<HTMLButtonElement>('.folder-panel__open')[1]?.click();
  });

  expect(opened).toStrictEqual(['a']);
});

test('with nothing saved, the section says how to save', async () => {
  await show(
    <SavedDocumentsSection store={memoryStore([])} onOpen={vi.fn()} />,
  );

  expect(host.textContent).toBe(
    'Saved in this browserSave the document on screen here, under a name, to open it again later.',
  );
});

test('an example opens on a click, and only a view holding several offers to add one', async () => {
  const examples = [
    { id: 'taxol', name: 'Taxol', description: 'The last two steps' },
  ];
  const opened: string[] = [];
  await show(
    <ExamplesSection
      examples={examples}
      onOpen={(example) => {
        opened.push(example.id);
      }}
    />,
  );

  expect(rowTexts()).toStrictEqual(['TaxolThe last two steps']);
  expect(
    host.querySelector('[aria-label="Add Taxol to what is on screen"]'),
  ).toBeNull();

  act(() => {
    host.querySelector<HTMLButtonElement>('.folder-panel__open')?.click();
  });

  expect(opened).toStrictEqual(['taxol']);

  await show(
    <ExamplesSection examples={examples} onOpen={vi.fn()} onAdd={vi.fn()} />,
  );

  expect(
    host.querySelectorAll('[aria-label="Add Taxol to what is on screen"]'),
  ).toHaveLength(1);
});

test('an opening the site asks about waits for the answer', async () => {
  const onOpen = vi.fn();
  await show(
    <ExamplesSection
      examples={[{ id: 'taxol', name: 'Taxol', description: 'Two steps' }]}
      onOpen={onOpen}
      confirmOpen={() => 'Replace the document on screen?'}
    />,
  );

  act(() => {
    host.querySelector<HTMLButtonElement>('.folder-panel__open')?.click();
  });

  expect(onOpen).not.toHaveBeenCalled();
  expect(document.body.textContent).toContain(
    'Replace the document on screen?',
  );
});
