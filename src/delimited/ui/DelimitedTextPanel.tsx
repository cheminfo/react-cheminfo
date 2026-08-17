import { Button, Callout, SegmentedControl } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { CopyButton } from '../../clipboard/ui/CopyButton.tsx';
import { downloadText } from '../../download/core/downloadText.ts';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import type { DelimiterId } from '../core/delimiters.ts';
import { DELIMITER_CHOICES, delimiterChoice } from '../core/delimiters.ts';
import { toDelimited } from '../core/toDelimited.ts';

/** What a table handed over as text needs. */
export interface DelimitedTextPanelProps {
  /** The cells, one array per line. */
  rows: ReadonlyArray<readonly string[]>;
  /**
   * Column names, written as the first line.
   * @default undefined — the table is handed over without a header line
   */
  header?: readonly string[];
  /**
   * What the visitor is told above the text. A sentence naming what the table
   * holds beats the generic one, which only counts the rows.
   * @default a line saying how many rows there are and what to do with them
   */
  description?: ReactNode;
  /**
   * Base name of the saved file, without the extension — the extension follows
   * the chosen separator.
   * @default 'table'
   */
  fileName?: string;
  /**
   * Which separator the panel opens on.
   * @default 'tab'
   */
  defaultDelimiter?: DelimiterId;
  /**
   * Whether a save button is offered beside the copy one.
   * @default true
   */
  downloadable?: boolean;
  /**
   * What the text area is called, for a screen reader reaching it.
   * @default 'The table, as text'
   */
  label?: string;
  /**
   * Height of the text area, in pixels.
   * @default 320
   */
  height?: number;
}

/**
 * A whole table as text: read it, copy it, or save it.
 *
 * The text is shown rather than only downloaded, because a visitor can read
 * what is being copied and because a page framed in a course site often cannot
 * start a download at all. Every cell is escaped for the separator in force, so
 * the file a spreadsheet opens holds the columns the page shows.
 * @param props - See {@link DelimitedTextPanelProps}.
 * @returns The panel.
 */
export function DelimitedTextPanel(
  props: DelimitedTextPanelProps,
): ReactElement {
  const {
    rows,
    header,
    description,
    fileName = 'table',
    defaultDelimiter = 'tab',
    downloadable = true,
    label = 'The table, as text',
    height = 320,
  } = props;
  const [delimiterId, setDelimiterId] = useState<string>(defaultDelimiter);

  const choice = delimiterChoice(delimiterId);
  const text = useMemo(
    () => toDelimited(rows, { delimiter: choice.delimiter, header }),
    [rows, header, choice.delimiter],
  );

  return (
    <div className="delimited-text">
      <Callout intent="primary" compact icon="info-sign">
        {description ?? defaultDescription(rows.length)}
      </Callout>
      <div style={CONTROLS_STYLE}>
        <span style={LABEL_STYLE}>Separator</span>
        <SegmentedControl
          size="small"
          options={DELIMITER_CHOICES.map((option) => ({
            label: option.label,
            value: option.id,
          }))}
          value={choice.id}
          onValueChange={setDelimiterId}
        />
        <span style={SPACER_STYLE} />
        {downloadable ? (
          <Button
            icon="download"
            text="Save"
            size="small"
            onClick={() =>
              downloadText(
                text,
                `${sanitizeFileName(fileName, 'table')}.${choice.extension}`,
                `${choice.mimeType};charset=utf-8`,
              )
            }
          />
        ) : null}
        <CopyButton content={text} label="Copy" icon="clipboard" small />
      </div>
      <textarea
        readOnly
        value={text}
        spellCheck={false}
        aria-label={label}
        className="bp6-input"
        style={{ ...TEXT_STYLE, height }}
        onFocus={(event) => event.currentTarget.select()}
      />
    </div>
  );
}

function defaultDescription(rowCount: number): string {
  const rows = rowCount === 1 ? '1 row' : `${rowCount.toLocaleString()} rows`;
  return `${rows}, one per line. Copy them, then paste into a spreadsheet.`;
}

const CONTROLS_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  marginTop: 12,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  color: '#5f6b7c',
  fontSize: 12,
} as const satisfies CSSProperties;

const SPACER_STYLE = { flex: 1 } as const satisfies CSSProperties;

const TEXT_STYLE = {
  width: '100%',
  marginTop: 12,
  boxSizing: 'border-box',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  overflowX: 'auto',
  overflowWrap: 'normal',
  whiteSpace: 'pre',
} as const satisfies CSSProperties;
