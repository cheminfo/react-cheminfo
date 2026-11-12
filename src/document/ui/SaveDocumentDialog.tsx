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

import { Described } from './Described.tsx';
import { SaveTargetGroup } from './SaveTargetGroup.tsx';
import type { SaveDocumentDialogProps } from './saveDocumentTypes.ts';

/**
 * Save as: the file's name, where it is kept, its format, and whether the view
 * and the workspace go into it beside the data — so the file opens on exactly
 * the panels and the settings it was saved with, or on the reader's own.
 * @param props - See {@link SaveDocumentDialogProps}.
 * @returns The dialog.
 */
export function SaveDocumentDialog(
  props: SaveDocumentDialogProps,
): ReactElement {
  const { isOpen, title, ...form } = props;
  const { onClose } = form;
  const t = useChromeT();
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? t('document.title')}
      icon="floppy-disk"
      className="save-document-dialog"
    >
      <SaveDocumentForm {...form} />
    </Dialog>
  );
}

// Mounted each time the dialog opens, so it starts from the choice given.
function SaveDocumentForm(
  props: Omit<SaveDocumentDialogProps, 'isOpen' | 'title'>,
): ReactElement {
  const { formats, initial, onSave, onClose, targets = [] } = props;
  const { viewDescription, workspaceDescription, parts = {} } = props;
  const { folderName, otherBrowserNote = false } = props;
  const { view: offersView = true, workspace: offersWorkspace = true } = parts;
  const t = useChromeT();
  const nameId = useId();
  const [choice, setChoice] = useState(initial);
  const format =
    formats.find((candidate) => candidate.id === choice.format) ?? formats[0];
  const name = choice.name.trim();
  // What is kept in this browser is the document itself, in no format.
  const inBrowser = choice.target === 'browser';
  const offersParts = !inBrowser && (offersView || offersWorkspace);
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (name === '') return;
        onSave({
          name,
          format: format.id,
          view: offersView && format.holdsParts && choice.view,
          workspace: offersWorkspace && format.holdsParts && choice.workspace,
          ...(choice.target ? { target: choice.target } : {}),
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
            rightElement={
              inBrowser ? undefined : <span>{format.extension}</span>
            }
          />
        </FormGroup>
        {targets.length > 1 || otherBrowserNote ? (
          <SaveTargetGroup
            targets={targets}
            selected={choice.target ?? targets[0] ?? 'download'}
            onSelect={(target) => setChoice({ ...choice, target })}
            folderName={folderName}
            otherBrowserNote={otherBrowserNote}
          />
        ) : null}
        {inBrowser ? null : (
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
        )}
        {offersParts ? (
          <FormGroup
            label={t('document.include')}
            disabled={!format.holdsParts}
          >
            {offersView ? (
              <Checkbox
                checked={format.holdsParts && choice.view}
                disabled={!format.holdsParts}
                onChange={() => setChoice({ ...choice, view: !choice.view })}
                labelElement={
                  <Described
                    label={t('document.view')}
                    description={
                      viewDescription ?? t('document.viewDescription')
                    }
                  />
                }
              />
            ) : null}
            {offersWorkspace ? (
              <Checkbox
                checked={format.holdsParts && choice.workspace}
                disabled={!format.holdsParts}
                onChange={() =>
                  setChoice({ ...choice, workspace: !choice.workspace })
                }
                labelElement={
                  <Described
                    label={t('document.workspace')}
                    description={
                      workspaceDescription ?? t('document.workspaceDescription')
                    }
                  />
                }
              />
            ) : null}
          </FormGroup>
        ) : null}
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
