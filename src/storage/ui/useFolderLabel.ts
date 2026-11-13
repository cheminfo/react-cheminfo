import { useCallback, useEffect, useState } from 'react';

import { useAsync } from '../../hooks/ui/useAsync.ts';
import type { SiteFolder } from '../core/siteFolderTypes.ts';

import { folderPathLabel } from './saveMessages.ts';

/**
 * A number that changes whenever the folder, its files or the folder open in
 * it change, for lists to read it again.
 * @param folder - The site's folder.
 * @returns The version.
 */
export function useFolderVersion(folder: SiteFolder): number {
  const [version, setVersion] = useState(0);
  useEffect(
    () =>
      folder.subscribe(() => {
        setVersion((previous) => previous + 1);
      }),
    [folder],
  );
  return version;
}

/**
 * The folder Save writes a new document in, as a reader is told it.
 * @param folder - The site's folder.
 * @returns E.g. `Chemistry course › Week 3`, or `undefined` while none was
 * chosen.
 */
export function useFolderLabel(folder: SiteFolder): string | undefined {
  const version = useFolderVersion(folder);
  const load = useCallback(async () => {
    const root = await folder.current();
    return root ? folderPathLabel(root.name, folder.path()) : undefined;
  }, [folder]);
  return useAsync(load, version).data;
}
