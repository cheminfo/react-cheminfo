import type { ReactElement } from 'react';

import type { CurveShape } from '../core/curveShape.ts';
import { curveControls } from '../core/curves.ts';
import type { CurveHandle } from '../core/shapeHandles.ts';
import type { Point } from '../core/types.ts';

/** How large the square on a point of a curve is, in screen pixels. */
const POINT_SIZE = 7;
/** The radius of the ring on a control point, in screen pixels. */
const CONTROL_RADIUS = 4;

/**
 * The handles of a curve, as a drawing shows them: a square on each point it
 * passes through, and a ring on each control point setting its tangent there,
 * on an arm from the point. `react-cheminfo/styles/drawing.css` colours them.
 * @param shape - The curve.
 * @param pixel - Points per screen pixel, so marks keep their size.
 * @param named - The name a handle carries in the page, when it has one.
 * @default none
 * @returns One group of marks per point.
 */
export function curveHandleMarks(
  shape: CurveShape,
  pixel: number,
  named: (handle: CurveHandle) => string | undefined = () => undefined,
): ReactElement[] {
  const resolved = curveControls(shape.points, shape.closed, shape.controls);
  const size = POINT_SIZE * pixel;
  const arm = (key: string, from: Point, to: Point) => (
    <line
      key={key}
      className="draw-tangent"
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      strokeWidth={pixel}
    />
  );
  const ring = (handle: CurveHandle, at: Point) => (
    <circle
      key={handle.part}
      data-handle={named(handle)}
      className="draw-handle"
      cx={at.x}
      cy={at.y}
      r={CONTROL_RADIUS * pixel}
      strokeWidth={pixel * 1.5}
    />
  );
  const marks: ReactElement[] = [];
  for (let vertex = 0; vertex < shape.points.length; vertex++) {
    const point = shape.points[vertex] as Point;
    const { before, after } = resolved[vertex] ?? {};
    marks.push(
      <g
        key={vertex}
        data-vertex={vertex}
        data-control={shape.controls[vertex] ? 'set' : 'auto'}
      >
        {before ? arm('before-arm', point, before) : null}
        {after ? arm('after-arm', point, after) : null}
        {before ? ring({ vertex, part: 'before' }, before) : null}
        {after ? ring({ vertex, part: 'after' }, after) : null}
        <rect
          data-handle={named({ vertex, part: 'point' })}
          className="draw-handle draw-handle--point"
          x={point.x - size / 2}
          y={point.y - size / 2}
          width={size}
          height={size}
          strokeWidth={pixel * 1.5}
        />
      </g>,
    );
  }
  return marks;
}
