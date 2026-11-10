import type { ReactElement } from 'react';
import { useState } from 'react';
import { Toolbar } from 'react-science/ui';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type {
  SavedDocument,
  SavedDocuments,
} from '../core/createSavedDocuments.ts';

import { DocumentNameDialog } from './DocumentNameDialog.tsx';
import { takenNames } from './savedDocumentsState.ts';

/** Props of {@link SaveInBrowserItem}. */
export interface SaveInBrowserItemProps<TData> {
  /** The site's saved documents. */
  store: SavedDocuments<TData>;
  /** The document on screen, as it is saved. */
  document: () => TData;
  /** The name the dialog opens on: the one it is saved as, else its title. */
  suggestedName: () => string;
  /**
   * The saved document on screen: saving under its own name replaces it
   * without a word.
   * @default null — none
   */
  currentId?: string | null;
  /**
   * Told what was saved, so the site knows the document on screen is it.
   * @default undefined
   */
  onSaved?: (document: SavedDocument<TData>) => void;
  /**
   * Whether it is greyed out.
   * @default false
   */
  disabled?: boolean;
}

/**
 * The item of a folder panel's toolbar that saves the document on screen in
 * this browser, under a name it asks for.
 * @param props - See {@link SaveInBrowserItemProps}.
 * @returns The toolbar item and its dialog.
 */
export function SaveInBrowserItem<TData>(
  props: SaveInBrowserItemProps<TData>,
): ReactElement {
  const {
    store,
    document,
    suggestedName,
    currentId = null,
    onSaved,
    disabled = false,
  } = props;
  const t = useChromeT();
  const [asking, setAsking] = useState<{
    name: string;
    taken: Map<string, string>;
  } | null>(null);
  const label = t('documents.saveInBrowser');

  return (
    <>
      <Toolbar.Item
        icon="add-to-folder"
        tooltip={label}
        aria-label={label}
        disabled={disabled}
        onClick={() => {
          void store.list().then(
            (documents) => {
              setAsking({
                name: suggestedName(),
                taken: takenNames(documents, currentId),
              });
            },
            () => {
              setAsking({ name: suggestedName(), taken: new Map() });
            },
          );
        }}
      />
      <DocumentNameDialog
        isOpen={asking !== null}
        mode="save"
        initialName={asking?.name ?? ''}
        taken={asking?.taken ?? new Map()}
        onSubmit={async (name) => {
          const saved = await store.save(name, document());
          onSaved?.(saved);
        }}
        onClose={() => {
          setAsking(null);
        }}
      />
    </>
  );
}
