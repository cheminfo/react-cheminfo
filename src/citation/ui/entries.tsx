import type { IconName, Intent } from '@blueprintjs/core';
import { MenuItem, Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { downloadCitations } from '../core/download.ts';
import type { CitationDownload, CitationFormat } from '../core/formats.ts';
import type { Reference } from '../core/reference.ts';
import type { CitationStyle } from '../core/segments.ts';

import { CitationPreview } from './CitationPreview.tsx';

// An entry carrying its preview tooltip is also a popover target, and
// Blueprint's `.bp6-submenu .bp6-popover-target` then turns the row into a
// block, stacking the icon, the name and the journals. An inline rule outranks
// any selector, so the row survives wherever the entry is used.
const ENTRY_STYLE: CSSProperties = { display: 'flex' };
// Journal names are set in italic, as every one of these styles asks for.
const JOURNALS_STYLE: CSSProperties = { fontStyle: 'italic' };
// Long enough that running the pointer down the menu opens no preview.
const PREVIEW_OPEN_DELAY = 400;

/** Feedback shown on an entry just after it was clicked. */
export interface CopyState {
  icon: IconName;
  intent: Intent;
  label: string;
}

export interface CopyEntryProps {
  /** The works being cited, in reading order. */
  references: readonly Reference[];
  /** The format the entry copies. */
  format: CitationFormat;
  /**
   * Style of the entry, when it sits in the submenu of a styled format.
   * @default undefined
   */
  style?: CitationStyle;
  /** Feedback of the last copy, while it is showing. */
  state: CopyState | null;
  /** Called when the entry is clicked. */
  onCopy: () => void;
}

/**
 * One entry that copies, previewing on hover what it puts on the clipboard.
 * @param props - The references, the format, and the feedback showing.
 * @returns The menu entry.
 */
export function CopyEntry(props: CopyEntryProps): ReactElement {
  const { references, format, style, state, onCopy } = props;
  const entry = style ?? format;

  return (
    <PreviewTooltip references={references} format={format.id} style={style}>
      {(targetProps) => (
        <MenuItem
          {...targetProps}
          style={ENTRY_STYLE}
          icon={state?.icon ?? 'clipboard'}
          intent={state?.intent}
          text={entry.label}
          labelElement={
            // The hint of a style entry is a list of journals, in italic.
            style !== undefined && state === null ? (
              <span style={JOURNALS_STYLE}>{entry.hint}</span>
            ) : (
              (state?.label ?? entry.hint)
            )
          }
          shouldDismissPopover={false}
          onClick={onCopy}
        />
      )}
    </PreviewTooltip>
  );
}

export interface DownloadEntryProps {
  /** The works being saved, in reading order. */
  references: readonly Reference[];
  /** The file to write, from `CITATION_DOWNLOADS`. */
  download: CitationDownload;
}

/**
 * One entry saving the file a reference manager imports.
 * @param props - The entry options.
 * @returns The menu entry.
 */
export function DownloadEntry(props: DownloadEntryProps): ReactElement {
  const { references, download } = props;
  return (
    <PreviewTooltip references={references} format={download.format}>
      {(targetProps) => (
        <MenuItem
          {...targetProps}
          style={ENTRY_STYLE}
          icon="download"
          text={download.label}
          labelElement={download.hint}
          onClick={() => {
            downloadCitations(references, download);
          }}
        />
      )}
    </PreviewTooltip>
  );
}

/**
 * The hover preview of what an entry copies or saves.
 * @param props - The preview options.
 * @param props.references - The works being written.
 * @param props.format - The format the entry produces.
 * @param props.style - The journal style, for a format that has one.
 * @param props.children - The entry the preview is anchored on.
 * @returns The entry, wrapped in its preview tooltip.
 */
function PreviewTooltip(props: {
  references: readonly Reference[];
  format: CitationFormat['id'];
  style?: CitationStyle;
  children: (targetProps: Record<string, unknown>) => ReactElement;
}): ReactElement {
  const { references, format, style, children } = props;
  return (
    <Tooltip
      placement="left"
      popoverClassName="citation-tooltip"
      hoverOpenDelay={PREVIEW_OPEN_DELAY}
      content={
        <CitationPreview
          reference={references}
          format={format}
          style={style?.id}
        />
      }
      renderTarget={({ isOpen, ...targetProps }) => children(targetProps)}
    />
  );
}
