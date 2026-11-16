/**
 * The frame around the selection, as every canvas of the family draws it:
 * four corners that scale it, and one handle above it, on a stem, that turns
 * it. While a handle is dragged, the frame follows the scale or the turn.
 */

import type { ReactElement } from 'react';

import { boxCorners } from '../core/geometry.ts';
import { frameHandles } from '../core/selectionFrame.ts';
import type { Box, Point } from '../core/types.ts';

import { DashedOutline, HandleMark } from './DashedOutline.tsx';

/** What {@link FrameMarks} draws. */
export interface FrameMarksProps {
  /**
   * The frame around the selection, drawn with its handles.
   * @default undefined — no frame
   */
  frame?: Box;
  /**
   * Where the corners of the frame went while one of its handles is dragged,
   * drawn without handles.
   * @default undefined — the frame as it stands
   */
  corners?: readonly Point[];
  /** Units per screen pixel, so the marks keep their size when zoomed. */
  pixel: number;
}

/**
 * The frame around the selection and its handles.
 * @param props - See {@link FrameMarksProps}.
 * @returns The marks, or nothing when there is no frame.
 */
export function FrameMarks(props: FrameMarksProps): ReactElement | null {
  const { frame, corners, pixel } = props;
  const outline = corners ?? (frame ? boxCorners(frame) : undefined);
  if (!outline) return null;
  return (
    <g data-testid="selection-frame">
      <DashedOutline points={outline} pixel={pixel} />
      {frame && !corners
        ? frameHandles(frame, pixel).map(({ handle, point }) => (
            <HandleMark
              key={handle}
              handle={handle}
              point={point}
              pixel={pixel}
              stem={{ x: point.x, y: frame.y }}
            />
          ))
        : null}
    </g>
  );
}
