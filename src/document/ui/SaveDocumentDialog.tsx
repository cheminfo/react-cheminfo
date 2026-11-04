import {
  Button,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Radio,
  RadioGroup,
} from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useId, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

/** A format a site saves its documents in. */
export interface DocumentFormat {
  /** Its identifier, e.g. `document` or `svg`. */
  id: string;
  /** What the dialog calls it, e.g. `Drawing, with what you choose below`. */
  label: string;
  /** The extension its files take, e.g. `.draw.zip`. */
  extension: string;
  /** Whether it can carry the view and the workspace beside the data. */
  holdsParts: boolean;
}

/** What the visitor chose to save. */
export interface SaveDocumentChoice {
  /** The file's name, without its extension. */
  name: string;
  /** The format, by its identifier. */
  format: string;
  /** Keep the view with the data. */
  view: boolean;
  /** Keep the workspace with the data. */
  workspace: boolean;
}

/** What {@link SaveDocumentDialog} offers. */
export interface SaveDocumentDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
  /** Called with the choice when Save is pressed. */
  onSave: (choice: SaveDocumentChoice) => void;
  /** The formats offered, the usual one first. */
  formats: readonly [DocumentFormat, ...DocumentFormat[]];
  /** The choice the dialog opens on. */
  initial: SaveDocumentChoice;
  /**
   * What keeping the view brings back, said under its box.
   * @default the chrome's own sentence, in the language of the page
   */
  viewDescription?: string;
  /**
   * What keeping the workspace brings back, said under its box.
   * @default the chrome's own sentence, in the language of the page
   */
  workspaceDescription?: string;
}

/**
 * Save as: the file's name, its format, and whether the view and the workspace
 * go into it beside the data — so the file opens on exactly the panels and the
 * settings it was saved with, or on the reader's own.
 * @param props - See {@link SaveDocumentDialogProps}.
 * @returns The dialog.
 */
export function SaveDocumentDialog(
  props: SaveDocumentDialogProps,
): ReactElement {
  const { isOpen, ...form } = props;
  const { onClose } = form;
  const t = useChromeT();
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={t('document.title')}
      icon="floppy-disk"
      className="save-document-dialog"
    >
      <SaveDocumentForm {...form} />
    </Dialog>
  );
}

// Mounted each time the dialog opens, so it starts from the choice given.
function SaveDocumentForm(
  props: Omit<SaveDocumentDialogProps, 'isOpen'>,
): ReactElement {
  const { formats, initial, onSave, onClose } = props;
  const { viewDescription, workspaceDescription } = props;
  const t = useChromeT();
  const nameId = useId();
  const [choice, setChoice] = useState(initial);
  const format =
    formats.find((candidate) => candidate.id === choice.format) ?? formats[0];
  const name = choice.name.trim();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (name === '') return;
        onSave({
          name,
          format: format.id,
          view: format.holdsParts && choice.view,
          workspace: format.holdsParts && choice.workspace,
        });
      }}
    >
      <DialogBody>
        <FormGroup label={t('document.name')} labelFor={nameId}>
          <InputGroup
            id={nameId}
            className="input-affix"
            autoFocus
            spellCheck={false}
            value={choice.name}
            onValueChange={(value) => setChoice({ ...choice, name: value })}
            rightElement={<span>{format.extension}</span>}
          />
        </FormGroup>
        <RadioGroup
          label={t('document.format')}
          selectedValue={format.id}
          onChange={(event) =>
            setChoice({ ...choice, format: event.currentTarget.value })
          }
        >
          {formats.map((candidate) => (
            <Radio
              key={candidate.id}
              value={candidate.id}
              labelElement={
                <>
                  {candidate.label}{' '}
                  <span className="save-document-dialog__extension">
                    {candidate.extension}
                  </span>
                </>
              }
            />
          ))}
        </RadioGroup>
        <FormGroup label={t('document.include')} disabled={!format.holdsParts}>
          <Checkbox
            checked={format.holdsParts && choice.view}
            disabled={!format.holdsParts}
            onChange={() => setChoice({ ...choice, view: !choice.view })}
            labelElement={
              <Part
                label={t('document.view')}
                description={viewDescription ?? t('document.viewDescription')}
              />
            }
          />
          <Checkbox
            checked={format.holdsParts && choice.workspace}
            disabled={!format.holdsParts}
            onChange={() =>
              setChoice({ ...choice, workspace: !choice.workspace })
            }
            labelElement={
              <Part
                label={t('document.workspace')}
                description={
                  workspaceDescription ?? t('document.workspaceDescription')
                }
              />
            }
          />
        </FormGroup>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button text={t('document.cancel')} onClick={onClose} />
            <Button
              type="submit"
              intent="primary"
              icon="floppy-disk"
              text={t('document.save')}
              disabled={name === ''}
            />
          </>
        }
      />
    </form>
  );
}

function Part(props: { label: string; description: string }): ReactElement {
  return (
    <span className="save-document-dialog__part">
      <span>{props.label}</span>
      <span className="save-document-dialog__description">
        {props.description}
      </span>
    </span>
  );
}
