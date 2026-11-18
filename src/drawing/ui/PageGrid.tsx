import type { ReactElement } from 'react';

import type { Box } from '../core/types.ts';
import { sheetLines } from '../render/pageGrid.ts';

/** The size of a sheet's number on screen, in pixels. */
const NUMBER_SIZE = 11;

/** How far a sheet's number stands from its corner, in pixels. */
const NUMBER_INSET = 6;

/**
 * The lines of a grid of sheets across an unlimited canvas, and the number each
 * sheet that holds something prints under. They never print themselves, and
 * the pointer goes through them to what is drawn.
 * `react-cheminfo/styles/drawing.css` draws them.
 * @param props - The sheets and the view.
 * @param props.sheets - The sheets that hold something, in reading order, as
 * `pageSheets` lists them; empty when the page lines are hidden.
 * @param props.visible - The box the view shows, in points.
 * @param props.pixel - A screen pixel, in points.
 * @returns The grid, or nothing.
 */
export function PageGrid(props: {
  sheets: readonly Box[];
  visible: Box;
  pixel: number;
}): ReactElement | null {
  const { sheets, visible, pixel } = props;
  const [first] = sheets;
  if (!first) return null;
  return (
    <g data-testid="draw-page-grid" className="no-print" aria-hidden="true">
      <path className="draw-sheet" d={sheetLines(first, visible)} />
      {sheets.map((sheet, index) => (
        <text
          key={`${sheet.x} ${sheet.y}`}
          className="draw-sheet__number"
          x={sheet.x + NUMBER_INSET * pixel}
          y={sheet.y + (NUMBER_INSET + NUMBER_SIZE) * pixel}
          fontSize={NUMBER_SIZE * pixel}
        >
          {`Page ${index + 1}`}
        </text>
      ))}
    </g>
  );
}
