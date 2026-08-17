import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { PagePart } from '../src/share/ui/PagePart.tsx';

const PAGE_STYLE: CSSProperties = {
  display: 'grid',
  width: 'min(24rem, 92vw)',
  gap: 10,
};

const PANEL_STYLE: CSSProperties = {
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-sm)',
};

const TITLE_STYLE: CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 700,
};

const BODY_STYLE: CSSProperties = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 12,
};

export interface SearchPanelProps {
  /** How the panel is named. */
  title: string;
  /** What the panel shows. */
  children: ReactNode;
}

/**
 * One panel of the mock structure search, drawn on the family's surface so a
 * part a link switches off leaves a hole one can point at.
 * @param props - The panel's name, and what it shows.
 * @returns The panel.
 */
export function SearchPanel(props: SearchPanelProps): ReactElement {
  const { title, children } = props;

  return (
    <div style={PANEL_STYLE} className="search-panel">
      <h4 style={TITLE_STYLE}>{title}</h4>
      <p style={BODY_STYLE}>{children}</p>
    </div>
  );
}

/**
 * The page a shared link configures: one panel per part `?hide=` can name, and
 * the hits, which no link switches off.
 * @returns The page, under whatever configuration is above it.
 */
export function SearchPage(): ReactElement {
  return (
    <div style={PAGE_STYLE}>
      <PagePart part="examples">
        <SearchPanel title="Examples">
          benzene · caffeine · taxol, loaded into the editor in one click.
        </SearchPanel>
      </PagePart>
      <PagePart part="substructure">
        <SearchPanel title="Substructure search">
          Draw a fragment and every structure that contains it comes back.
        </SearchPanel>
      </PagePart>
      <PagePart part="hints">
        <SearchPanel title="Hints">
          Aromatic carbons are written lowercase, so benzene is c1ccccc1.
        </SearchPanel>
      </PagePart>
      <PagePart part="limits">
        <SearchPanel title="Result limit">
          25 hits, which a visitor may raise to 200.
        </SearchPanel>
      </PagePart>
      <SearchPanel title="Hits">
        c1ccc2ccccc2c1 · Cc1ccc2ccccc2c1 · Oc1ccc2ccccc2c1
      </SearchPanel>
    </div>
  );
}
