import { Button, Divider } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import { ConfirmButton } from '../../confirm/ui/ConfirmButton.tsx';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import type { FigureDownloadProps } from '../../download/ui/FigureDownload.tsx';
import { FigureDownload } from '../../download/ui/FigureDownload.tsx';
import { OpenFigureButton } from '../../host/ui/OpenFigureButton.tsx';
import type { OpenFigureOptions } from '../../host/ui/useOpenFigure.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { DocumentFile } from '../../storage/core/documentFile.ts';
import type { DocumentSaver } from '../../storage/core/documentSaverTypes.ts';
import type { DocumentSaverHookOptions } from '../../storage/ui/useDocumentSaver.tsx';
import { useDocumentSaver } from '../../storage/ui/useDocumentSaver.tsx';

import { filled, separated } from './barGroups.tsx';

/** Undo and Redo, as the site's history offers them. */
export interface EditorHistory {
  /** Whether there is a step to undo. */
  canUndo: boolean;
  /** Whether there is a step to redo. */
  canRedo: boolean;
  /** Undo the last step. */
  undo: () => void;
  /** Redo the step undone. */
  redo: () => void;
}

/** The button taking the selection away. */
export interface EditorRemove {
  /** Whether there is nothing selected to take away. */
  disabled: boolean;
  /** Take the selection away. */
  onClick: () => void;
  /**
   * What names it to a screen reader.
   * @default the chrome's `Delete the selection`
   */
  label?: string;
  /**
   * What the pointer is told.
   * @default the chrome's `Delete the selection (Delete)`
   */
  title?: string;
}

/** The button taking everything away, after asking. */
export interface EditorClear {
  /** What the pointer is told: `Clear the bench`. */
  title: string;
  /** What the alert asks: `Clear the bench? Undo brings it back.` */
  question: ReactNode;
  /** The verb of the alert's button: `Clear the bench`. */
  confirmLabel: string;
  /** Take everything away. */
  onConfirm: () => void;
  /**
   * What names it to a screen reader, in place of its text `Clear`.
   * @default undefined — the text names it
   */
  label?: string;
  /**
   * Whether there is nothing to take away.
   * @default the bar's `empty`
   */
  disabled?: boolean;
}

/** What {@link EditorFileBar} is given. */
export interface EditorFileBarProps<D> {
  /** The site the figures belong to, `TOOL.name`. */
  site: string;
  /** The site's saver. */
  saver: DocumentSaver<D>;
  /** Says what a save or an open did: the status line's `say`. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /** Where the document on screen is kept, which names its picture. */
  file: DocumentFile<D> | null;
  /** Whether there is nothing on screen: Save as greys out, the picture goes. */
  empty: boolean;
  /** Show a figure of the site, opened from a file. */
  onOpen: OpenFigureOptions['onOpen'];
  /**
   * Take in the workspace a document of the site was saved with.
   * @default undefined — a document opens on its figure alone
   */
  onWorkspace?: OpenFigureOptions['onWorkspace'];
  /**
   * The picture button: what it writes and how; null for none.
   * `fileName` defaults to the document's name, else `stem`, and
   * `defaultFormat` to `svg`.
   */
  download: Partial<FigureDownloadProps> | null;
  /**
   * Whether the picture button is shown now.
   * @default !empty
   */
  downloadShown?: boolean;
  /**
   * What a picture of a document never saved is named after.
   * @default 'figure'
   */
  stem?: string;
  /**
   * Whether Open and Save as are offered: not on a lesson's figure, which is
   * no document of the visitor's.
   * @default true
   */
  documents?: boolean;
  /**
   * Whether Ctrl+S and Shift+Ctrl+S save.
   * @default the value of `documents`
   */
  shortcut?: boolean;
  /**
   * What Save as offers to keep beside the figure.
   * @default undefined — the saver's own choice
   */
  saveParts?: DocumentSaverHookOptions['parts'];
  /**
   * What the pointer is told on Save as, naming what is saved.
   * @default the chrome's sentence about a figure
   */
  saveAsTitle?: string;
  /**
   * Undo and Redo; null for an editor that keeps no history.
   * @default null
   */
  history?: EditorHistory | null;
  /**
   * The button taking the selection away; null for none.
   * @default null
   */
  remove?: EditorRemove | null;
  /**
   * The button taking everything away; null for none.
   * @default null
   */
  clear?: EditorClear | null;
  /**
   * Buttons after Open, before Save as: plot's Import data and Paste table.
   * @default undefined
   */
  afterOpen?: ReactNode;
  /**
   * Buttons after Redo: diagram's Type as text, the clock of a bench.
   * @default undefined
   */
  afterHistory?: ReactNode;
  /**
   * Buttons before Delete: diagram's Duplicate.
   * @default undefined
   */
  beforeRemove?: ReactNode;
  /**
   * Buttons after Delete: Group and Ungroup.
   * @default undefined
   */
  afterRemove?: ReactNode;
  /**
   * What the right end of the bar holds: the settings gear, plate's New plate.
   * @default undefined
   */
  end?: ReactNode;
  /**
   * Whether the bar is drawn; the saver, its keys and its dialog stay.
   * @default true
   */
  shown?: boolean;
  /**
   * Classes beside the bar's own `editor-file-bar`.
   * @default undefined
   */
  className?: string;
}

