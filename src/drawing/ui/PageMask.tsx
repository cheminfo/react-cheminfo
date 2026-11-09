import type { ReactElement } from 'react';

import type { Box } from '../core/types.ts';

/**
 * Everything around a page shown alone, covered, whatever is drawn there: the
 * other pages it would otherwise show part of. The pointer goes through it, and
 * the canvas stops the pointer at the edge of the page.
 * @param props - The page and the view.
 * @param props.sheet - The page, in points, or null when none is shown alone.
 * @param props.visible - The box the view shows, in points.
 * @returns The cover, or nothing.
 */
export function PageMask(props: {
  sheet: Box | null;
  visible: Box;
}): ReactElement | null {
  const { sheet, visible } = props;
  if (!sheet) return null;
  return (
    <g data-testid="draw-page-mask" aria-hidden="true">
      <path
        className="draw-page-mask"
        fillRule="evenodd"
        d={`${boxPath(visible)}${boxPath(sheet)}`}
      />
      <rect className="draw-page-edge" {...sheet} />
    </g>
  );
}

function boxPath({ x, y, width, height }: Box): string {
  return `M${x} ${y}h${width}v${height}h${-width}Z`;
}
