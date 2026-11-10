import { useEffect, useState } from 'react';

import type { SavedDocuments } from '../core/createSavedDocuments.ts';
import { nameKey } from '../core/createSavedDocuments.ts';

/**
 * The names documents go by, by their key, leaving one out.
 * @param documents - The documents.
 * @param except - The one whose own name is free to keep.
 * @returns The names, by {@link nameKey}.
 */
export function takenNames(
  documents: ReadonlyArray<{ id: string; name: string }>,
  except: string | null,
): Map<string, string> {
  const names = new Map<string, string>();
  for (const document of documents) {
    if (document.id !== except) {
      names.set(nameKey(document.name), document.name);
    }
  }
  return names;
}

/**
 * A number that grows each time the documents change, in this tab or another.
 * @param store - The documents.
 * @returns The count.
 */
export function useStoreVersion(
  store: Pick<SavedDocuments<unknown>, 'subscribe'>,
): number {
  const [version, setVersion] = useState(0);
  useEffect(
    () =>
      store.subscribe(() => {
        setVersion((previous) => previous + 1);
      }),
    [store],
  );
  return version;
}
