import type { Placement } from '@blueprintjs/core';
import { Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { Glossary, GlossaryExample } from '../core/glossary.ts';
import { lookupGlossaryTerm } from '../core/glossary.ts';
import { parseInlineMarks } from '../core/inlineMarks.ts';

import { GlossaryDefinition } from './GlossaryDefinition.tsx';
import type { GlossaryContextValue } from './glossaryContext.ts';
import { useGlossary } from './glossaryContext.ts';
import { plainCode, renderInlineSegments } from './inlineSegments.tsx';
import { HOVER_OPEN_DELAY } from './pedagogyStyle.ts';

/** Props of {@link GlossaryText}. */
export interface GlossaryTextProps<TExample = GlossaryExample> {
  /**
   * Authored prose. Every `[[term]]` — or `[[term|displayed text]]` — the
   * glossary knows becomes a hoverable chip, and `` `code` ``, `**strong**`
   * and `*emphasis*` are drawn as such.
   */
  text: string;
  /**
   * Terms to resolve against, instead of the ones the surrounding provider
   * holds. A page showing two vocabularies side by side passes its own here,
   * with a `renderExample` when its examples have a shape of their own.
   * @default undefined — the glossary of the surrounding `GlossaryProvider`
   */
  glossary?: Glossary<TExample>;
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
  /**
   * Draws the illustration of an example inside a definition.
   * @default the surrounding provider's, and otherwise the code and the input
   */
  renderExample?: (example: TExample) => ReactNode;
  /**
   * Draws a code span of the prose.
   * @default the surrounding provider's, and otherwise a plain `<code>`
   */
  renderCode?: (code: string) => ReactNode;
}

/**
 * Render authored prose, turning its markers into hoverable definitions and
 * its inline marks into code, strong and emphasised runs.
 *
 * A term the glossary has no entry for renders as its plain text, never as the
 * brackets: prose is allowed to link a word months before anybody writes its
 * definition, and the page must keep reading in the meantime.
 * @param props - The prose, and where its terms are defined.
 * @returns The prose, with the known terms made hoverable.
 */
export function GlossaryText<TExample = GlossaryExample>(
  props: GlossaryTextProps<TExample>,
): ReactElement {
  const {
    text,
    glossary,
    placement = 'bottom',
    className = 'glossary-term',
    renderExample,
    renderCode,
  } = props;
  const context = useGlossary();
  const terms: Glossary<unknown> = glossary ?? context.glossary;
  const segments = parseInlineMarks(text, { glossaryMarkers: true });

  return (
    <>
      {renderInlineSegments(segments, {
        code: renderCode ?? context.renderCode ?? plainCode,
        term: (term, shown) => {
          const entry = lookupGlossaryTerm(terms, term);
          if (entry === undefined) return shown;
          return (
            <Tooltip
              content={
                <GlossaryDefinition
                  entry={entry}
                  renderExample={
                    renderExample as GlossaryContextValue['renderExample']
                  }
                  renderCode={renderCode}
                />
              }
              hoverOpenDelay={HOVER_OPEN_DELAY}
              placement={placement}
            >
              <span className={className} style={TERM_STYLE}>
                {shown}
              </span>
            </Tooltip>
          );
        },
      })}
    </>
  );
}

const TERM_STYLE: CSSProperties = {
  borderBottom: '1px dotted currentColor',
  color: 'var(--accent, inherit)',
  cursor: 'help',
};
