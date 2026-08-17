import type { CSSProperties, ReactElement } from 'react';

import type { ReferenceSection } from './ReferenceSectionBlock.tsx';
import { ReferenceSectionBlock } from './ReferenceSectionBlock.tsx';

export interface ReferenceGridProps {
  /** The blocks of the cheatsheet, in reading order. */
  sections: readonly ReferenceSection[];
  /**
   * Width under which a column wraps to the next line, in pixels.
   * @default 320
   */
  minColumnWidth?: number;
  /**
   * Width of the syntax column of every block, so they line up across columns.
   * @default 150
   */
  syntaxWidth?: number | string;
  /**
   * Class the grid carries, in addition to `reference-grid`.
   * @default undefined
   */
  className?: string;
}

/**
 * The whole cheatsheet: as many columns as the paper or the window allows.
 *
 * Students print this page and take it into an exam room, so the columns
 * reflow to the sheet and every block is kept off a page break.
 * @param props - The sections, and how they are laid out.
 * @returns The grid.
 */
export function ReferenceGrid(props: ReferenceGridProps): ReactElement {
  const {
    sections,
    minColumnWidth = 320,
    syntaxWidth = 150,
    className,
  } = props;

  return (
    <div
      className={
        className === undefined
          ? 'reference-grid'
          : `reference-grid ${className}`
      }
      style={gridStyle(minColumnWidth)}
    >
      {sections.map((section) => (
        <ReferenceSectionBlock
          key={section.id}
          section={section}
          syntaxWidth={syntaxWidth}
        />
      ))}
    </div>
  );
}

function gridStyle(minColumnWidth: number): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minColumnWidth}px, 1fr))`,
    gap: '10px 24px',
    alignItems: 'start',
  };
}
