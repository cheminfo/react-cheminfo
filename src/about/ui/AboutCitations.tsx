import type { CSSProperties, ReactElement } from 'react';

import type { CitedWork } from '../../citation/core/works.ts';
import { CiteButton } from '../../citation/ui/CiteButton.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';

export interface AboutCitationsProps {
  /** The works the site asks for, in the order it names them. */
  works: readonly CitedWork[];
}

/**
 * What to cite, and what citing each work credits: a reader handed two
 * references has to be told which is which before they can pick one. Each
 * work is cited through the shared Cite button, so the page offers the same
 * article link, styles and reference-manager files as the header does.
 * @param props - See {@link AboutCitationsProps}.
 * @returns The works, each with its Cite button.
 */
export function AboutCitations(props: AboutCitationsProps): ReactElement {
  const { works } = props;
  const t = useChromeT();

  return (
    <div className="about-citations" style={LIST_STYLE}>
      {works.map((work) => (
        <div key={work.reference.doi} className="about-citation">
          <div style={WHAT_STYLE}>{work.what}</div>
          {work.note === undefined ? null : (
            <p style={NOTE_STYLE}>{work.note}</p>
          )}
          <CiteButton
            reference={work.reference}
            label={t('about.citeWork', { what: work.what })}
            placement="bottom-start"
          />
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
