/**
 * What a click and a drag make with the shape tools. A line, a rectangle, a
 * circle and an ellipse are dragged out, or placed at a size of their own by
 * a click; a polyline, a curve and a polygon are drawn corner by corner.
 */

import {
  angleTo,
  boxFromCorners,
  distance,
  polar,
  snapAngle,
} from './geometry.ts';
import type { NewGraphic } from './graphics.ts';
import type { Box, Point } from './types.ts';

/** The shape tools, in the order a palette offers them. */
export const GRAPHIC_TOOLS = [
  'line',
  'polyline',
  'curve',
  'polygon',
  'rectangle',
  'rounded-rectangle',
  'circle',
  'ellipse',
] as const;

/** One of the shape tools. */
export type GraphicTool = (typeof GRAPHIC_TOOLS)[number];

/** A shape tool that draws corner by corner. */
export type SketchTool = Extract<GraphicTool, 'polyline' | 'curve' | 'polygon'>;

/** What one more corner does to a polyline, a curve or a polygon. */
export type SketchStep =
  /** Nothing: the point is the corner just placed, a double click's end. */
  | { kind: 'skip' }
  /** The shape closes: the point is on its first corner. */
  | { kind: 'close' }
  /** The shape takes one more corner. */
  | {
      kind: 'add';
      /** Every corner, the new one last. */
      corners: Point[];
      /** What the shape is with them. */
      graphicKind: 'polyline' | 'polygon';
      /** Whether it is drawn as a smooth curve: the curve tool's. */
      smooth: boolean;
    };

/** The angle a line or a side snaps to with shift held: 15°. */
const SNAP = Math.PI / 12;

const SKETCH_TOOLS: ReadonlySet<GraphicTool> = new Set<SketchTool>([
  'polyline',
  'curve',
  'polygon',
]);

/**
 * Whether a shape tool draws corner by corner.
 * @param tool - The shape tool.
 * @returns True for the polyline, the curve and the polygon.
 */
export function isSketchTool(tool: GraphicTool): tool is SketchTool {
  return SKETCH_TOOLS.has(tool);
}

/**
 * The shape a click places: a line two units long, a rectangle three units
 * by two, a circle two units across, centred on the click.
 * @param tool - The shape tool.
 * @param point - Where, in points.
 * @param unit - The drawing's scale, its bond length, in points.
 * @returns The shape, or undefined for a tool that draws corner by corner.
 */
export function clickedGraphic(
  tool: GraphicTool,
  point: Point,
  unit: number,
): NewGraphic | undefined {
  if (isSketchTool(tool)) return undefined;
  const { x, y } = point;
  if (tool === 'line') {
    return {
      kind: 'line',
      points: [
        { x: x - unit, y },
        { x: x + unit, y },
      ],
    };
  }
  const side = tool === 'circle' ? 2 * unit : 3 * unit;
  const height = tool === 'circle' ? side : 2 * unit;
  return boxGraphic(
    tool,
    { x: x - side / 2, y: y - height / 2, width: side, height },
    unit,
  );
}

/**
 * The shape a drag spans: a line from where it started, a box from corner to
 * corner, a circle from its centre.
 * @param tool - The shape tool.
 * @param start - Where the drag started, in points.
 * @param end - Where it ended, in points.
 * @param options - The drawing's scale, and whether shift is held.
 * @param options.unit - The drawing's scale, its bond length, in points.
 * @param options.even - Whether a line snaps to 15° and a box has equal sides.
 * @returns The shape, or undefined for a tool that draws corner by corner and
 * for a drag shorter than a quarter of a unit.
 */
export function draggedGraphic(
  tool: GraphicTool,
  start: Point,
  end: Point,
  options: { unit: number; even: boolean },
): NewGraphic | undefined {
  const { unit, even } = options;
  if (isSketchTool(tool) || distance(start, end) < unit / 4) return undefined;
  if (tool === 'line') {
    return { kind: 'line', points: [start, even ? snapped(start, end) : end] };
  }
  if (tool === 'circle') {
    const radius = distance(start, end);
    return boxGraphic(
      tool,
      {
        x: start.x - radius,
        y: start.y - radius,
        width: 2 * radius,
        height: 2 * radius,
      },
      unit,
    );
  }
  const corner = even ? evenCorner(start, end) : end;
  return boxGraphic(tool, boxFromCorners(start, corner), unit);
}

/**
 * What one more corner does to a polyline, a curve or a polygon being drawn:
 * nothing within reach of the corner just placed, a close on its first
 * corner once it has three, and otherwise one more corner, a polygon's
 * closing from its third. With no corner placed, the point is the first.
 * @param corners - The corners placed so far, the first included.
 * @param point - Where the next one is, in points.
 * @param options - The tool, the drawing's scale, and whether shift is held.
 * @param options.tool - The shape tool drawing it.
 * @param options.unit - The drawing's scale, its bond length, in points.
 * @param options.even - Whether the new side snaps to 15°.
 * @returns The step.
 */
export function sketchStep(
  corners: readonly Point[],
  point: Point,
  options: { tool: SketchTool; unit: number; even: boolean },
): SketchStep {
  const { tool, unit, even } = options;
  const reach = unit * 0.3;
  const [first] = corners;
  const last = corners.at(-1);
  if (!first || !last) return { kind: 'add', ...withCorners(tool, [point]) };
  if (distance(point, last) <= reach) return { kind: 'skip' };
  if (corners.length >= 3 && distance(point, first) <= reach) {
    return { kind: 'close' };
  }
  const corner = even ? snapped(last, point) : point;
  return { kind: 'add', ...withCorners(tool, [...corners, corner]) };
}

function withCorners(
  tool: SketchTool,
  corners: Point[],
): Omit<Extract<SketchStep, { kind: 'add' }>, 'kind'> {
  return {
    corners,
    graphicKind:
      tool === 'polygon' && corners.length >= 3 ? 'polygon' : 'polyline',
    smooth: tool === 'curve',
  };
}

function boxGraphic(
  tool: Exclude<GraphicTool, 'line' | SketchTool>,
  box: Box,
  unit: number,
): NewGraphic {
  if (tool === 'rounded-rectangle') {
    return { kind: 'rectangle', ...box, radius: unit * 0.4 };
  }
  return { kind: tool === 'rectangle' ? 'rectangle' : 'ellipse', ...box };
}

// Where the pointer is, its direction from a point snapped to 15°.
function snapped(from: Point, to: Point): Point {
  return polar(from, snapAngle(angleTo(from, to), SNAP), distance(from, to));
}

// The corner a square or a circle is dragged to: the longer side, both ways.
function evenCorner(start: Point, end: Point): Point {
  const side = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  return {
    x: start.x + Math.sign(end.x - start.x || 1) * side,
    y: start.y + Math.sign(end.y - start.y || 1) * side,
  };
}
