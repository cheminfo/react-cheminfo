import { Button, Classes, Dialog, DialogFooter, Icon } from '@blueprintjs/core';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { ConfirmButton } from '../../confirm/ui/ConfirmButton.tsx';
import {
  createInstrument,
  putInstrument,
  removeInstrument,
} from '../core/instrumentEdits.ts';
import type { XpsInstrument } from '../core/xpsInstrument.ts';
import {
  findInstrument,
  isBuiltInInstrument,
  xpsInstruments,
} from '../core/xpsInstrument.ts';

import { InstrumentEditor } from './InstrumentEditor.tsx';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

export interface XpsSettingsDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Called once it closes. */
  onClose: () => void;
}

/**
 * The instruments a survey can be quantified for, and their factors.
 *
 * The list on the left is every instrument on offer: the one the viewer ships,
 * which nobody edits, then the reader's own. The one on the right is edited in
 * place and every change is kept at once — in the workspace, and in this
 * browser — so there is nothing to apply and nothing to lose by closing. An
 * instrument of one's own starts empty, or as a copy of another to correct.
 * @param props - Component props.
 * @returns The dialog.
 */
export function XpsSettingsDialog(props: XpsSettingsDialogProps): ReactNode {
  const { isOpen, onClose } = props;
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const { instrumentId, instruments } = state.settings;

  const [shownId, setShownId] = useState(instrumentId);
  const shown = findInstrument(instruments, shownId);
  const editable = !isBuiltInInstrument(shown.id);

  function keep(next: XpsInstrument[], show?: string): void {
    actions.setSettings({ instruments: next });
    if (show !== undefined) setShownId(show);
  }

  function add(instrument: XpsInstrument): void {
    keep(putInstrument(instruments, instrument), instrument.id);
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onOpening={() => setShownId(instrumentId)}
      title="Instruments"
      icon="cog"
      style={dialogStyle}
    >
      <div className={Classes.DIALOG_BODY} style={bodyStyle}>
        <nav style={listStyle} aria-label="Instruments">
          {xpsInstruments(instruments).map((instrument) => (
            <Button
              key={instrument.id}
              variant="minimal"
              alignText="start"
              active={instrument.id === shown.id}
              icon={isBuiltInInstrument(instrument.id) ? 'lock' : 'edit'}
              endIcon={
                instrument.id === instrumentId ? (
                  <Icon icon="tick" title="Quantifies the surveys" />
                ) : undefined
              }
              text={instrument.name.trim() || 'Unnamed instrument'}
              onClick={() => setShownId(instrument.id)}
            />
          ))}
          <div style={listActionsStyle}>
            <Button
              size="small"
              icon="add"
              text="New"
              onClick={() => add(createInstrument('New instrument'))}
            />
            <Button
              size="small"
              icon="duplicate"
              text="Copy"
              onClick={() =>
                add({
                  ...createInstrument(`${shown.name} (copy)`, [
                    ...shown.factors,
                  ]),
                  // Where the factors came from travels with them.
                  ...(shown.description === undefined
                    ? {}
                    : { description: shown.description }),
                })
              }
            />
            {editable ? (
              <ConfirmButton
                size="small"
                icon="trash"
                intent="danger"
                text="Delete"
                question={`Delete ${shown.name} and its ${shown.factors.length} factors? Surveys quantified with it go back to the default instrument.`}
                confirmLabel="Delete"
                onConfirm={() => keep(removeInstrument(instruments, shown.id))}
              />
            ) : null}
          </div>
        </nav>

        <InstrumentEditor
          instrument={shown}
          editable={editable}
          selected={shown.id === instrumentId}
          onSelect={() => actions.setSettings({ instrumentId: shown.id })}
          onChange={(instrument) =>
            keep(putInstrument(instruments, instrument))
          }
        />
      </div>
      <DialogFooter actions={<Button text="Close" onClick={onClose} />} />
    </Dialog>
  );
}

const dialogStyle = { width: 760, maxWidth: 'calc(100vw - 32px)' } as const;

const bodyStyle = {
  display: 'flex',
  gap: 12,
  minHeight: 420,
  maxHeight: '70vh',
} as const;

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: '0 0 210px',
  overflowY: 'auto',
} as const;

const listActionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 4,
  marginTop: 8,
} as const;
