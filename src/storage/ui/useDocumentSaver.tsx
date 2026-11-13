import type { ReactElement } from 'react';
import { useState } from 'react';

import { SaveDocumentDialog } from '../../document/ui/SaveDocumentDialog.tsx';
import type { DocumentFormat } from '../../document/ui/saveDocumentTypes.ts';
import { useSaveShortcut } from '../../host/ui/useSaveShortcut.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type {
  DocumentSaver,
  SaveChoice,
  SaveOutcome,
} from '../core/documentSaverTypes.ts';
import { browserPicksFiles } from '../core/fileAccess.ts';

import { saveMessage } from './saveMessages.ts';
import { useSaveInPlace } from './useSaveInPlace.tsx';

/** How {@link useDocumentSaver} tells and asks. */
export interface DocumentSaverHookOptions {
  /** Say what a save did, in the site's status bar or toast. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /**
   * Save with Ctrl+S, or ⌘S on a Mac, and Save as with Shift added.
   * @default true
   */
  shortcut?: boolean;
  /**
   * Which of the view and the workspace a format holding them offers.
   * @default { view: true, workspace: true }
   */
  parts?: { view?: boolean; workspace?: boolean };
  /**
   * What keeping the view brings back, said under its box.
   * @default the chrome's own sentence
   */
  viewDescription?: string;
  /**
   * What keeping the workspace brings back, said under its box.
   * @default the chrome's own sentence
   */
  workspaceDescription?: string;
}

/** What {@link useDocumentSaver} gives a site. */
export interface DocumentSaverControls {
  /** Save: Ctrl+S, or a Save button. The first time, it asks where. */
  save: () => void;
  /** Save as: the name, the place and the format, every time. */
  saveAs: () => void;
  /** The dialog, to render beside the page. */
  dialog: ReactElement;
}

interface Asking {
  initial: SaveChoice;
  first: boolean;
  folderName?: string;
}

/**
 * Save and Save as, the same way on every site: the first Save of a site asks
 * where its documents are kept — a file, a folder, this browser or a download
 * each time — before anything is written or downloaded, and every later Save
 * goes there without a word. Save as asks again, and is how the place changes.
 * @param saver - The site's saver, from `createDocumentSaver`.
 * @param options - See {@link DocumentSaverHookOptions}.
 * @returns See {@link DocumentSaverControls}.
 */
export function useDocumentSaver<D>(
  saver: DocumentSaver<D>,
  options: DocumentSaverHookOptions,
): DocumentSaverControls {
  const { notify, shortcut = true, parts } = options;
  const { viewDescription, workspaceDescription } = options;
  const t = useChromeT();
  const [asking, setAsking] = useState<Asking | null>(null);
  const inPlace = useSaveInPlace(saver, notify);

  function ask(first: boolean): void {
    setAsking({ initial: saver.suggestion(), first });
    void saver.folder.current().then((folder) => {
      if (!folder) return;
      setAsking((open) => open && { ...open, folderName: folder.name });
    });
  }

  function report(outcome: SaveOutcome): void {
    if (outcome.kind === 'choose') {
      ask(true);
      return;
    }
    if (outcome.kind === 'name') {
      inPlace.ask(outcome.target);
      return;
    }
    const message = saveMessage(outcome, t);
    if (message) notify(message.text, message.intent);
  }

  function save(): void {
    void saver.save().then(report);
  }

  function saveAs(): void {
    ask(false);
  }

  useSaveShortcut(shortcut ? save : null, shortcut ? saveAs : null);

  const holdsParts = saver.formats.some((format) => format.holdsParts);
  const dialog = (
    <>
      {inPlace.dialog}
      <SaveDocumentDialog
        isOpen={asking !== null}
        title={asking?.first ? t('saving.chooseTitle') : undefined}
        onClose={() => {
          setAsking(null);
        }}
        formats={[
          dialogFormat(saver.formats[0], t),
          ...saver.formats.slice(1).map((format) => dialogFormat(format, t)),
        ]}
        initial={
          asking?.initial ?? {
            name: '',
            format: saver.formats[0].id,
            view: false,
            workspace: false,
          }
        }
        targets={saver.targets()}
        folderName={asking?.folderName}
        otherBrowserNote={!browserPicksFiles()}
        parts={holdsParts ? parts : { view: false, workspace: false }}
        viewDescription={viewDescription}
        workspaceDescription={workspaceDescription}
        onSave={(choice) => {
          setAsking(null);
          // Called in the click itself, so the browser still opens its picker.
          void saver
            .saveTo({ ...choice, target: choice.target ?? 'download' })
            .then(report);
        }}
      />
    </>
  );
  return { save, saveAs, dialog };
}

function dialogFormat(
  format: {
    id: string;
    label: string;
    extension: string;
    holdsParts?: boolean;
  },
  t: (key: string) => string,
): DocumentFormat {
  const { id, label, extension, holdsParts = false } = format;
  // A label that is no key of the catalog comes back as it was given.
  return { id, label: t(label), extension, holdsParts };
}
