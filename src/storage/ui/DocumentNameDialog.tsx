import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  InputGroup,
} from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { errorMessage } from '../../error/core/toError.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { MAX_DOCUMENT_NAME, nameKey } from '../core/createSavedDocuments.ts';

/** Props of {@link DocumentNameDialog}. */
export interface DocumentNameDialogProps {
  /** Whether it is open. */
  isOpen: boolean;
  /** Whether it saves a document under the name or renames one. */
  mode: 'save' | 'rename';
  /** The name it opens on. */
  initialName: string;
  /**
   * The names other documents go by, by {@link nameKey}: saving under one
   * replaces that document, and renaming to one is refused.
   */
  taken: ReadonlyMap<string, string>;
  /** Saves or renames; a thrown error is shown in the dialog. */
  onSubmit: (name: string) => Promise<void>;
  /** Closes it. */
  onClose: () => void;
}

/**
 * The name a document is saved or renamed under, saying before anything
 * happens when that name already belongs to another document.
 * @param props - See {@link DocumentNameDialogProps}.
 * @returns The dialog.
 */
export function DocumentNameDialog(
  props: DocumentNameDialogProps,
): ReactElement {
  const { isOpen, mode, initialName, taken, onSubmit, onClose } = props;
  const t = useChromeT();
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'save' ? t('documents.saveTitle') : t('documents.renameTitle')
      }
      icon={mode === 'save' ? 'add-to-folder' : 'edit'}
    >
      {isOpen ? (
        <NameForm
          mode={mode}
          initialName={initialName}
          taken={taken}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  );
}

function NameForm(
  props: Omit<DocumentNameDialogProps, 'isOpen'>,
): ReactElement {
  const { mode, initialName, taken, onSubmit, onClose } = props;
  const t = useChromeT();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const field = useRef<HTMLInputElement>(null);
  // The dialog exists to type this, so the caret starts in it, the name selected.
  useEffect(() => {
    field.current?.focus();
    field.current?.select();
  }, []);
  const holder = taken.get(nameKey(name));
  const refused = mode === 'rename' && holder !== undefined;
  const empty = name.trim() === '';

  async function submit(): Promise<void> {
    if (empty || refused || busy) return;
    setBusy(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (error) {
      setFailure(errorMessage(error));
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <DialogBody>
        <label className="folder-panel__field">
          <span>{t('documents.name')}</span>
          <InputGroup
            inputRef={field}
            maxLength={MAX_DOCUMENT_NAME}
            value={name}
            onChange={(event) => {
              setName(event.currentTarget.value);
              setFailure(null);
            }}
          />
        </label>
        {holder === undefined ? null : (
          <p
            className={refused ? 'folder-panel__problem' : 'folder-panel__note'}
          >
            {refused
              ? t('documents.taken', { name: holder })
              : t('documents.replaces', { name: holder })}
          </p>
        )}
        {failure ? <p className="folder-panel__problem">{failure}</p> : null}
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button text={t('documents.cancel')} onClick={onClose} />
            <Button
              type="submit"
              intent="primary"
              loading={busy}
              disabled={empty || refused}
              title={empty ? t('documents.nameMissing') : undefined}
              text={
                mode === 'rename'
                  ? t('documents.rename')
                  : holder === undefined
                    ? t('documents.save')
                    : t('documents.replace')
              }
            />
          </>
        }
      />
    </form>
  );
}
