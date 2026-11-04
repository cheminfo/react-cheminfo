import {
  Alert,
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  PopoverNext,
  Tag,
} from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useRef, useState, useSyncExternalStore } from 'react';

import { downloadText } from '../../download/core/downloadText.ts';
import { errorMessage } from '../../error/core/toError.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { workspaceFileName } from '../../storage/core/workspaceFile.ts';
import type { Workspaces } from '../../storage/core/workspaceTypes.ts';

/** What {@link WorkspaceBar} works on, and what it reports. */
export interface WorkspaceBarProps {
  /** The site's workspaces. */
  workspaces: Workspaces;
  /** Asks for a name: of a new workspace, or a new one for the active one. */
  onName: (kind: 'new' | 'rename') => void;
  /** Told why an action failed, or `null` once one went through. */
  onError: (message: string | null) => void;
}

/**
 * The workspace on screen, and what can be done with it: switch to another,
 * go back to it as saved, save it under a new name, rename or delete it, and
 * carry it to another browser as a file.
 * @param props - See {@link WorkspaceBarProps}.
 * @returns The bar.
 */
export function WorkspaceBar(props: WorkspaceBarProps): ReactElement {
  const { workspaces, onName, onError } = props;
  const t = useChromeT();
  const state = useSyncExternalStore(workspaces.subscribe, workspaces.getState);
  const inputRef = useRef<HTMLInputElement>(null);
  const [deleting, setDeleting] = useState(false);
  const { active, modified } = state;
  const own = active.source === 'user';

  function run(action: () => Promise<unknown>): void {
    action().then(
      () => onError(null),
      (error: unknown) => onError(errorMessage(error)),
    );
  }

  return (
    <div className="settings-dialog__workspace">
      <span className="settings-dialog__label">{t('settings.workspace')}</span>
      <PopoverNext
        placement="bottom-start"
        content={
          <Menu aria-label={t('settings.workspace')}>
            {state.workspaces.map((workspace) => (
              <MenuItem
                key={workspace.id}
                roleStructure="listoption"
                selected={workspace.id === active.id}
                text={workspace.name}
                label={
                  workspace.source === 'builtin'
                    ? t('settings.builtIn')
                    : undefined
                }
                onClick={() => run(() => workspaces.activate(workspace.id))}
              />
            ))}
            <MenuDivider />
            <MenuItem
              icon="add"
              text={t('settings.saveAs')}
              onClick={() => onName('new')}
            />
            <MenuItem
              icon="edit"
              text={t('settings.rename')}
              disabled={!own}
              onClick={() => onName('rename')}
            />
            <MenuItem
              icon="trash"
              intent="danger"
              text={t('settings.delete')}
              disabled={!own}
              onClick={() => setDeleting(true)}
            />
            <MenuDivider />
            <MenuItem
              icon="export"
              text={t('settings.export')}
              onClick={() => {
                downloadText(
                  workspaces.exportText(),
                  workspaceFileName(active.name, workspaces.site),
                  'application/json',
                );
              }}
            />
            <MenuItem
              icon="import"
              text={t('settings.import')}
              onClick={() => inputRef.current?.click()}
            />
          </Menu>
        }
      >
        <Button
          variant="outlined"
          endIcon="caret-down"
          text={active.name}
          title={t('settings.workspaceMenu')}
          data-testid="workspace-picker"
        />
      </PopoverNext>
      {active.source === 'builtin' ? (
        <Tag minimal>{t('settings.builtIn')}</Tag>
      ) : null}
      {modified ? (
        <Tag minimal intent="warning">
          {t('settings.modified')}
        </Tag>
      ) : null}
      <Button
        variant="minimal"
        icon="reset"
        disabled={!modified}
        aria-label={t('settings.reset')}
        title={t('settings.reset')}
        onClick={workspaces.reset}
      />
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) run(async () => workspaces.importText(await file.text()));
        }}
      />
      <Alert
        isOpen={deleting}
        intent="danger"
        icon="trash"
        confirmButtonText={t('settings.delete')}
        cancelButtonText={t('settings.cancel')}
        canEscapeKeyCancel
        canOutsideClickCancel
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          setDeleting(false);
          run(() => workspaces.remove(active.id));
        }}
      >
        {t('settings.deleteQuestion', { name: active.name })}
      </Alert>
    </div>
  );
}
