import type { ReactElement } from 'react';

import type { Box } from '../core/types.ts';

/**
 * The edge of a figure of a set size, on the canvas: what lies outside it is
 * cut from what is saved.
 * @param props - The figure.
 * @param props.box - The figure, in points, or undefined when it fits the
 * drawing.
 * @returns The outline, or nothing.
 */
export function FigureOutline(props: {
  box: Box | undefined;
}): ReactElement | null {
  const { box } = props;
  if (!box) return null;
  return (
    <rect
      className="draw-figure-outline"
      data-testid="draw-figure-outline"
      x={box.x}
      y={box.y}
      width={box.width}
      height={box.height}
    />
  );
}
