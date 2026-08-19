import type { CSSProperties, ReactElement } from 'react';

import { DEFAULT_CITATION_STYLE } from '../../citation/core/formats.ts';
import { doiUrl } from '../../citation/core/reference.ts';
import type { CitedWork } from '../../citation/core/works.ts';
import { CitationPreview } from '../../citation/ui/CitationPreview.tsx';

export interface AboutCitationsProps {
  /** The works the site asks for, in the order it names them. */
  works: readonly CitedWork[];
}

/**
 * What to cite, and what citing each work credits: a reader handed two
 * references has to be told which is which before they can pick one.
 * @param props - See {@link AboutCitationsProps}.
 * @returns The works, each with its reference and its DOI.
 */
export function AboutCitations(props: AboutCitationsProps): ReactElement {
  const { works } = props;

  return (
    <div className="about-citations" style={LIST_STYLE}>
      {works.map((work) => (
        <div key={work.reference.doi} className="about-citation">
          <div style={WHAT_STYLE}>{work.what}</div>
          {work.note === undefined ? null : (
            <p style={NOTE_STYLE}>{work.note}</p>
          )}
          <div style={PLATE_STYLE}>
            <CitationPreview
              reference={work.reference}
              format="text"
              style={DEFAULT_CITATION_STYLE}
            />
          </div>
          <a
            href={doiUrl(work.reference)}
            target="_blank"
            rel="noopener noreferrer"
            style={DOI_STYLE}
          >
            doi:{work.reference.doi}
          </a>
        </div>
      ))}
    </div>
  );
}

const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
} as const satisfies CSSProperties;

const WHAT_STYLE = { fontWeight: 600 } as const satisfies CSSProperties;

const NOTE_STYLE = {
  margin: '2px 0 6px',
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;

// The preview is set in the light ink of the tooltip it was drawn for, so it
// is given the dark plate that ink is legible on.
const PLATE_STYLE = {
  padding: '8px 10px',
  borderRadius: 'var(--radius)',
  background: 'var(--text)',
  overflow: 'auto',
} as const satisfies CSSProperties;

const DOI_STYLE = {
  display: 'inline-block',
  marginTop: 6,
  color: 'var(--accent)',
  fontSize: 12,
} as const satisfies CSSProperties;
