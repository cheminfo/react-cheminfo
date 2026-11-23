import type { ReactElement } from 'react';

import type { DocumentSaver } from '../core/documentSaverTypes.ts';

import { SaveToolbarItems } from './SaveToolbarItems.tsx';

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
 * `<SaveToolbarItems>` offers it beside saving in this browser.
 * @param props - See {@link SaveInFolderItemProps}.
 * @returns The toolbar item and its dialog.
 */
export function SaveInFolderItem<D>(
  props: SaveInFolderItemProps<D>,
): ReactElement {
  return <SaveToolbarItems {...props} places={['folder']} />;
}
