import type { Placement } from '@blueprintjs/core';
import { Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

import type { Glossary, GlossaryEntry } from '../core/glossary.ts';
import { lookupGlossaryTerm, parseGlossaryMarkers } from '../core/glossary.ts';

import { useGlossary } from './glossaryContext.ts';

export interface GlossaryTextProps {
  /**
   * Authored prose. Every `[[term]]` — or `[[term|displayed text]]` — the
   * glossary knows becomes a hoverable chip.
   */
  text: string;
  /**
   * Terms to resolve against, instead of the ones the surrounding provider
   * holds. A page showing two vocabularies side by side passes its own here.
   * @default undefined — the glossary of the surrounding `GlossaryProvider`
   */
  glossary?: Glossary;
  /**
   * Side the definition opens on.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * Class every chip carries, so a site can reach them from its stylesheet.
   * @default 'glossary-term'
   */
  className?: string;
}

/**
 * Render authored prose, turning its markers into hoverable definitions.
 *
 * A term the glossary has no entry for renders as its plain text, never as the
 * brackets: prose is allowed to link a word months before anybody writes its
 * definition, and the page must keep reading in the meantime.
 * @param props - The prose, and where its terms are defined.
 * @returns The prose, with the known terms made hoverable.
 */
export function GlossaryText(props: GlossaryTextProps): ReactElement {
  const {
    text,
    glossary,
    placement = 'bottom',
    className = 'glossary-term',
  } = props;
  const fromProvider = useGlossary();
  const terms = glossary ?? fromProvider;

  const pieces: ReactNode[] = [];
  for (const segment of parseGlossaryMarkers(text)) {
    const entry =
      segment.kind === 'term'
        ? lookupGlossaryTerm(terms, segment.term)
        : undefined;
    if (entry === undefined) {
      pieces.push(<Fragment key={segment.start}>{segment.text}</Fragment>);
      continue;
    }
    pieces.push(
      <Tooltip
        key={segment.start}
        content={<GlossaryTooltipBody entry={entry} />}
        hoverOpenDelay={HOVER_OPEN_DELAY}
        placement={placement}
      >
        <span className={className} style={TERM_STYLE}>
          {segment.text}
        </span>
      </Tooltip>,
    );
  }

  return <>{pieces}</>;
}

export interface GlossaryTooltipBodyProps {
  /** The term to explain, already resolved from a marker. */
  entry: GlossaryEntry;
}

/**
 * The definition itself: the term, one paragraph, then the worked examples.
 *
 * Exported on its own so a glossary page can list every term with the body it
 * shows on hover, rather than describing the same entry twice.
 * @param props - The entry to show.
 * @returns The body of the tooltip.
 */
export function GlossaryTooltipBody(
  props: GlossaryTooltipBodyProps,
): ReactElement {
  const { entry } = props;

  return (
    <div style={BODY_STYLE}>
      <div style={TITLE_STYLE}>{entry.title}</div>
      <div style={SUMMARY_STYLE}>{entry.summary}</div>
      {entry.examples.length > 0 && (
        <ul style={LIST_STYLE}>
          {entry.examples.map((example) => (
            <li key={`${example.code}::${example.input ?? ''}`}>
              <code style={CODE_STYLE}>{example.code}</code>
              {example.input !== undefined && (
                <span style={INPUT_STYLE}>{` on ${example.input}`}</span>
              )}
              {example.note !== undefined && (
                <div style={NOTE_STYLE}>{example.note}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Long enough that the pointer can cross a chip without opening it. */
const HOVER_OPEN_DELAY = 150;

const TERM_STYLE: CSSProperties = {
  borderBottom: '1px dotted currentColor',
  color: 'var(--accent, inherit)',
  cursor: 'help',
};

const BODY_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  maxWidth: 340,
};

const TITLE_STYLE: CSSProperties = { fontWeight: 600, fontSize: 13 };

const SUMMARY_STYLE: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.45,
  color: '#d3d8de',
};

const LIST_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  margin: 0,
  paddingLeft: 16,
  fontSize: 12,
  lineHeight: 1.4,
};

const CODE_STYLE: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontWeight: 600,
  color: '#8abbff',
};

const INPUT_STYLE: CSSProperties = { color: '#f6f7f9' };

const NOTE_STYLE: CSSProperties = { fontStyle: 'italic', color: '#abb3bf' };
