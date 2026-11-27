/**
 * The name of a spectrum in a viewer's list: a click works on the spectrum, a
 * double click renames it in place, because a name is what a chemist tells
 * scans apart by and a file's own titles are often the same string a dozen
 * times over.
 */

import { InputGroup } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useState } from 'react';

/** Props of {@link SpectrumNameCell}. */
export interface SpectrumNameCellProps {
  /** What the spectrum is called. */
  name: string;
  /** The line under the name, saying what kind of spectrum it is. */
  subtitle: string;
  /** Work on this spectrum. */
  onSelect: () => void;
  /**
   * Take the name typed.
   * @param name - The new name, trimmed and never empty.
   */
  onRename: (name: string) => void;
}

/**
 * The cell. Enter or leaving the box takes the name typed; Escape, or a box
 * left empty, abandons the rename, since a nameless spectrum could not be told
 * apart in the list.
 * @param props - See {@link SpectrumNameCellProps}.
 * @returns The name, or the box it is being renamed in.
 */
export function SpectrumNameCell(props: SpectrumNameCellProps): ReactElement {
  const { name, subtitle, onSelect, onRename } = props;
  const [draftName, setDraftName] = useState<string | null>(null);

  function commitRename(): void {
    const next = draftName?.trim() ?? '';
    setDraftName(null);
    if (next !== '') onRename(next);
  }

  if (draftName === null) {
    return (
      <button
        type="button"
        style={NAME_STYLE}
        title="Click to work on this spectrum, double click to rename it"
        onClick={onSelect}
        onDoubleClick={() => setDraftName(name)}
      >
        <span style={NAME_TEXT_STYLE}>{name}</span>
        <span style={SUBTITLE_STYLE}>{subtitle}</span>
      </button>
    );
  }
  return (
    <InputGroup
      autoFocus
      size="small"
      value={draftName}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      autoComplete="off"
      aria-label={`Name of ${name}`}
      onValueChange={setDraftName}
      onBlur={commitRename}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commitRename();
        if (event.key === 'Escape') setDraftName(null);
      }}
    />
  );
}

const NAME_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 1,
  flex: '1 1 1px',
  minWidth: 0,
  padding: '1px 2px',
  border: 'none',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  textAlign: 'left',
  cursor: 'pointer',
} as const;

/** One line, cut short rather than wrapped: the rows stay a fixed height. */
const NAME_TEXT_STYLE = {
  maxWidth: '100%',
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const SUBTITLE_STYLE = {
  maxWidth: '100%',
  fontSize: 10,
  lineHeight: 1.2,
  opacity: 0.7,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;
