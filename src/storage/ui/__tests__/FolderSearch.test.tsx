// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { matchesNeedle } from '../../../panel/core/textFilter.ts';
import { PanelCount, PanelSearch } from '../../../panel/ui/PanelSearch.tsx';
import { usePanelNeedle } from '../../../panel/ui/panelSearchContext.ts';
import type {
  SavedDocument,
  SavedDocuments,
} from '../../core/createSavedDocuments.ts';
import { ExamplesSection } from '../ExamplesSection.tsx';
import { FolderSearchField } from '../FolderSearch.tsx';
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

function stopListening(): void {
  // Nothing is listened to.
}

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
    restore: () => Promise.resolve(0),
    subscribe: () => stopListening,
  };
}

const DRAFTS = ['Benzene draft', 'Cyclohexane draft'];

/**
 * A site's own section, reading the same search.
 * @returns The drafts the search keeps.
 */
function DraftsSection(): ReactElement {
  const needle = usePanelNeedle();
  const shown = DRAFTS.filter((name) => matchesNeedle(needle, name));
  return (
    <section>
      {shown.map((name) => (
        <p key={name} className="draft">
          {name}
        </p>
      ))}
    </section>
  );
}

async function showPanel(): Promise<void> {
  const now = Date.now();
  await act(async () => {
    root.render(
      <PanelSearch>
        <FolderSearchField />
        <PanelCount />
        <DraftsSection />
        <SavedDocumentsSection
          store={memoryStore([
            { id: 'b', name: 'Caffeine', savedAt: now, data: 'c' },
            { id: 'a', name: 'Aspirin', savedAt: now, data: 'a' },
          ])}
          onOpen={vi.fn()}
        />
        <ExamplesSection
          examples={[
            { id: 'taxol', name: 'Taxol', description: 'The last two steps' },
            {
              id: 'benzene',
              name: 'Benzene',
              description: 'Kekulé',
              keywords: 'c1ccccc1',
            },
          ]}
          onOpen={vi.fn()}
        />
      </PanelSearch>,
    );
    await Promise.resolve();
  });
}

function search(text: string): void {
  const field = host.querySelector<HTMLInputElement>('input');
  if (!field) throw new Error('no search box');
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  act(() => {
    descriptor?.set?.call(field, text);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function shown(): string[] {
  return [...host.querySelectorAll('.draft, .folder-panel__name')].map(
    (row) => row.textContent ?? '',
  );
}

test('the box says what it searches, and lists everything while empty', async () => {
  await showPanel();

  expect(host.querySelector('input')?.placeholder).toBe(
    'Search your documents and the examples',
  );
  expect(shown()).toStrictEqual([
    'Benzene draft',
    'Cyclohexane draft',
    'Caffeine',
    'Aspirin',
    'Taxol',
    'Benzene',
  ]);
});

test('one search keeps the matching drafts, documents and examples at once', async () => {
  await showPanel();

  search('BENZ');

  expect(shown()).toStrictEqual(['Benzene draft', 'Benzene']);
  expect(
    [...host.querySelectorAll('section')].map((section) => section.textContent),
  ).toStrictEqual([
    'Benzene draft',
    'Saved in this browserNothing here matches.',
    'ExamplesBenzeneKekulé',
  ]);
});

test('an example is found by its description and its keywords too', async () => {
  await showPanel();

  search('two steps');

  expect(shown()).toStrictEqual(['Taxol']);

  search('C1CCCCC1');

  expect(shown()).toStrictEqual(['Benzene']);
});

test('clearing the box brings every row back', async () => {
  await showPanel();
  search('aspirin');

  expect(shown()).toStrictEqual(['Aspirin']);

  act(() => {
    host
      .querySelector<HTMLButtonElement>('[aria-label="Clear the filter"]')
      ?.click();
  });

  expect(shown()).toHaveLength(6);
});

test('beside the box, the panel counts the rows listed of all its rows', async () => {
  await showPanel();
  const count = (): string | undefined =>
    host.querySelector('.panel-count')?.textContent?.replaceAll(' ', ' ');

  expect(count()).toBe('[ 4 / 4 ]');
  expect(host.querySelector('.panel-count')?.getAttribute('title')).toBe(
    'Listed: 4 of 4',
  );

  search('benz');

  expect(count()).toBe('[ 1 / 4 ]');
});
