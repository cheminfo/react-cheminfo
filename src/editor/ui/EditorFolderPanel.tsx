import type { ComponentType, ReactElement, ReactNode } from 'react';
import { useRef } from 'react';
import { Toolbar } from 'react-science/ui';

import type { OpenFigureOptions } from '../../host/ui/useOpenFigure.tsx';
import { useOpenFigure } from '../../host/ui/useOpenFigure.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { PanelFrameProps } from '../../panel/ui/PanelFrame.tsx';
import { PanelFrame } from '../../panel/ui/PanelFrame.tsx';
import { PanelCount, PanelSearch } from '../../panel/ui/PanelSearch.tsx';
import { PanelSettingsButton } from '../../panel/ui/PanelSettingsButton.tsx';
import type { DocumentFile } from '../../storage/core/documentFile.ts';
import type {
  DocumentSaver,
  NamedTarget,
} from '../../storage/core/documentSaverTypes.ts';
import type { SiteBackup } from '../../storage/core/siteBackup.ts';
import { BackupToolbarItems } from '../../storage/ui/BackupToolbarItems.tsx';
import type { FolderExample } from '../../storage/ui/ExamplesSection.tsx';
import { FolderSearchField } from '../../storage/ui/FolderSearch.tsx';
import { SaveToolbarItems } from '../../storage/ui/SaveToolbarItems.tsx';
import type { ConfirmOpen } from '../../storage/ui/useOpenConfirmation.tsx';
import { useSaveSettings } from '../../storage/ui/useSaveSettings.tsx';
import { useSiteBackup } from '../../storage/ui/useSiteBackup.tsx';

import type {
  EditorFolderDrafts,
  EditorFolderExamples,
  EditorFolderSaved,
} from './FolderPanelSections.tsx';
import { FolderPanelSections } from './FolderPanelSections.tsx';

export type {
  EditorFolderDrafts,
  EditorFolderExamples,
  EditorFolderSaved,
} from './FolderPanelSections.tsx';

/** What {@link EditorFolderPanel} is given. */
export interface EditorFolderPanelProps<D, E extends FolderExample> {
  /** The panel's name, as the rail titles it: `Figures`, `Charts`. */
  name: string;
  /** What a test finds the panel by: `figures-panel`. */
  testId: string;
  /** The site the figures belong to, `TOOL.name`. */
  site: string;
  /** The site's saver. */
  saver: DocumentSaver<D>;
  /** Says what a save or an open did: the status line's `say`. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /** The document on screen. */
  live: D;
  /** Whether there is nothing on screen to save. */
  empty: boolean;
  /** Where the document on screen is kept. */
  file: DocumentFile<D> | null;
  /** The drafts this browser keeps as the visitor works. */
  drafts: EditorFolderDrafts<D>;
  /** The documents saved in this browser under a name. */
  saved: EditorFolderSaved<D>;
  /** The site's backup, written and read by the toolbar. */
  backup: SiteBackup;
  /**
   * The examples to start from; null for none.
   * @default null
   */
  examples?: EditorFolderExamples<E> | null;
  /** Show a figure of the site opened from a file of the folder. */
  onOpen: OpenFigureOptions['onOpen'];
  /**
   * Take in the workspace a document of the site was saved with.
   * @default undefined — a document opens on its figure alone
   */
  onWorkspace?: OpenFigureOptions['onWorkspace'];
  /**
   * Keep the file of the folder just opened as the one Save writes over.
   * @param handle - The file.
   */
  keepInFile: (handle: FileSystemFileHandle) => void;
  /**
   * What is asked before a file, a saved document or an example replaces the
   * document on screen.
   * @default undefined — nothing is asked, Undo brings it back
   */
  confirmOpen?: ConfirmOpen;
  /**
   * The places the toolbar saves in, in this order.
   * @default ['folder', 'browser']
   */
  savePlaces?: readonly NamedTarget[];
  /**
   * Toolbar items after the save items: a save in this browser of its own.
   * @default undefined
   */
  afterSave?: ReactNode;
  /**
   * Toolbar items after Back up and Restore: a toggle of the site's.
   * @default undefined
   */
  afterBackup?: ReactNode;
  /**
   * Whether the panel starts with where the document on screen is kept.
   * @default !(empty && file === null)
   */
  placeLine?: boolean;
  /**
   * What the site's files end with, as the folder lists them.
   * @default the extensions of the saver's formats
   */
  extensions?: readonly string[];
  /**
   * The panel's frame.
   * @default PanelFrame
   */
  frame?: ComponentType<PanelFrameProps>;
  /**
   * Sections of the site's own, after the examples.
   * @default undefined
   */
  children?: ReactNode;
}

/**
 * The folder panel of an editor, as every editor of the family assembles it.
 * From the top: where the document on screen is, the drafts this browser
 * keeps as you work, the files of the folder Save keeps them in, those saved
 * in this browser under a name, then the examples to start from, all found
 * through one search. The toolbar saves the document on this computer or in
 * this browser, backs up and restores; the gear says where Ctrl+S keeps a new
 * document.
 * @param props - See {@link EditorFolderPanelProps}.
 * @returns The panel.
 */
export function EditorFolderPanel<D, E extends FolderExample>(
  props: EditorFolderPanelProps<D, E>,
): ReactElement {
  const { name, testId, site, saver, notify, empty, file } = props;
  const { backup: siteBackup, onOpen, onWorkspace, keepInFile } = props;
  const {
    savePlaces,
    afterSave,
    afterBackup,
    frame: Frame = PanelFrame,
  } = props;
  const t = useChromeT();
  // The file of the folder being opened, which Save writes over once it is.
  const opening = useRef<FileSystemFileHandle | null>(null);
  const backup = useSiteBackup(siteBackup);
  const saving = useSaveSettings(saver);
  const opener = useOpenFigure({
    site,
    onOpen: async (carried) => {
      await onOpen(carried);
      if (opening.current) keepInFile(opening.current);
    },
    ...(onWorkspace ? { onWorkspace } : {}),
  });
  return (
    <PanelSearch>
      <Frame
        testId={testId}
        toolbar={
          <>
            <Toolbar aria-label={t('editor.folder.actions', { name })}>
              <SaveToolbarItems
                saver={saver}
                notify={notify}
                disabled={empty}
                places={savePlaces}
              />
              {afterSave}
              <BackupToolbarItems actions={backup} />
              {afterBackup}
            </Toolbar>
            <FolderSearchField />
            <PanelCount />
            <PanelSettingsButton panel={name} {...saving.settings} />
          </>
        }
      >
        {saving.settings.isOpen ? (
          saving.view
        ) : (
          <FolderPanelSections
            {...props}
            file={file}
            onFolderFile={(opened, handle) => {
              opening.current = handle;
              void opener.open(opened).finally(() => {
                opening.current = null;
              });
            }}
          />
        )}
        {opener.dialog}
        {backup.dialogs}
      </Frame>
    </PanelSearch>
  );
}
