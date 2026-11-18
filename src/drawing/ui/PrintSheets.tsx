import type { ReactElement, ReactNode } from 'react';

import type { Box, DrawPage } from '../core/types.ts';

/** What {@link PrintSheets} is given. */
export interface PrintSheetsProps {
  /** The paper the drawing is laid out on. */
  page: DrawPage;
  /**
   * What goes on paper: the sheets of the page grid that hold something, or
   * the one box of the whole figure when the grid is hidden.
   */
  boxes: readonly Box[];
  /** Whether the boxes are sheets of the paper, each filling one. */
  paged: boolean;
  /**
   * The figure, drawn in points, for one box: the same drawing for each, the
   * box being what the sheet shows of it.
   */
  figure: (box: Box) => ReactNode;
}

/**
 * The drawing as it goes on paper, in place of the editor: the figure and
 * nothing else, sized in points, so it prints at the size it was laid out at.
 * With the page grid showing, one sheet of the paper goes to each sheet of the
 * grid that holds something, edge to edge; with the grid hidden, the whole
 * figure goes on one sheet of it, shrunk only when it would not fit. An editor
 * mounts it while `usePrinting` says the page is printed;
 * `react-cheminfo/styles/drawing.css` hides it on screen.
 * @param props - See {@link PrintSheetsProps}.
 * @returns The sheets.
 */
export function PrintSheets(props: PrintSheetsProps): ReactElement {
  const { page, boxes, paged, figure } = props;
  return (
    <div
      className={paged ? 'draw-print draw-print--sheets' : 'draw-print'}
      data-testid="print-figure"
    >
      <style>
        {`@page { size: ${page.width}pt ${page.height}pt;${paged ? ' margin: 0;' : ''} }`}
      </style>
      {boxes.map((box) => (
        <svg
          key={`${box.x} ${box.y}`}
          className="draw-print__figure"
          width={`${box.width}pt`}
          height={`${box.height}pt`}
          viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        >
          {figure(box)}
        </svg>
      ))}
    </div>
  );
}
