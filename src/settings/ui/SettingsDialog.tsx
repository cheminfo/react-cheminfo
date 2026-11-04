import {
  Button,
  Callout,
  Dialog,
  DialogFooter,
  Tab,
  Tabs,
} from '@blueprintjs/core';
import type { ReactElement, ReactNode, RefObject } from 'react';
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';

import { errorMessage } from '../../error/core/toError.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { Workspaces } from '../../storage/core/workspaceTypes.ts';

import { NameDialog } from './NameDialog.tsx';
import { WorkspaceBar } from './WorkspaceBar.tsx';

/** One section of the settings, listed down the left of the dialog. */
export interface SettingsTab {
  /** Its identifier, e.g. `panels`. */
  id: string;
  /** What the list of sections calls it. */
  title: string;
  /** What it shows. */
  content: ReactNode;
}

/** What {@link SettingsDialog} shows, and the workspaces it works on. */
export interface SettingsDialogProps {
  /** Whether the dialog is open. */
  isOpen: boolean;
  /** Called once the dialog closes, whichever way. */
  onClose: () => void;
  /** The sections, in the order they are listed. */
  tabs: readonly SettingsTab[];
  /** The site's workspaces: the preferences the sections change live in them. */
  workspaces: Workspaces;
  /**
   * The section shown when the dialog opens.
   * @default the first
   */
  initialTab?: string;
  /**
   * The dialog's title.
   * @default the chrome's word for settings, in the language of the page
   */
  title?: string;
}

/**
 * The settings of a site, in one dialog: the workspace at the top, the
 * sections down the left, the one picked beside them.
 *
 * A section changes the preferences as they are set, so the page behind the
 * dialog shows what a choice does before it is kept. Apply keeps the changes
 * on screen, Apply and save writes them into the workspace too — under a new
 * name when the workspace is one of the site's own — and Cancel, Escape or the
 * cross put the workspace and the preferences back as the dialog found them.
 * @param props - See {@link SettingsDialogProps}.
 * @returns The dialog.
 */
export function SettingsDialog(props: SettingsDialogProps): ReactElement {
  const { isOpen, onClose, title, tabs, workspaces, initialTab } = props;
  const t = useChromeT();
  const cancelRef = useRef<(() => void) | null>(null);
  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        if (cancelRef.current) cancelRef.current();
        else onClose();
      }}
      title={title ?? t('settings.title')}
      icon="cog"
      className="settings-dialog"
    >
      <SettingsBody
        tabs={tabs}
        workspaces={workspaces}
        initialTab={initialTab}
        onClose={onClose}
        cancelRef={cancelRef}
      />
    </Dialog>
  );
}

// Mounted each time the dialog opens, so Cancel returns to what it opened on.
function SettingsBody(
  props: Omit<SettingsDialogProps, 'isOpen' | 'title'> & {
    cancelRef: RefObject<(() => void) | null>;
  },
): ReactElement {
  const { workspaces, tabs, initialTab, onClose, cancelRef } = props;
  const t = useChromeT();
  const state = useSyncExternalStore(workspaces.subscribe, workspaces.getState);
  const [opening] = useState(() => ({
    id: workspaces.getState().active.id,
    preferences: workspaces.current(),
  }));
  const [tab, setTab] = useState(initialTab ?? tabs[0]?.id ?? '');
  const [naming, setNaming] = useState<{
    kind: 'new' | 'rename';
    thenClose: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function fail(thrown: unknown): void {
    setError(errorMessage(thrown));
  }

  function cancel(): void {
    const kept = workspaces
      .getState()
      .workspaces.some((workspace) => workspace.id === opening.id);
    if (kept) {
      workspaces.activate(opening.id).then(() => {
        workspaces.apply(opening.preferences);
      }, fail);
    }
    onClose();
  }

  function applyAndSave(): void {
    if (state.active.source === 'builtin') {
      setNaming({ kind: 'new', thenClose: true });
      return;
    }
    workspaces.save().then(onClose, fail);
  }

  function name(value: string): void {
    if (!naming) return;
    const { kind, thenClose } = naming;
    setNaming(null);
    const action =
      kind === 'new'
        ? workspaces.saveAs(value)
        : workspaces.rename(state.active.id, value);
    action.then(() => {
      setError(null);
      if (thenClose) onClose();
    }, fail);
  }

  useLayoutEffect(() => {
    cancelRef.current = cancel;
    return () => {
      cancelRef.current = null;
    };
  });

  return (
    <>
      <WorkspaceBar
        workspaces={workspaces}
        onName={(kind) => setNaming({ kind, thenClose: false })}
        onError={setError}
      />
      {error ? (
        <Callout compact intent="danger" className="settings-dialog__notice">
          {error}
        </Callout>
      ) : null}
      {state.ready && !state.stored ? (
        <Callout compact className="settings-dialog__notice">
          {t('settings.notStored')}
        </Callout>
      ) : null}
      <Tabs
        id="settings-sections"
        vertical
        animate={false}
        renderActiveTabPanelOnly
        selectedTabId={tab}
        onChange={(id) => setTab(String(id))}
        className="settings-dialog__tabs"
        aria-label={t('settings.sections')}
      >
        {tabs.map((section) => (
          <Tab
            key={section.id}
            id={section.id}
            title={section.title}
            panel={<>{section.content}</>}
          />
        ))}
      </Tabs>
      <DialogFooter
        actions={
          <>
            <Button
              variant="outlined"
              intent="danger"
              text={t('settings.cancel')}
              onClick={cancel}
            />
            <Button
              intent="success"
              text={t('settings.applyAndSave')}
              onClick={applyAndSave}
            />
            <Button
              intent="primary"
              text={t('settings.apply')}
              onClick={onClose}
            />
          </>
        }
      />
      <NameDialog
        isOpen={naming !== null}
        title={
          naming?.kind === 'rename'
            ? t('settings.renameTitle')
            : t('settings.newName')
        }
        initialName={naming?.kind === 'rename' ? state.active.name : ''}
        onSubmit={name}
        onClose={() => setNaming(null)}
      />
    </>
  );
}
