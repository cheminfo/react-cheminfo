import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
} from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useId, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

/** What {@link NameDialog} asks for, and what it does with the answer. */
export interface NameDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** What is being named, as the dialog's title. */
  title: string;
  /** The name the field starts with. */
  initialName: string;
  /** Called with the name typed, trimmed and never empty. */
  onSubmit: (name: string) => void;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
}

/**
 * Ask for a name — of a new workspace, or a new one for an old workspace.
 * @param props - See {@link NameDialogProps}.
 * @returns The dialog.
 */
export function NameDialog(props: NameDialogProps): ReactElement {
  const { isOpen, title, initialName, onSubmit, onClose } = props;
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="settings-name-dialog"
    >
      <NameForm
        initialName={initialName}
        onSubmit={onSubmit}
        onClose={onClose}
      />
    </Dialog>
  );
}

// Mounted each time the dialog opens, so the field starts from the name given.
function NameForm(
  props: Pick<NameDialogProps, 'initialName' | 'onSubmit' | 'onClose'>,
): ReactElement {
  const { initialName, onSubmit, onClose } = props;
  const t = useChromeT();
  const id = useId();
  const [name, setName] = useState(initialName);
  const trimmed = name.trim();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (trimmed !== '') onSubmit(trimmed);
      }}
    >
      <DialogBody>
        <FormGroup label={t('settings.nameLabel')} labelFor={id}>
          <InputGroup
            id={id}
            autoFocus
            value={name}
            onValueChange={setName}
            spellCheck={false}
          />
        </FormGroup>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button text={t('settings.cancel')} onClick={onClose} />
            <Button
              type="submit"
              intent="primary"
              text={t('settings.save')}
              disabled={trimmed === ''}
            />
          </>
        }
      />
    </form>
  );
}
