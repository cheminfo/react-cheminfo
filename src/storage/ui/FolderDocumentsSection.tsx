import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import { useAsync } from '../../hooks/ui/useAsync.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { matchesNeedle } from '../../panel/core/textFilter.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import {
  usePanelNeedle,
  usePanelTally,
} from '../../panel/ui/panelSearchContext.ts';
import { nameKey } from '../core/createSavedDocuments.ts';
import type { FolderEntry, SiteFolder } from '../core/siteFolderTypes.ts';

import { DocumentNameDialog } from './DocumentNameDialog.tsx';
import {
  FolderCrumbs,
  FolderFileRow,
  HeadingAction,
  SubfolderRow,
} from './FolderRows.tsx';
import { FolderNoMatch } from './FolderSearch.tsx';
import { FolderSection } from './FolderSection.tsx';
import { folderPathLabel } from './saveMessages.ts';
import { useFolderVersion } from './useFolderLabel.ts';
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
 * The folder the site's documents are saved in: its name and the folders open
 * inside it as a breadcrumb, then the folders inside, then the site's files,
 * the latest first. A click on a folder opens it, and Save then writes new
 * documents there; a click on a file opens it, and Save writes over it. After
 * a reload the browser asks once before the page reads the folder again.
 * Nothing is shown while no folder was chosen. Inside a `<PanelSearch>`, the
 * files of every folder below are searched, each saying where it is.
 * @param props - See {@link FolderDocumentsSectionProps}.
 * @returns The section, or nothing.
 */
export function FolderDocumentsSection(
  props: FolderDocumentsSectionProps,
): ReactElement | null {
  const { folder, extensions, currentName = null, onOpen, confirmOpen } = props;
  const t = useChromeT();
  const version = useFolderVersion(folder);
  const needle = usePanelNeedle();
  const deep = needle !== '';
  // A site passes its extensions inline: the list is read again only when they change.
  const kinds = extensions.join('\n');
  const load = useCallback(
    () => readFolder(folder, kinds.split('\n'), deep),
    [folder, kinds, deep],
  );
  const listing = useAsync(load, version);
  const confirmation = useOpenConfirmation(confirmOpen);
  const [creating, setCreating] = useState(false);
  const data = listing.data;
  const allFiles = data?.root ? data.entries : [];
  const allFolders = data?.root ? data.folders : [];
  const files = allFiles.filter((entry) => matchesNeedle(needle, entry.name));
  const folders = allFolders.filter((name) => matchesNeedle(needle, name));
  usePanelTally(
    files.length + folders.length,
    allFiles.length + allFolders.length,
  );
  if (!data?.root) return null;
  const { root, readable, path } = data;
  const label = folderPathLabel(root, path);

  return (
    <FolderSection
      name="folder"
      title={t('folder.heading', { folder: label })}
      heading={(toggle) => (
        <FolderCrumbs
          root={root}
          path={path}
          onOpen={folder.open}
          toggle={toggle}
          actions={
            <>
              {readable ? (
                <HeadingAction
                  text={t('folder.newFolder')}
                  onClick={() => {
                    setCreating(true);
                  }}
                />
              ) : null}
              <HeadingAction
                text={t('folder.choose')}
                onClick={() => {
                  void folder.choose();
                }}
              />
              <HeadingAction
                text={t('folder.forget')}
                onClick={() => {
                  void folder.forget();
                }}
              />
            </>
          }
        />
      )}
    >
      {!readable ? (
        <Button
          size="small"
          icon="folder-open"
          text={t('folder.allow', { folder: root })}
          onClick={() => {
            void folder.allow();
          }}
        />
      ) : files.length + folders.length === 0 ? (
        deep ? (
          <FolderNoMatch />
        ) : (
          <PanelEmpty>{t('folder.empty')}</PanelEmpty>
        )
      ) : (
        <ul className="folder-panel__list">
          {folders.map((name) => (
            <SubfolderRow
              key={`folder:${name}`}
              name={name}
              onOpen={() => {
                folder.open([...path, name]);
              }}
            />
          ))}
          {files.map((entry) => (
            <FolderFileRow
              key={[...(entry.path ?? []), entry.name].join('/')}
              entry={entry}
              root={root}
              path={path}
              current={entry.name === currentName && !entry.path?.length}
              onOpen={() => {
                confirmation.open(() => {
                  void openEntry(entry, onOpen);
                });
              }}
            />
          ))}
        </ul>
      )}
      <DocumentNameDialog
        isOpen={creating}
        mode="create"
        initialName=""
        taken={namesOf(allFolders)}
        onSubmit={(name) => folder.createFolder(name)}
        onClose={() => {
          setCreating(false);
        }}
      />
      {confirmation.alert}
    </FolderSection>
  );
}

function namesOf(names: readonly string[]): ReadonlyMap<string, string> {
  const map = new Map<string, string>();
  for (const name of names) map.set(nameKey(name), name);
  return map;
}

async function readFolder(
  folder: SiteFolder,
  extensions: readonly string[],
  deep: boolean,
): Promise<{
  root?: string;
  readable: boolean;
  path: readonly string[];
  folders: string[];
  entries: FolderEntry[];
}> {
  const handle = await folder.current();
  const path = folder.path();
  if (!handle) return { readable: false, path, folders: [], entries: [] };
  const readable = await folder.readable();
  if (!readable) {
    return { root: handle.name, readable, path, folders: [], entries: [] };
  }
  const [folders, entries] = await Promise.all([
    deep ? Promise.resolve([]) : folder.folders(),
    deep ? folder.search(extensions) : folder.list(extensions),
  ]);
  return { root: handle.name, readable, path: folder.path(), folders, entries };
}

async function openEntry(
  entry: FolderEntry,
  onOpen: (file: File, handle: FileSystemFileHandle) => void,
): Promise<void> {
  onOpen(await entry.handle.getFile(), entry.handle);
}
