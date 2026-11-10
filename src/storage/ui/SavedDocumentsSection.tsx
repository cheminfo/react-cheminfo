import { Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useState } from 'react';

import { ConfirmButton } from '../../confirm/ui/ConfirmButton.tsx';
import { formatRelativeTime } from '../../format/core/relativeTime.ts';
import { useAsync } from '../../hooks/ui/useAsync.ts';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import type {
  SavedDocument,
  SavedDocuments,
} from '../core/createSavedDocuments.ts';

import { DocumentNameDialog } from './DocumentNameDialog.tsx';
import { takenNames, useStoreVersion } from './savedDocumentsState.ts';
import type { ConfirmOpen } from './useOpenConfirmation.tsx';
import { useOpenConfirmation } from './useOpenConfirmation.tsx';

/** Props of {@link SavedDocumentsSection}. */
export interface SavedDocumentsSectionProps<TData> {
  /** The site's saved documents. */
  store: SavedDocuments<TData>;
  /**
   * The saved document on screen, marked in the list.
   * @default null — none
   */
  currentId?: string | null;
  /** Puts a document on screen. */
  onOpen: (document: SavedDocument<TData>) => void;
  /**
   * What is asked before a document replaces the one on screen.
   * @default undefined — nothing is asked
   */
  confirmOpen?: ConfirmOpen;
  /**
   * A small picture of a document, drawn at the start of its row.
   * @default undefined — the name alone
   */
  thumbnail?: (document: SavedDocument<TData>) => ReactNode;
}

/**
 * The documents saved in this browser under a name, the latest first: a click
 * puts one on screen, the pencil renames it and the bin forgets it. The
 * documents a site keeps on its own — drafts, examples — are sections of their
 * own beside it.
 * @param props - See {@link SavedDocumentsSectionProps}.
 * @returns The section.
 */
export function SavedDocumentsSection<TData>(
  props: SavedDocumentsSectionProps<TData>,
): ReactElement {
  const { store, currentId = null, onOpen, confirmOpen, thumbnail } = props;
  const t = useChromeT();
  const language = useLanguage();
  const version = useStoreVersion(store);
  const load = useCallback(() => readListing(store), [store]);
  const listing = useAsync(load, version);
  const confirmation = useOpenConfirmation(confirmOpen);
  const [renaming, setRenaming] = useState<SavedDocument<TData> | null>(null);
  const documents = listing.data?.documents ?? [];

  return (
    <section
      className="folder-panel__section"
      aria-label={t('documents.heading')}
    >
      <h3 className="folder-panel__heading">{t('documents.heading')}</h3>
      {listing.data?.available === false ? (
        <PanelEmpty>{t('documents.unavailable')}</PanelEmpty>
      ) : documents.length === 0 ? (
        <PanelEmpty>{t('documents.empty')}</PanelEmpty>
      ) : (
        <ul className="folder-panel__list">
          {documents.map((document) => {
            const current = document.id === currentId;
            return (
              <li key={document.id} className="folder-panel__item">
                <button
                  type="button"
                  className="folder-panel__open"
                  aria-current={current ? 'true' : undefined}
                  title={t('documents.openTooltip')}
                  onClick={() => {
                    confirmation.open(() => {
                      onOpen(document);
                    });
                  }}
                >
                  {thumbnail?.(document)}
                  <span className="folder-panel__text">
                    <span className="folder-panel__name">{document.name}</span>
                    <span className="folder-panel__time">
                      {current
                        ? t('documents.onScreen')
                        : t('documents.savedAgo', {
                            time: formatRelativeTime(document.savedAt, {
                              locale: language,
                            }),
                          })}
                    </span>
                  </span>
                </button>
                <Button
                  variant="minimal"
                  size="small"
                  icon="edit"
                  className="no-print"
                  aria-label={t('documents.renameTooltip')}
                  title={t('documents.renameTooltip')}
                  onClick={() => {
                    setRenaming(document);
                  }}
                />
                <ConfirmButton
                  variant="minimal"
                  size="small"
                  icon="trash"
                  aria-label={t('documents.delete')}
                  title={t('documents.delete')}
                  question={t('documents.deleteQuestion', {
                    name: document.name,
                  })}
                  onConfirm={() => {
                    void store.remove(document.id);
                  }}
                />
              </li>
            );
          })}
        </ul>
      )}
      <DocumentNameDialog
        isOpen={renaming !== null}
        mode="rename"
        initialName={renaming?.name ?? ''}
        taken={takenNames(documents, renaming?.id ?? null)}
        onSubmit={async (name) => {
          if (renaming) await store.rename(renaming.id, name);
        }}
        onClose={() => {
          setRenaming(null);
        }}
      />
      {confirmation.alert}
    </section>
  );
}

async function readListing<TData>(store: SavedDocuments<TData>): Promise<{
  available: boolean;
  documents: Array<SavedDocument<TData>>;
}> {
  if (!(await store.isAvailable())) return { available: false, documents: [] };
  return { available: true, documents: await store.list() };
}
