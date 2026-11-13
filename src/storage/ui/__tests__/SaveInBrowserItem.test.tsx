// @vitest-environment jsdom
/**
 * The folder panel's toolbar item saving the document on screen under a name:
 * it asks for the name, says when it replaces another document, and tells the
 * site what was saved.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { Toolbar } from 'react-science/ui';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type {
  SavedDocument,
  SavedDocuments,
} from '../../core/createSavedDocuments.ts';
import type { SaveInBrowserItemProps } from '../SaveInBrowserItem.tsx';
import { SaveInBrowserItem } from '../SaveInBrowserItem.tsx';

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

const ASPIRIN: SavedDocument<string> = {
  id: 'a',
  name: 'Aspirin',
  savedAt: 1000,
  data: 'CC(=O)Oc1ccccc1C(=O)O',
};

/** What subscribing hands back: nothing to stop in a store that never changes. */
function stopListening(): void {
  // Nothing is listened to.
}

function memoryStore(list: SavedDocuments<string>['list']) {
  const saved: Array<[string, string]> = [];
  const store: SavedDocuments<string> = {
    isAvailable: () => Promise.resolve(true),
    list,
    named: () => Promise.resolve(undefined),
    save: (name, data) => {
      saved.push([name, data]);
      return Promise.resolve({ id: 'new', name, savedAt: 2000, data });
    },
    update: () => Promise.resolve(undefined),
    rename: () => Promise.resolve(),
    remove: () => Promise.resolve(),
    restore: () => Promise.resolve(0),
    subscribe: () => stopListening,
  };
  return { store, saved };
}

async function render(
  props: Partial<SaveInBrowserItemProps<string>> &
    Pick<SaveInBrowserItemProps<string>, 'store'>,
): Promise<void> {
  await act(async () => {
    root.render(
      <Toolbar>
        <SaveInBrowserItem
          document={() => 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C'}
          suggestedName={() => 'Caffeine'}
          {...props}
        />
      </Toolbar>,
    );
  });
}

function item(): HTMLElement {
  // A greyed-out item is drawn as an anchor rather than a button.
  const button = host.querySelector<HTMLElement>(
    '[aria-label="Save in this browser…"]',
  );
  if (button === null) throw new Error('no item');
  return button;
}

async function press(): Promise<void> {
  await act(async () => {
    item().click();
    await Promise.resolve();
  });
}

function nameField(): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>('.folder-panel__field input');
}

function note(): string | null {
  return document.querySelector('.folder-panel__note')?.textContent ?? null;
}

test('the item asks for a name, then saves the document on screen under it', async () => {
  const { store, saved } = memoryStore(() => Promise.resolve([ASPIRIN]));
  const onSaved = vi.fn();
  await render({ store, onSaved });

  expect(nameField()).toBeNull();

  await press();

  expect(nameField()?.value).toBe('Caffeine');
  expect(note()).toBeNull();

  await act(async () => {
    nameField()?.form?.requestSubmit();
    await Promise.resolve();
  });

  expect(saved).toStrictEqual([['Caffeine', 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C']]);
  expect(onSaved.mock.calls).toStrictEqual([
    [
      {
        id: 'new',
        name: 'Caffeine',
        savedAt: 2000,
        data: 'CN1C=NC2=C1C(=O)N(C(=O)N2C)C',
      },
    ],
  ]);
  expect(document.querySelector('.bp6-overlay-open')).toBeNull();
});

test('a name another document goes by is said to replace it', async () => {
  const { store } = memoryStore(() => Promise.resolve([ASPIRIN]));
  await render({ store, suggestedName: () => 'aspirin' });
  await press();

  expect(note()).toBe(
    'A document is already saved as Aspirin: saving replaces it.',
  );
});

test('the document on screen saved under its own name is replaced without a word', async () => {
  const { store } = memoryStore(() => Promise.resolve([ASPIRIN]));
  await render({ store, suggestedName: () => 'Aspirin', currentId: 'a' });
  await press();

  expect(nameField()?.value).toBe('Aspirin');
  expect(note()).toBeNull();
});

test('a store that cannot list still asks for the name, with nothing taken', async () => {
  const { store } = memoryStore(() =>
    Promise.reject(new Error('IndexedDB is blocked')),
  );
  await render({ store, suggestedName: () => 'Aspirin' });
  await press();
  await act(async () => {
    await Promise.resolve();
  });

  expect(nameField()?.value).toBe('Aspirin');
  expect(note()).toBeNull();
});

test('a greyed-out item asks nothing', async () => {
  const list = vi.fn(() => Promise.resolve([ASPIRIN]));
  const { store } = memoryStore(list);
  await render({ store, disabled: true });

  expect(item().getAttribute('aria-disabled')).toBe('true');

  await press();

  expect(list).not.toHaveBeenCalled();
  expect(nameField()).toBeNull();
});
