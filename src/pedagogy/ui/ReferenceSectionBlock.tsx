import type { CSSProperties, ReactElement } from 'react';

import { ClickToCopy } from '../../clipboard/ui/ClickToCopy.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';

import type { SyntaxTooltipContent } from './SyntaxTooltip.tsx';
import { SyntaxTooltip } from './SyntaxTooltip.tsx';
import { MONOSPACE } from './pedagogyStyle.ts';

/** One line of the cheatsheet: a construct and what it does. */
export interface ReferenceRow {
  /** The construct itself, set in monospace. */
  syntax: string;
  /** What it does, in one line — short enough to read on paper. */
  description: string;
  /**
   * The longer story, opened by hovering the row. A sparse section is meant to
   * ship and be enriched later, so a row without one is plain text rather than
   * a chip that opens nothing.
   * @default undefined — the row is not interactive
   */
  tooltip?: SyntaxTooltipContent;
}

/** One titled block of the cheatsheet. */
export interface ReferenceSection {
  /** Stable and URL-safe: a heading can be linked to. */
  id: string;
  /** The heading of the block. */
  title: string;
  /**
   * One line under the heading, when the block needs framing.
   * @default undefined
   */
  intro?: string;
  /**
   * Colour of the heading and of the rule under it, which is how the sections
   * are told apart at a glance.
   * @default undefined — the heading takes the surrounding text colour
   */
  color?: string;
  /** The lines of the block, in reading order. */
  rows: ReferenceRow[];
  /**
   * Whether the block is dropped from the printed sheet — a section that is
   * only useful with a pointer, or one the site keeps for the screen.
   * @default false
   */
  noPrint?: boolean;
}

/** What {@link ReferenceSectionBlock} needs. */
export interface ReferenceSectionBlockProps {
  /** The block to draw. */
  section: ReferenceSection;
  /**
   * Width of the syntax column, so the blocks of one grid line up.
   * @default 150
   */
  syntaxWidth?: number | string;
  /**
   * Class the block carries, in addition to `reference-section`.
   * @default undefined
   */
  className?: string;
}

/**
 * A titled block of reference rows.
 *
 * The rows are spans in a flex column rather than a table: a tooltip target is
 * wrapped in a `<span>`, which a browser hoists straight out of a `<tbody>`,
 * and a table also breaks across pages far worse than a column does.
 * @param props - The section, and how wide its syntax column is.
 * @returns The block, kept whole across a page break.
 */
export function ReferenceSectionBlock(
  props: ReferenceSectionBlockProps,
): ReactElement {
  const { section, syntaxWidth = 150, className } = props;

  return (
    <section
      id={section.id}
      className={joinClassNames(
        'reference-section',
        section.noPrint === true && 'no-print',
        className,
      )}
      style={SECTION_STYLE}
    >
      <h4 style={headingStyle(section.color)}>{section.title}</h4>
      {section.intro !== undefined && (
        <p style={INTRO_STYLE}>{section.intro}</p>
      )}
      {section.rows.map((row) => (
        <ReferenceRowLine key={row.syntax} row={row} width={syntaxWidth} />
      ))}
    </section>
  );
}

function ReferenceRowLine(props: {
  row: ReferenceRow;
  width: number | string;
}): ReactElement {
  const { row, width } = props;
  const interactive = row.tooltip !== undefined;
  const line = (
    <span style={interactive ? INTERACTIVE_ROW_STYLE : ROW_STYLE}>
      <span style={syntaxStyle(width, interactive)}>
        <ClickToCopy
          value={row.syntax}
          label="syntax"
          title={interactive ? '' : undefined}
        >
          {row.syntax}
        </ClickToCopy>
      </span>
      <span style={DESCRIPTION_STYLE}>{row.description}</span>
    </span>
  );
  if (row.tooltip === undefined) return line;
  return (
    <SyntaxTooltip content={row.tooltip} placement="right">
      {line}
    </SyntaxTooltip>
  );
}

function headingStyle(color: string | undefined): CSSProperties {
  return {
    margin: '0 0 4px',
    paddingBottom: 2,
    fontSize: 13,
    ...(color === undefined
      ? {}
      : { color, borderBottom: `2px solid ${color}` }),
  };
}

function syntaxStyle(
  width: number | string,
  interactive: boolean,
): CSSProperties {
  return {
    flex: `0 0 ${typeof width === 'number' ? `${width}px` : width}`,
    fontFamily: MONOSPACE,
    fontSize: 12,
    fontWeight: 600,
    color: TOKEN.text,
    ...(interactive
      ? {
          borderBottom: `1px dotted ${TOKEN.textMuted}`,
          alignSelf: 'flex-start',
        }
      : {}),
  };
}

const SECTION_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  breakInside: 'avoid',
};

const INTRO_STYLE: CSSProperties = {
  margin: '0 0 4px',
  color: TOKEN.textMuted,
  fontSize: 12,
};

const ROW_STYLE: CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '3px 0',
  borderTop: `1px solid ${TOKEN.border}`,
  width: '100%',
};

const INTERACTIVE_ROW_STYLE: CSSProperties = { ...ROW_STYLE, cursor: 'help' };

const DESCRIPTION_STYLE: CSSProperties = {
  flex: '1 1 auto',
  fontSize: 12,
  lineHeight: 1.4,
  color: TOKEN.text,
};
