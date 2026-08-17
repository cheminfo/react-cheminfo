import { MenuDivider, MenuItem } from '@blueprintjs/core';
import { SvgLogoDoi } from 'cheminfo-font';
import type { CSSProperties, ReactElement } from 'react';

import { CITATION_DOWNLOADS } from '../core/formats.ts';
import { doiUrl } from '../core/reference.ts';
import type { CitedWork } from '../core/works.ts';

import { CopyFormatEntries } from './CopyFormatEntries.tsx';
import { DownloadEntry } from './entries.tsx';
import type { CopyFeedback } from './useCopyFeedback.ts';

const DOI_ICON_STYLE: CSSProperties = { width: 16, height: 16 };
const WHAT_STYLE: CSSProperties = { fontWeight: 600 };
// The sentence saying what citing the work credits, read under its name: it is
// a sentence, so it wraps rather than stretching the menu.
const NOTE_STYLE: CSSProperties = {
  maxWidth: 260,
  opacity: 0.7,
  fontSize: 11.5,
  lineHeight: 1.35,
  whiteSpace: 'normal',
};

export interface WorkEntryProps {
  /** The work, and what a reader is citing it for. */
  work: CitedWork;
  /** The copy action and the feedback of the menu this entry sits in. */
  feedback: CopyFeedback;
}

/**
 * One work of a site that asks for several: what it is, what citing it credits,
 * and a submenu holding the article at its DOI and that one reference on its
 * own — in the default style, the styles being offered on the whole set.
 * @param props - The work, and the feedback of its copy entries.
 * @returns The menu entry of the work.
 */
export function WorkEntry(props: WorkEntryProps): ReactElement {
  const { work, feedback } = props;
  const { reference, what, note } = work;
  const references = [reference];

  return (
    <MenuItem
      icon={<SvgLogoDoi style={DOI_ICON_STYLE} />}
      text={
        <span>
          <span style={WHAT_STYLE}>{what}</span>
          {note === undefined ? null : <div style={NOTE_STYLE}>{note}</div>}
        </span>
      }
      label={`${reference.journalAbbreviation} ${reference.year}`}
    >
      <MenuItem
        icon={<SvgLogoDoi style={DOI_ICON_STYLE} />}
        text="Open the article"
        label={reference.doi}
        href={doiUrl(reference)}
        target="_blank"
        rel="noreferrer"
      />
      <MenuDivider title="Copy this reference as" />
      <CopyFormatEntries
        references={references}
        feedback={feedback}
        keyPrefix={`${reference.doi}:`}
        styled={false}
      />
      <MenuDivider title="Import this reference" />
      {CITATION_DOWNLOADS.map((download) => (
        <DownloadEntry
          key={download.format}
          references={references}
          download={download}
        />
      ))}
    </MenuItem>
  );
}
