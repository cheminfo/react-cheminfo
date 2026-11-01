import { Alert } from '@blueprintjs/core';
import type { ChangeEvent, ReactElement } from 'react';
import { useRef, useState } from 'react';

import { errorMessage } from '../../error/core/toError.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

/** What backing up and restoring do on a site. */
export interface BackupRestoreOptions {
  /** Downloads one file holding everything the site stores. */
  onBackup: () => Promise<void>;
  /**
   * Reads a backup into storage, or refuses it whole by throwing a sentence
   * that says why.
   * @returns The sentence the visitor reads after it: what was restored, and
   * what was kept.
   */
  onRestore: (file: File) => Promise<string>;
  /** The files the chooser offers, as the input's `accept`, e.g. `.json`. */
  accept: string;
  /**
   * Shows why a backup or a restore failed.
   * @default an alert of its own
   */
  onError?: (message: string) => void;
}

/** The two actions, for a site to put in its own toolbar or menu. */
export interface BackupRestore {
  /** Take a backup. */
  backup: () => void;
  /** Ask for a backup file, then restore it. */
  restore: () => void;
  /** Whether a backup or a restore is running. */
  busy: boolean;
  /** The file chooser and the alerts: render them once, anywhere. */
  dialogs: ReactElement;
}

/**
 * Back up and restore what a site stores, with the file chooser and the
 * alerts that say what happened. `<BackupMenu>` is this behind one button; a
 * site whose actions live in a toolbar calls the hook and draws its own.
 * @param options - See {@link BackupRestoreOptions}.
 * @returns See {@link BackupRestore}.
 */
export function useBackupRestore(options: BackupRestoreOptions): BackupRestore {
  const { onBackup, onRestore, accept, onError } = options;
  const t = useChromeT();
  const input = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{
    intent: 'success' | 'danger';
    text: string;
  } | null>(null);

  function fail(text: string): void {
    if (onError) onError(text);
    else setNotice({ intent: 'danger', text });
  }

  async function backup(): Promise<void> {
    setBusy(true);
    try {
      await onBackup();
    } catch (error) {
      fail(t('storage.backupFailed', { message: errorMessage(error) }));
    } finally {
      setBusy(false);
    }
  }

  async function restore(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.currentTarget.files?.[0];
    // Cleared at once, so picking the same file again is heard again.
    event.currentTarget.value = '';
    if (!file) return;
    setBusy(true);
    try {
      setNotice({ intent: 'success', text: await onRestore(file) });
    } catch (error) {
      fail(t('storage.restoreFailed', { message: errorMessage(error) }));
    } finally {
      setBusy(false);
    }
  }

  return {
    backup: () => {
      void backup();
    },
    restore: () => {
      input.current?.click();
    },
    busy,
    dialogs: (
      <>
        <input
          ref={input}
          type="file"
          accept={accept}
          hidden
          onChange={(event) => {
            void restore(event);
          }}
        />
        <Alert
          isOpen={notice !== null}
          intent={notice?.intent}
          icon={notice?.intent === 'danger' ? 'error' : 'import'}
          confirmButtonText={t('storage.close')}
          canEscapeKeyCancel
          canOutsideClickCancel
          onClose={() => {
            setNotice(null);
          }}
        >
          <p>{notice?.text}</p>
        </Alert>
      </>
    ),
  };
}
