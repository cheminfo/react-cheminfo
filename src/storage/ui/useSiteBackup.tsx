import { downloadBlob } from '../../download/core/downloadBlob.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { RestoredBackup, SiteBackup } from '../core/siteBackup.ts';

import type { BackupRestore } from './useBackupRestore.tsx';
import { useBackupRestore } from './useBackupRestore.tsx';

/**
 * Back up and restore a site's documents through its `createSiteBackup`:
 * Back up downloads the archive, Restore reads one back and says, in the
 * language of the page, what came back. Draw the two actions with
 * `<BackupToolbarItems>` and render `dialogs` once.
 * @param backup - The site's backup, made once at module scope.
 * @param onError - Shows why a backup or a restore failed; an alert of its own
 * when left out.
 * @returns The actions, their state and their dialogs.
 */
export function useSiteBackup(
  backup: SiteBackup,
  onError?: (message: string) => void,
): BackupRestore {
  const t = useChromeT();
  return useBackupRestore({
    onBackup: async () => {
      const archive = await backup.write();
      if (!archive) throw new Error(t('storage.nothingToBackUp'));
      downloadBlob(archive, backup.fileName());
    },
    onRestore: async (file) => {
      const restored = await backup.read(file);
      if (!restored) throw new Error(t('storage.notABackup'));
      return restoredSentence(restored, t);
    },
    accept: '.zip,application/zip',
    ...(onError ? { onError } : {}),
  });
}

function restoredSentence(
  restored: RestoredBackup,
  t: ReturnType<typeof useChromeT>,
): string {
  const { documents, drafts, copies } = restored;
  if (documents === 0 && drafts === 0) {
    throw new Error(t('storage.restoredNothing'));
  }
  const sentences = [
    drafts === 0
      ? t('storage.restoredDocuments', { documents })
      : t('storage.restoredAll', { documents, drafts }),
  ];
  if (copies > 0) sentences.push(t('storage.restoredCopies', { copies }));
  return sentences.join(' ');
}
