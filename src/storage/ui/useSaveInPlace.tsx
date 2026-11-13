import type { ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { nameKey } from '../core/createSavedDocuments.ts';
import type { DocumentSaver, NamedTarget } from '../core/documentSaverTypes.ts';

import { DocumentNameDialog } from './DocumentNameDialog.tsx';
import { folderPathLabel, saveMessage } from './saveMessages.ts';

/** What {@link useSaveInPlace} gives: the question, and its dialog. */
export interface SaveInPlace {
  /**
   * Ask the name of the document on screen, then save it in that place.
   * @param target - The folder open in the panel, or this browser.
   */
  ask: (target: NamedTarget) => void;
  /** The name dialog, to render once beside the page. */
  dialog: ReactElement;
}

interface Asking {
  target: NamedTarget;
  name: string;
  taken: ReadonlyMap<string, string>;
  title: string;
}

/**
 * Save the document on screen in the folder or in this browser, under a name
 * asked first: the dialog says when the name already belongs to another
 * document there, and saving then replaces it. Ctrl+S asks this for a new
 * document, and the folder panel's save buttons too.
 * @param saver - The site's saver.
 * @param notify - Says what the save did.
 * @returns See {@link SaveInPlace}.
 */
export function useSaveInPlace<D>(
  saver: DocumentSaver<D>,
  notify: (text: string, intent?: 'success' | 'danger') => void,
): SaveInPlace {
  const t = useChromeT();
  const [asking, setAsking] = useState<Asking | null>(null);

  function ask(target: NamedTarget): void {
    const { name } = saver.suggestion();
    void Promise.all([
      saver.takenNames(target).catch(() => new Map<string, string>()),
      titleOf(target),
    ]).then(([taken, title]) => {
      setAsking({ target, name, taken, title });
    });
  }

  async function titleOf(target: NamedTarget): Promise<string> {
    if (target === 'browser') return t('documents.saveTitle');
    const root = await saver.folder.current();
    return root
      ? t('saving.nameInFolder', {
          folder: folderPathLabel(root.name, saver.folder.path()),
        })
      : t('saving.folder');
  }

  const dialog = (
    <DocumentNameDialog
      isOpen={asking !== null}
      mode="save"
      title={asking?.title}
      icon={asking?.target === 'folder' ? 'floppy-disk' : undefined}
      initialName={asking?.name ?? ''}
      taken={asking?.taken ?? new Map()}
      onSubmit={async (name) => {
        if (!asking) return;
        const outcome = await saver.saveTo({
          ...saver.suggestion(),
          name,
          target: asking.target,
          replace: asking.taken.has(nameKey(name)),
        });
        if (outcome.kind === 'failed') throw new Error(outcome.message);
        const message = saveMessage(outcome, t);
        if (message) notify(message.text, message.intent);
      }}
      onClose={() => {
        setAsking(null);
      }}
    />
  );
  return { ask, dialog };
}
