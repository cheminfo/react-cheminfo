/**
 * Saving in this browser under a name another document takes: numbered by
 * default, and in its place when the name dialog said so.
 */

import { expect, test, vi } from 'vitest';

import type { SavedDocuments } from '../createSavedDocuments.ts';
import { saveInBrowser } from '../saveInBrowser.ts';

function storeWithNotes() {
  const save = vi.fn((name: string, data: string) =>
    Promise.resolve({ id: 'new', name, savedAt: 2, data }),
  );
  const store = {
    list: () =>
      Promise.resolve([{ id: 'n', name: 'Notes', savedAt: 1, data: 'old' }]),
    save,
  } as unknown as SavedDocuments<string>;
  return { store, save };
}

test('a taken name is numbered, never written over', async () => {
  const { store, save } = storeWithNotes();

  const { outcome } = await saveInBrowser(store, 'Notes', 'new', undefined);

  expect(save).toHaveBeenCalledWith('Notes (2)', 'new');
  expect(outcome).toStrictEqual({
    kind: 'saved',
    target: 'browser',
    name: 'Notes (2)',
    wanted: 'Notes',
  });
});

test('a taken name the dialog said is replaced is written over', async () => {
  const { store, save } = storeWithNotes();

  const { outcome, kept } = await saveInBrowser(
    store,
    'Notes',
    'new',
    undefined,
    true,
  );

  expect(save).toHaveBeenCalledWith('Notes', 'new');
  expect(outcome).toStrictEqual({
    kind: 'saved',
    target: 'browser',
    name: 'Notes',
  });
  expect(kept).toStrictEqual({ name: 'Notes', savedId: 'new', saved: 'new' });
});
