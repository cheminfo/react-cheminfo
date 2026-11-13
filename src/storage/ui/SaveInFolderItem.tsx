import type { ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { DocumentSaver } from '../core/documentSaverTypes.ts';
import { canPickFolders } from '../core/fileAccess.ts';

import { useFolderLabel } from './useFolderLabel.ts';
import { useSaveInPlace } from './useSaveInPlace.tsx';

/** Props of {@link SaveInFolderItem}. */
export interface SaveInFolderItemProps<D> {
  /** The site's saver. */
  saver: DocumentSaver<D>;
  /** Says what the save did. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /**
   * Whether it is greyed out, e.g. while there is nothing to save.
   * @default false
   */
  disabled?: boolean;
}

/**
 * The item of a folder panel's toolbar that saves the document on screen in
 * a folder of this computer, under a name it asks for: the first time it asks
 * for the folder, and Ctrl+S then saves every new document there. Where the
 * browser keeps no folder, it is greyed out and says which browsers do.
 * @param props - See {@link SaveInFolderItemProps}.
 * @returns The toolbar item and its dialog.
 */
export function SaveInFolderItem<D>(
  props: SaveInFolderItemProps<D>,
): ReactElement {
  const { saver, notify, disabled = false } = props;
  const t = useChromeT();
  const inPlace = useSaveInPlace(saver, notify);
  const where = useFolderLabel(saver.folder);
  const available = canPickFolders();
  const label = !available
    ? t('documents.saveInFolderUnavailable')
    : where === undefined
      ? t('documents.saveInFolder')
      : t('documents.saveInFolderNamed', { folder: where });
  return (
    <>
      <Toolbar.Item
        icon="floppy-disk"
        tooltip={label}
        aria-label={label}
        disabled={disabled || !available}
        onClick={() => {
          // The picker opens in the click itself, before the name is asked.
          void saver.folder.current().then(async (chosen) => {
            if (!chosen && !(await saver.folder.choose())) return;
            inPlace.ask('folder');
          });
        }}
      />
      {inPlace.dialog}
    </>
  );
}
