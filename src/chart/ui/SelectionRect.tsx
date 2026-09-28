import type { ReactElement } from 'react';

import type { PlotRect } from '../core/chartGeometry.ts';
import { CHART_COLORS } from '../core/chartTheme.ts';
import { selectionRectangle } from '../core/selectionGeometry.ts';
import type { ZoomSelection } from '../core/zoomDomain.ts';

export interface SelectionRectProps {
  /** The drag being made, `null` when none is. */
  selection: ZoomSelection | null;
  /** Where the plot sits inside the SVG, which the drag is confined to. */
  plot: PlotRect;
}

/**
 * What the drag being made promises, drawn before the button is let go.
 *
 * It is painted over the data rather than under it, which is the one place a
 * preview may cover a trace: a rectangle drawn behind a dense spectrum is a
 * rectangle nobody sees, and the whole point of it is to be seen while the hand
 * is still moving. The fill is faint enough for the peaks inside it to be read
 * through, so the window being asked for can be judged against what is in it.
 *
 * Nothing here takes a pointer event: the drag is already captured on the SVG,
 * and a rectangle that swallowed the pointer would end the very gesture it is
 * drawing.
 * @param props - Component props.
 * @returns The rectangle, or nothing when no drag is being made and when the one
 * being made is too short to zoom.
 */
export function SelectionRect(props: SelectionRectProps): ReactElement | null {
  const { selection, plot } = props;

  const rectangle = selectionRectangle(selection, plot);
  if (rectangle === null) return null;

  return (
    <rect
      x={rectangle.x}
      y={rectangle.y}
      width={rectangle.width}
      height={rectangle.height}
      pointerEvents="none"
      style={selectionStyle}
    />
  );
}

const selectionStyle = {
  fill: CHART_COLORS.selection,
  stroke: CHART_COLORS.selectionBorder,
} as const;
