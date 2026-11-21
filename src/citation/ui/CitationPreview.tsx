import { Spinner } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useMemo } from 'react';

import { useAsync } from '../../hooks/ui/useAsync.ts';
import type { CitationFormatId } from '../core/formats.ts';
import { formatEach } from '../core/formats.ts';
import type { Reference } from '../core/reference.ts';
import { formatCitations } from '../core/works.ts';

import { CitationHtml } from './CitationHtml.tsx';

// A BibTeX entry and a one-line citation share this box, so the text wraps and
// the box never grows past what a tooltip can hold. The height is the last
// resort, for a window too short to show an entry whole.
const PREVIEW_STYLE: CSSProperties = {
  maxWidth: 440,
  maxHeight: '70vh',
  overflow: 'auto',
  margin: 0,
  color: '#e5e8eb',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11.5,
  lineHeight: 1.45,
  whiteSpace: 'pre-wrap',
  overflowWrap: 'anywhere',
};
// HTML is previewed as it reads once pasted, so it takes the reading font.
const RICH_STYLE: CSSProperties = {
  maxWidth: 440,
  color: '#e5e8eb',
  fontSize: 12,
  lineHeight: 1.45,
};
// Two references pasted as HTML read as two lines, and preview as two.
const RICH_LINE_STYLE: CSSProperties = { marginTop: 6 };

export interface CitationPreviewProps {
  /** The work, or the works, whose citation is previewed. */
  reference: Reference | readonly Reference[];
  format: CitationFormatId;
  /**
   * The CSL style of a format written as a journal writes it.
   * @default 'american-chemical-society'
   */
  style?: string;
}

/**
 * What a copy of the reference puts on the clipboard, as it will read once
 * pasted: the emphasis of the style for HTML, the source itself otherwise. A
 * site asking for several works previews every one of them, in the order it
 * names them. The references are formatted by citeproc-js, loaded the first
 * time one is previewed.
 * @param props - Reference, format and style to preview.
 * @returns The body of the preview tooltip.
 */
export function CitationPreview(props: CitationPreviewProps): ReactElement {
  const { reference, format, style } = props;
  const references = useMemo(
    () => (Array.isArray(reference) ? reference : [reference]),
    [reference],
  );
  const task = useCallback(
    (): Promise<string[]> =>
      format === 'html'
        ? formatEach(references, format, style)
        : formatCitations(references, format, style).then((all) => [all]),
    [references, format, style],
  );
  const written = useAsync(task);

  if (written.status !== 'success') {
    return <Spinner className="citation-preview" size={16} />;
  }
  if (format === 'html') {
    return (
      <div className="citation-preview" style={RICH_STYLE}>
        {written.data.map((html, line) => (
          <div
            key={references[line]?.doi ?? line}
            style={line === 0 ? undefined : RICH_LINE_STYLE}
          >
            <CitationHtml html={html} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <pre className="citation-preview" style={PREVIEW_STYLE}>
      {written.data.join('')}
    </pre>
  );
}
