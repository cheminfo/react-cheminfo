import type { ReactElement, ReactNode } from 'react';

import type { StatusNotice } from '../../panel/core/statusNotice.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { DocumentFile } from '../../storage/core/documentFile.ts';
import type { DocumentSaver } from '../../storage/core/documentSaverTypes.ts';
import { DocumentPlaceLine } from '../../storage/ui/DocumentPlaceLine.tsx';

/** What {@link EditorStatusBar} is given. */
export interface EditorStatusBarProps<D> {
  /** The site's saver. */
  saver: DocumentSaver<D>;
  /** Where the document on screen is kept. */
  file: DocumentFile<D> | null;
  /** The document on screen. */
  live: D;
  /** Whether there is nothing on screen. */
  empty: boolean;
  /** Says what a move of the document did: the status line's `say`. */
  notify: (text: string, intent?: 'success' | 'danger') => void;
  /** What was just done, in place of the hint for a while. */
  notice: StatusNotice | null;
  /** What can be done with what is in hand or selected. */
  hint: ReactNode;
  /**
   * Whether the line says something went wrong while no notice does: plot's
   * problems with its data.
   * @default false
   */
  danger?: boolean;
  /**
   * Whether the line starts with where the document is kept.
   * @default !(empty && file === null) — a blank page never saved says nothing
   */
  placeLine?: boolean;
  /**
   * The zoom at the right end: `<ZoomControl>` from `react-cheminfo/drawing`.
   * @default undefined — none
   */
  zoom?: ReactNode;
  /**
   * What stands between the place line and the message: a run's log badge.
   * @default undefined
   */
  beforeMessage?: ReactNode;
  /**
   * What the line says after its message, before the zoom: a status read
   * aloud, counts, a credit.
   * @default undefined
   */
  children?: ReactNode;
  /**
   * `data-testid` of the message.
   * @default undefined
   */
  messageTestId?: string;
}

/**
 * The line under an editor's figure, as on every editor of the family: where
 * the document on screen is kept, then what was just done — or what can be
 * done with what is in hand — on one line that never wraps, then the zoom at
 * its right end.
 * @param props - See {@link EditorStatusBarProps}.
 * @returns The line.
 */
export function EditorStatusBar<D>(
  props: EditorStatusBarProps<D>,
): ReactElement {
  const { saver, file, live, empty, notify, notice, hint } = props;
  const { danger = false, placeLine = !(empty && file === null) } = props;
  const { zoom, beforeMessage, children, messageTestId } = props;
  return (
    <div className="editor-status no-print">
      {placeLine ? (
        <DocumentPlaceLine
          compact
          saver={saver}
          file={file}
          live={live}
          notify={notify}
        />
      ) : null}
      {beforeMessage}
      <span
        className={joinClassNames(
          'editor-status__message',
          (notice?.danger ?? danger) ? 'editor-status__message--danger' : '',
        )}
        role="status"
        data-testid={messageTestId}
      >
        {notice?.text ?? hint}
      </span>
      {children}
      {zoom}
    </div>
  );
}
