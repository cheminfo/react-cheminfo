import { Button, Callout, Classes, SegmentedControl } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { CopyButton } from '../../clipboard/ui/CopyButton.tsx';
import { downloadText } from '../../download/core/downloadText.ts';
import { sanitizeFileName } from '../../download/core/sanitizeFileName.ts';
import { formatInteger } from '../../format/core/numbers.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
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
  /**
   * Class names added to the root element, after the component's own.
   * @default undefined
   */
  className?: string;
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
    className,
    rows,
    header,
    description,
    fileName = 'table',
    defaultDelimiter = 'tab',
    downloadable = true,
    label,
    height = 320,
  } = props;
  const t = useChromeT();
  const [delimiterId, setDelimiterId] = useState<string>(defaultDelimiter);

  const choice = delimiterChoice(delimiterId);
  const text = useMemo(
    () => toDelimited(rows, { delimiter: choice.delimiter, header }),
    [rows, header, choice.delimiter],
  );

  return (
    <div className={joinClassNames('delimited-text', className)}>
      <Callout intent="primary" compact icon="info-sign">
        {description ??
          t(
            rows.length === 1
              ? 'delimited.descriptionOne'
              : 'delimited.descriptionMany',
            { count: formatInteger(rows.length) },
          )}
      </Callout>
      <div style={CONTROLS_STYLE}>
        <span style={LABEL_STYLE}>{t('delimited.separator')}</span>
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
            text={t('delimited.save')}
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
        <CopyButton
          content={text}
          label={t('delimited.copy')}
          icon="clipboard"
          small
        />
      </div>
      <textarea
        readOnly
        value={text}
        spellCheck={false}
        aria-label={label ?? t('delimited.tableAsText')}
        className={Classes.INPUT}
        style={{ ...TEXT_STYLE, height }}
        onFocus={(event) => event.currentTarget.select()}
      />
    </div>
  );
}

const CONTROLS_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  marginTop: 12,
} as const satisfies CSSProperties;

const LABEL_STYLE = {
  color: TOKEN.textMuted,
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