/**
 * The bar above an editor's figure, as on every editor of the family: open a
 * figure saved from the site, save it — Ctrl+S where the visitor chose the
 * first time, Save as with a name and a place — take it as a picture, undo and
 * redo, take the selection or everything away. A site passes what it holds
 * and the buttons of its own, each in its slot; the groups are divided by a
 * rule, and an empty group leaves none.
 * @param props - See {@link EditorFileBarProps}.
 * @returns The bar, and the dialog Save as opens.
 */
export function EditorFileBar<D>(props: EditorFileBarProps<D>): ReactElement {
  const { site, saver, notify, file, empty, onOpen, onWorkspace } = props;
  const { download, downloadShown = !empty, stem = 'figure' } = props;
  const {
    documents = true,
    shortcut = documents,
    saveParts,
    saveAsTitle,
  } = props;
  const { history = null, remove = null, clear = null } = props;
  const { afterOpen, afterHistory, beforeRemove, afterRemove, end } = props;
  const { shown = true, className } = props;
  const t = useChromeT();
  const saving = useDocumentSaver(saver, {
    notify,
    shortcut,
    ...(saveParts ? { parts: saveParts } : {}),
  });
  if (!shown) return saving.dialog;

  const fileName = sanitizeFileName(file?.savedId ? file.name : stem, stem);
  const files = filled([
    documents ? (
      <OpenFigureButton
        key="open"
        site={site}
        onOpen={onOpen}
        onWorkspace={onWorkspace}
        size="small"
        variant="minimal"
      />
    ) : null,
    afterOpen,
    documents ? (
      <Button
        key="save-as"
        size="small"
        variant="minimal"
        icon="floppy-disk"
        text={t('editor.fileBar.saveAs')}
        title={saveAsTitle ?? t('editor.fileBar.saveAsTitle')}
        disabled={empty}
        onClick={saving.saveAs}
      />
    ) : null,
    download !== null && downloadShown ? (
      <FigureDownload
        key="picture"
        fileName={fileName}
        defaultFormat="svg"
        {...download}
      />
    ) : null,
  ]);
  const steps = history
    ? filled([<HistoryButtons key="history" history={history} />, afterHistory])
    : [];
  const edits = filled([
    beforeRemove,
    remove ? <RemoveButton key="remove" remove={remove} /> : null,
    afterRemove,
    clear ? <ClearButton key="clear" clear={clear} empty={empty} /> : null,
  ]);
  return (
    <div
      className={joinClassNames('editor-file-bar no-print', className)}
      role="toolbar"
      aria-label={t('editor.fileBar.label')}
    >
      {separated([files, steps, edits], <Divider />)}
      {end === undefined || end === null ? null : (
        <>
          <span className="editor-file-bar__spacer" />
          {end}
        </>
      )}
      {saving.dialog}
    </div>
  );
}

function HistoryButtons(props: { history: EditorHistory }): ReactElement {
  const { canUndo, canRedo, undo, redo } = props.history;
  const t = useChromeT();
  return (
    <>
      <Button
        size="small"
        variant="minimal"
        icon="undo"
        aria-label={t('editor.fileBar.undo')}
        title={t('editor.fileBar.undoTitle')}
        disabled={!canUndo}
        onClick={undo}
      />
      <Button
        size="small"
        variant="minimal"
        icon="redo"
        aria-label={t('editor.fileBar.redo')}
        title={t('editor.fileBar.redoTitle')}
        disabled={!canRedo}
        onClick={redo}
      />
    </>
  );
}

function RemoveButton(props: { remove: EditorRemove }): ReactElement {
  const { disabled, onClick, label, title } = props.remove;
  const t = useChromeT();
  return (
    <Button
      size="small"
      variant="minimal"
      icon="trash"
      aria-label={label ?? t('editor.fileBar.delete')}
      title={title ?? t('editor.fileBar.deleteTitle')}
      disabled={disabled}
      onClick={onClick}
    />
  );
}

function ClearButton(props: {
  clear: EditorClear;
  empty: boolean;
}): ReactElement {
  const { clear, empty } = props;
  const t = useChromeT();
  return (
    <ConfirmButton
      size="small"
      variant="minimal"
      icon="eraser"
      text={t('editor.fileBar.clear')}
      aria-label={clear.label}
      title={clear.title}
      disabled={clear.disabled ?? empty}
      question={clear.question}
      confirmLabel={clear.confirmLabel}
      onConfirm={clear.onConfirm}
    />
  );
}
