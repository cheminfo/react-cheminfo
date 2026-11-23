import type { ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { DocumentSaver, NamedTarget } from '../core/documentSaverTypes.ts';
import { canPickFolders } from '../core/fileAccess.ts';

import { TARGET_ICONS } from './placeIcons.ts';
import { useFolderLabel } from './useFolderLabel.ts';
import { useSaveInPlace } from './useSaveInPlace.tsx';

/** Props of {@link SaveToolbarItems}. */
export interface SaveToolbarItemsProps<D> {
  /** The site's saver. */
  saver: DocumentSaver<D>;
  /** Says what the save did. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /**
   * Whether they are greyed out, e.g. while there is nothing to save.
   * @default false
   */
  disabled?: boolean;
  /**
   * The places offered, in this order.
   * @default ['folder', 'browser'] — this browser only when the saver keeps
   * documents there
   */
  places?: readonly NamedTarget[];
}

/**
 * The items of a folder panel's toolbar that save the document on screen
 * under a name it asks for: on this computer, in the site's folder — the
 * first time it asks for the folder — and in this browser. Each carries the
 * icon its place has everywhere else. Where the browser keeps no folder, the
 * first is greyed out and says which browsers do.
 * @param props - See {@link SaveToolbarItemsProps}.
 * @returns The toolbar items and their dialog.
 */
export function SaveToolbarItems<D>(
  props: SaveToolbarItemsProps<D>,
): ReactElement {
  const { saver, notify, disabled = false } = props;
  const { places = ['folder', 'browser'] } = props;
  const t = useChromeT();
  const inPlace = useSaveInPlace(saver, notify);
  const where = useFolderLabel(saver.folder);
  const folders = canPickFolders();
  const folderLabel = !folders
    ? t('documents.saveInFolderUnavailable')
    : where === undefined
      ? t('documents.saveInFolder')
      : t('documents.saveInFolderNamed', { folder: where });
  const browserLabel = t('documents.saveInBrowser');
  return (
    <>
      {places.map((place) =>
        place === 'folder' ? (
          <Toolbar.Item
            key={place}
            icon={TARGET_ICONS.folder}
            tooltip={folderLabel}
            aria-label={folderLabel}
            disabled={disabled || !folders}
            onClick={inPlace.askFolder}
          />
        ) : saver.savedDocuments ? (
          <Toolbar.Item
            key={place}
            icon={TARGET_ICONS.browser}
            tooltip={browserLabel}
            aria-label={browserLabel}
            disabled={disabled}
            onClick={() => {
              inPlace.ask('browser');
            }}
          />
        ) : null,
      )}
      {inPlace.dialog}
    </>
  );
}
