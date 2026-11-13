import type { ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';

import type { BackupRestore } from './useBackupRestore.tsx';

/** Props of {@link BackupToolbarItems}. */
export interface BackupToolbarItemsProps {
  /** What `useSiteBackup` or `useBackupRestore` returned. */
  actions: BackupRestore;
  /**
   * Whether both are off, e.g. while the browser keeps nothing.
   * @default false
   */
  disabled?: boolean;
}

/**
 * Back up and Restore, as the two items a folder panel's toolbar carries on
 * every site, in the chrome's own words.
 * @param props - See {@link BackupToolbarItemsProps}.
 * @returns The two items.
 */
export function BackupToolbarItems(
  props: BackupToolbarItemsProps,
): ReactElement {
  const { actions, disabled = false } = props;
  const t = useChromeT();
  const backup = t('storage.backupTooltip');
  const restore = t('storage.restoreTooltip');
  return (
    <>
      <Toolbar.Item
        icon="export"
        tooltip={backup}
        aria-label={backup}
        disabled={disabled || actions.busy}
        onClick={actions.backup}
      />
      <Toolbar.Item
        icon="import"
        tooltip={restore}
        aria-label={restore}
        disabled={disabled || actions.busy}
        onClick={actions.restore}
      />
    </>
  );
}
