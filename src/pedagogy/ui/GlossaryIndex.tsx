import { InputGroup } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { Glossary, GlossaryExample } from '../core/glossary.ts';
import { listGlossary } from '../core/glossarySearch.ts';

import { GlossaryDefinition } from './GlossaryDefinition.tsx';
import { useGlossary } from './glossaryContext.ts';

/** Props of {@link GlossaryIndex}. */
export interface GlossaryIndexProps<TExample = GlossaryExample> {
  /**
   * The terms to list.
   * @default undefined — the glossary of the surrounding `GlossaryProvider`
   */
  glossary?: Glossary<TExample>;
  /**
   * Draws the illustration of an example.
   * @default the surrounding provider's, and otherwise the code and the input
   */
  renderExample?: (example: TExample) => ReactNode;
  /**
   * Draws the code spans of the summaries and notes.
   * @default the surrounding provider's, and otherwise a monospace span
   */
  renderCode?: (code: string) => ReactNode;
  /**
   * Whether a filter box sits over the list. It is left off the printed page.
   * @default true
   */
  searchable?: boolean;
  /**
   * Placeholder and accessible name of the filter box.
   * @default the chrome's own words for it, in the language of the page
   */
  searchLabel?: string;
  /**
   * Width under which a column wraps to the next line, in pixels.
   * @default 280
   */
  minColumnWidth?: number;
  /**
   * Prefix of the id each entry carries, so `#glossary-ring-closure` links to
   * one term.
   * @default 'glossary-'
   */
  idPrefix?: string;
  /**
   * Class the index carries, in addition to `glossary-index`.
   * @default undefined
   */
  className?: string;
}

/**
 * Every term of a glossary on one page: searchable on screen, printable on
 * paper, in alphabetical order of title.
 *
 * Each entry is the very definition a `[[marker]]` opens on hover, drawn on the
 * page rather than on a tooltip, so a term never reads two ways. A filter
 * matches the title, the summary and the text of the examples, since a student
 * often remembers the notation and not the word it was filed under.
 * @param props - The terms, and how the list is searched and laid out.
 * @returns The index.
 */
export function GlossaryIndex<TExample = GlossaryExample>(
  props: GlossaryIndexProps<TExample>,
): ReactElement {
  const {
    glossary,
    renderExample,
    renderCode,
    searchable = true,
    searchLabel,
    minColumnWidth = 280,
    idPrefix = 'glossary-',
    className,
  } = props;
  const t = useChromeT();
  const context = useGlossary();
  const terms = (glossary ?? context.glossary) as Glossary<TExample>;
  const [query, setQuery] = useState('');
  const listings = useMemo(() => listGlossary(terms, query), [terms, query]);

  return (
    <div
      className={joinClassNames('glossary-index', className)}
      style={ROOT_STYLE}
    >
      {searchable && (
        <div className="no-print" style={SEARCH_STYLE}>
          <InputGroup
            type="search"
            leftIcon="search"
            value={query}
            placeholder={searchLabel ?? t('pedagogy.filterTerms')}
            aria-label={searchLabel ?? t('pedagogy.filterTerms')}
            autoComplete="off"
            spellCheck={false}
            onValueChange={setQuery}
          />
        </div>
      )}
      {listings.length === 0 ? (
        <p style={EMPTY_STYLE}>
          {query.trim() === ''
            ? t('pedagogy.noTermDefined')
            : t('pedagogy.noTermMatches', { query: query.trim() })}
        </p>
      ) : (
        <div style={gridStyle(minColumnWidth)}>
          {listings.map(({ key, entry }) => (
            <article
              key={key}
              id={`${idPrefix}${anchorOf(key)}`}
              className="glossary-index-entry"
              style={ENTRY_STYLE}
            >
              <GlossaryDefinition
                entry={entry}
                tone="page"
                renderExample={renderExample}
                renderCode={renderCode}
              />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function anchorOf(key: string): string {
  return key
    .trim()
    .replaceAll(/[^\p{L}\p{N}]+/gu, '-')
    .replaceAll(/^-+|-+$/g, '');
}

function gridStyle(minColumnWidth: number): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(min(${minColumnWidth}px, 100%), 1fr))`,
    gap: '12px 24px',
    alignItems: 'start',
  };
}

const ROOT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

const SEARCH_STYLE: CSSProperties = { maxWidth: 320 };

const EMPTY_STYLE: CSSProperties = {
  margin: 0,
  color: TOKEN.textMuted,
};

const ENTRY_STYLE: CSSProperties = {
  borderTop: `1px solid ${TOKEN.border}`,
  breakInside: 'avoid',
  paddingTop: 8,
};
