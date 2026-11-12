import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { formatRelativeTime } from '../../format/core/relativeTime.ts';
import { useAsync } from '../../hooks/ui/useAsync.ts';
import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import type { FolderEntry, SiteFolder } from '../core/createSiteFolder.ts';

import type { ConfirmOpen } from './useOpenConfirmation.tsx';
import { useOpenConfirmation } from './useOpenConfirmation.tsx';

/** Props of {@link FolderDocumentsSection}. */
export interface FolderDocumentsSectionProps {
  /** The site's folder, as its saver keeps it. */
  folder: SiteFolder;
  /** What the site's files end with, e.g. `['.write.html']`. */
  extensions: readonly string[];
  /**
   * The file on screen, marked in the list.
   * @default null — none
   */
  currentName?: string | null;
  /** Puts a file on screen; Save then writes over it. */
  onOpen: (file: File, handle: FileSystemFileHandle) => void;
  /**
   * What is asked before a file replaces the document on screen.
   * @default undefined — nothing is asked
   */
  confirmOpen?: ConfirmOpen;
}

/**
 * The site's files in the folder its documents are saved in, the latest
 * first: a click opens one, and Save writes over it. After a reload the
 * browser asks once before the page reads the folder again. Nothing is shown
 * while no folder was chosen.
 * @param props - See {@link FolderDocumentsSectionProps}.
 * @returns The section, or nothing.
 */
export function FolderDocumentsSection(
  props: FolderDocumentsSectionProps,
): ReactElement | null {
  const { folder, extensions, currentName = null, onOpen, confirmOpen } = props;
  const t = useChromeT();
  const language = useLanguage();
  const version = useFolderVersion(folder);
  // A site passes its extensions inline: the list is read again only when they change.
  const kinds = extensions.join('\n');
  const load = useCallback(
    () => readFolder(folder, kinds.split('\n')),
    [folder, kinds],
  );
  const listing = useAsync(load, version);
  const confirmation = useOpenConfirmation(confirmOpen);
  const data = listing.data;
  if (!data?.name) return null;
  const { name, readable, entries } = data;

  return (
    <section
      className="folder-panel__section"
      aria-label={t('folder.heading', { folder: name })}
    >
      <h3 className="folder-panel__heading">
        {t('folder.heading', { folder: name })}
      </h3>
      {!readable ? (
        <Button
          size="small"
          icon="folder-open"
          text={t('folder.allow', { folder: name })}
          onClick={() => {
            void folder.allow();
          }}
        />
      ) : entries.length === 0 ? (
        <PanelEmpty>{t('folder.empty')}</PanelEmpty>
      ) : (
        <ul className="folder-panel__list">
          {entries.map((entry) => (
            <li key={entry.name} className="folder-panel__item">
              <button
                type="button"
                className="folder-panel__open"
                aria-current={entry.name === currentName ? 'true' : undefined}
                title={t('documents.openTooltip')}
                onClick={() => {
                  confirmation.open(() => {
                    void openEntry(entry, onOpen);
                  });
                }}
              >
                <span className="folder-panel__text">
                  <span className="folder-panel__name">{entry.name}</span>
                  <span className="folder-panel__time">
                    {entry.name === currentName
                      ? t('documents.onScreen')
                      : t('documents.savedAgo', {
                          time: formatRelativeTime(entry.modified, {
                            locale: language,
                          }),
                        })}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="folder-panel__actions no-print">
        <Button
          variant="minimal"
          size="small"
          icon="folder-new"
          text={t('folder.choose')}
          onClick={() => {
            void folder.choose();
          }}
        />
        <Button
          variant="minimal"
          size="small"
          icon="cross"
          text={t('folder.forget')}
          onClick={() => {
            void folder.forget();
          }}
        />
      </div>
      {confirmation.alert}
    </section>
  );
}

function useFolderVersion(folder: SiteFolder): number {
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

async function readFolder(
  folder: SiteFolder,
  extensions: readonly string[],
): Promise<{ name?: string; readable: boolean; entries: FolderEntry[] }> {
  const handle = await folder.current();
  if (!handle) return { readable: false, entries: [] };
  const readable = await folder.readable();
  const entries = readable ? await folder.list(extensions) : [];
  return { name: handle.name, readable, entries };
}

async function openEntry(
  entry: FolderEntry,
  onOpen: (file: File, handle: FileSystemFileHandle) => void,
): Promise<void> {
  onOpen(await entry.handle.getFile(), entry.handle);
}
