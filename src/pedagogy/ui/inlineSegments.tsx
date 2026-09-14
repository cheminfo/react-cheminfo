import type { ReactElement, ReactNode } from 'react';
import { Fragment } from 'react';

import type { InlineSegment } from '../core/inlineMarks.ts';

/** How the marks of parsed prose are drawn. */
interface InlineRenderers {
  /** Draws a code span, from the text between its backticks. */
  code: (code: string) => ReactNode;
  /**
   * Draws a glossary marker, from its lowercased term and the text to show.
   * @default undefined — the text, as plain prose
   */
  term?: (term: string, text: string) => ReactNode;
}

/**
 * Turn parsed prose into React nodes, each keyed by where it starts.
 * @param segments - What `parseInlineMarks` returned.
 * @param renderers - How code spans and markers are drawn.
 * @returns One node per segment.
 */
export function renderInlineSegments(
  segments: readonly InlineSegment[],
  renderers: InlineRenderers,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  for (const segment of segments) {
    nodes.push(
      <Fragment key={segment.start}>
        {renderSegment(segment, renderers)}
      </Fragment>,
    );
  }
  return nodes;
}

/**
 * The code span of prose that asks for nothing more.
 * @param code - The text between the backticks.
 * @returns A plain `<code>`, styled by the page.
 */
export function plainCode(code: string): ReactElement {
  return <code>{code}</code>;
}

function renderSegment(
  segment: InlineSegment,
  renderers: InlineRenderers,
): ReactNode {
  switch (segment.kind) {
    case 'text':
      return segment.text;
    case 'code':
      return renderers.code(segment.text);
    case 'term':
      return renderers.term === undefined
        ? segment.text
        : renderers.term(segment.term, segment.text);
    case 'strong':
      return (
        <strong>{renderInlineSegments(segment.children, renderers)}</strong>
      );
    case 'emphasis':
      return <em>{renderInlineSegments(segment.children, renderers)}</em>;
    default:
      return null;
  }
}
