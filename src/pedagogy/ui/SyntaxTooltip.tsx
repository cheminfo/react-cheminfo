import type { Placement } from '@blueprintjs/core';
import { Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { GlossaryExample } from '../core/glossary.ts';

import { HOVER_OPEN_DELAY, MONOSPACE, PROSE_INK } from './pedagogyStyle.ts';

/**
 * The one worked example a documented construct carries: the same shape as
 * the examples of a glossary entry.
 */
export type SyntaxTooltipExample = GlossaryExample;

/** Everything the rich tooltip says about one construct. */
export interface SyntaxTooltipContent {
  /** The construct itself, shown in the highlighted chip. */
  syntax: string;
  /** Its name, in words: `Word boundary`, `Aromatic atom`, `Layer /c`. */
  name: string;
  /**
   * Where it comes from, in small grey type: `RegExp.prototype.global`.
   * @default undefined
   */
  tag?: string;
  /** The one-line headline. */
  summary: string;
  /** The longer story, in a sentence or two. */
  detail: string;
  /** The worked example shown under the detail. */
  example: SyntaxTooltipExample;
}

/** What {@link SyntaxTooltip} needs. */
export interface SyntaxTooltipProps {
  /** What to explain. */
  content: SyntaxTooltipContent;
  /** What the student hovers: a cheatsheet row, a chip, a help icon. */
  children: ReactNode;
  /**
   * Side the tooltip opens on. A cheatsheet row opens to its right, a chip in
   * a toolbar below itself.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * Label of the example's code line.
   * @default 'Example'
   */
  codeLabel?: string;
  /**
   * Label of the example's input line.
   * @default 'Input'
   */
  inputLabel?: string;
  /**
   * Holds the tooltip open regardless of the pointer, for a page that pins one
   * open on click and for showing the body on its own.
   * @default undefined — the tooltip follows the pointer
   */
  isOpen?: boolean;
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * The one rich tooltip of a tool: cheatsheet rows, option chips and inline help
 * icons all open this, so every documented construct is described at the same
 * level of detail and adding a construct means adding the same five fields.
 * @param props - The construct, and what opens it.
 * @returns The hovered element, with its tooltip.
 */
export function SyntaxTooltip(props: SyntaxTooltipProps): ReactElement {
  const {
    className,
    content,
    children,
    placement = 'bottom',
    codeLabel,
    inputLabel,
    isOpen,
  } = props;

  return (
    <Tooltip
      className={className}
      content={
        <SyntaxTooltipBody
          content={content}
          codeLabel={codeLabel}
          inputLabel={inputLabel}
        />
      }
      hoverOpenDelay={HOVER_OPEN_DELAY}
      placement={placement}
      isOpen={isOpen}
    >
      {children}
    </Tooltip>
  );
}

interface SyntaxTooltipBodyProps {
  /** What to explain. */
  content: SyntaxTooltipContent;
  /**
   * Label of the example's code line.
   * @default 'Example'
   */
  codeLabel?: string;
  /**
   * Label of the example's input line.
   * @default 'Input'
   */
  inputLabel?: string;
}

/**
 * The body of the rich tooltip, on its own.
 *
 * A reference page that prints the same description under each construct shows
 * this rather than restating the fields in a second layout.
 * @param props - The construct, and how its example is labelled.
 * @returns The body.
 */
export function SyntaxTooltipBody(props: SyntaxTooltipBodyProps): ReactElement {
  const { content, codeLabel = 'Example', inputLabel = 'Input' } = props;
  const { syntax, name, tag, summary, detail, example } = content;

  return (
    <div style={BODY_STYLE}>
      <div style={HEADER_STYLE}>
        <code style={SYNTAX_STYLE}>{syntax}</code>
        <span style={NAME_STYLE}>{name}</span>
        {tag !== undefined && <span style={TAG_STYLE}>{tag}</span>}
      </div>
      <div style={SUMMARY_STYLE}>{summary}</div>
      <div style={DETAIL_STYLE}>{detail}</div>
      <div style={EXAMPLE_STYLE}>
        <div style={ROW_STYLE}>
          <span style={LABEL_STYLE}>{codeLabel}</span>
          <code style={VALUE_STYLE}>{example.code}</code>
        </div>
        {example.input !== undefined && (
          <div style={ROW_STYLE}>
            <span style={LABEL_STYLE}>{inputLabel}</span>
            <code style={VALUE_STYLE}>{example.input}</code>
          </div>
        )}
        {example.note !== undefined && (
          <div style={NOTE_STYLE}>{example.note}</div>
        )}
      </div>
    </div>
  );
}

const BODY_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  maxWidth: 360,
};

const HEADER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  flexWrap: 'wrap',
  gap: 6,
};

const SYNTAX_STYLE: CSSProperties = {
  background: PROSE_INK.tooltip.rule,
  borderRadius: 3,
  color: '#ffffff',
  fontFamily: MONOSPACE,
  fontSize: 14,
  fontWeight: 600,
  padding: '1px 6px',
};

const NAME_STYLE: CSSProperties = { fontWeight: 600, fontSize: 13 };

const TAG_STYLE: CSSProperties = {
  color: PROSE_INK.tooltip.muted,
  fontSize: 11,
};

const SUMMARY_STYLE: CSSProperties = { fontSize: 12, lineHeight: 1.4 };

const DETAIL_STYLE: CSSProperties = {
  color: PROSE_INK.tooltip.text,
  fontSize: 12,
  lineHeight: 1.45,
};

const EXAMPLE_STYLE: CSSProperties = {
  borderTop: `1px solid ${PROSE_INK.tooltip.rule}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  paddingTop: 6,
};

const ROW_STYLE: CSSProperties = { display: 'flex', gap: 6, fontSize: 12 };

const LABEL_STYLE: CSSProperties = {
  color: PROSE_INK.tooltip.muted,
  flex: '0 0 68px',
};

const VALUE_STYLE: CSSProperties = {
  color: PROSE_INK.tooltip.text,
  fontFamily: MONOSPACE,
  overflowWrap: 'anywhere',
};

const NOTE_STYLE: CSSProperties = {
  color: PROSE_INK.tooltip.muted,
  fontSize: 12,
  fontStyle: 'italic',
  marginTop: 2,
};
