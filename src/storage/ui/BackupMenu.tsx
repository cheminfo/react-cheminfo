import { Menu, MenuItem, PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { Button } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';

import type { BackupRestoreOptions } from './useBackupRestore.tsx';
import { useBackupRestore } from './useBackupRestore.tsx';

/** Props of {@link BackupMenu}: what backing up and restoring do. */
export interface BackupMenuProps extends BackupRestoreOptions {
  /**
   * The button's tooltip and accessible name.
   * @default the chrome's own sentence, in the language of the page
   */
  title?: string;
}

/**
 * One button, with "Back up everything…" and "Restore a backup…" behind it:
 * everything the site keeps in this browser goes out as one file, and the same
 * file comes back. It prints nothing.
 * @param props - See {@link BackupMenuProps}.
 * @returns The button, its menu, the file chooser and the alerts.
 */
export function BackupMenu(props: BackupMenuProps): ReactElement {
  const { title: givenTitle, ...options } = props;
  const t = useChromeT();
  const { backup, restore, busy, dialogs } = useBackupRestore(options);
  const title = givenTitle ?? t('storage.menuTitle');
  return (
    <>
      <PopoverNext
        placement="bottom-start"
        content={
          <Menu>
            <MenuItem
              icon="export"
              text={t('storage.backup')}
              onClick={backup}
            />
            <MenuItem
              icon="import"
              text={t('storage.restore')}
              onClick={restore}
            />
          </Menu>
        }
      >
        <Button
          className="no-print"
          variant="minimal"
          size="small"
          icon="database"
          aria-label={title}
          tooltipProps={{ content: title, placement: 'bottom' }}
          loading={busy}
        />
      </PopoverNext>
      {dialogs}
    </>
  );
}
