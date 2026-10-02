import type { ReactElement, ReactNode } from 'react';

import { parseInlineMarks } from '../core/inlineMarks.ts';

import { useGlossary } from './glossaryContext.ts';
import { plainCode, renderInlineSegments } from './inlineSegments.tsx';

/** Props of {@link InlineText}. */
export interface InlineTextProps {
  /**
   * Authored prose: `` `code` ``, `{{C6H6O}}`, `**strong**` and `*emphasis*`.
   * Anything else, `[[markers]]` included, is shown as typed.
   */
  text: string;
  /**
   * Draws a code span: in a class of the site's, typeset as LaTeX, drawn as a
   * structure.
   * @default a plain `<code>`
   */
  renderCode?: (code: string) => ReactNode;
  /**
   * Draws a `{{C6H6O}}`: as a formula, with `react-mf`.
   * @default the surrounding `GlossaryProvider`'s, and otherwise the formula
   * as typed
   */
  renderMf?: (mf: string) => ReactNode;
}

/**
 * Render one line of authored prose with its light inline markup.
 *
 * Content files are prose that quotes notation — `[C]` carries no hydrogen,
 * `\frac{a}{b}` takes two arguments — and the backticks are how the author set
 * the notation apart. Left unrendered they read as part of the notation.
 * Prose that links glossary terms uses `GlossaryText`, which reads the same
 * marks.
 * @param props - The prose, and how its code spans are drawn.
 * @returns The prose, with its marks drawn.
 */
export function InlineText(props: InlineTextProps): ReactElement {
  const context = useGlossary();
  const {
    text,
    renderCode = context.renderCode ?? plainCode,
    renderMf = context.renderMf,
  } = props;

  return (
    <>
      {renderInlineSegments(parseInlineMarks(text), {
        code: renderCode,
        mf: renderMf,
      })}
    </>
  );
}
