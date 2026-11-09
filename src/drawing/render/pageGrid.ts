/**
 * The box a saved figure takes up, and the grid a sheet of paper divides the
 * plane into: which of its sheets hold something, and where its lines run
 * across a view.
 */

import { placedPage } from '../core/pages.ts';
import type { Box, DrawPage, FigureSize } from '../core/types.ts';

import { primitivesBounds } from './bounds.ts';
import type { Scene, SceneItem } from './primitives.ts';

/** The most sheets a drawing goes on: past them, the rest does not print. */
export const MAX_SHEETS = 200;

/** Reaching less far than this into a sheet does not cost a sheet, in points. */
const GRAZE = 1;

/** The lines drawn along each direction: past them, they would be a tint. */
const MAX_LINES = 200;

/** A sheet of the grid, counted from the one the grid is placed by. */
interface Tile {
  column: number;
  row: number;
}

/**
 * The box a scene is written in: its drawing, and the padding around it.
 * @param scene - The scene.
 * @param padding - The empty space around the drawing, in points.
 * @returns The box, in points.
 */
export function paddedBox(scene: Scene, padding = 4) {
  return {
    x: scene.bounds.x - padding,
    y: scene.bounds.y - padding,
    width: Math.max(scene.bounds.width + 2 * padding, 1),
    height: Math.max(scene.bounds.height + 2 * padding, 1),
  };
}

/**
 * The sheets of a paper's grid that hold something of a scene, in reading
 * order: the ones that print, and the first of the grid when nothing does.
 * @param scene - The scene.
 * @param page - The paper.
 * @returns The sheets, in points.
 */
export function pageSheets(scene: Scene, page: DrawPage): Box[] {
  return sheetsHolding(scene.items, placedPage(page, paddedBox(scene)));
}

/**
 * The box a saved figure takes up: the padded drawing, or a size set on it,
 * centred on the drawing and cutting what spills over.
 * @param scene - The scene.
 * @param figure - The figure's size, when it sets a side.
 * @returns The box, in points.
 */
export function figureBox(scene: Scene, figure?: FigureSize): Box {
  const fitted = paddedBox(scene);
  const width = figure?.width ?? fitted.width;
  const height = figure?.height ?? fitted.height;
  return {
    x: fitted.x + (fitted.width - width) / 2,
    y: fitted.y + (fitted.height - height) / 2,
    width,
    height,
  };
}

/**
 * The sheets of a grid that hold something, in reading order; the first sheet
 * of the grid when nothing is drawn.
 * @param items - What is drawn.
 * @param page - The sheet, with its place.
 * @returns The sheets, in points, at most {@link MAX_SHEETS}.
 */
function sheetsHolding(
  items: readonly SceneItem[],
  page: Required<DrawPage>,
): Box[] {
  const { x, y, width, height } = page;
  const tiles = new Map<string, Tile>();
  for (const item of items) {
    const box = primitivesBounds(item.primitives);
    if (!box) continue;
    const columns = span(box.x, box.width, x, width);
    const rows = span(box.y, box.height, y, height);
    for (let row = rows.first; row <= rows.last; row++) {
      for (let column = columns.first; column <= columns.last; column++) {
        if (tiles.size === MAX_SHEETS) break;
        tiles.set(`${column} ${row}`, { column, row });
      }
    }
  }
  if (tiles.size === 0) return [{ x, y, width, height }];
  return [...tiles.values()]
    .toSorted((a, b) => a.row - b.row || a.column - b.column)
    .map(({ column, row }) => ({
      x: x + column * width,
      y: y + row * height,
      width,
      height,
    }));
}

/**
 * The box some boxes fit in.
 * @param boxes - The boxes, at least one.
 * @returns Their union.
 */
export function enclosingBox(boxes: readonly Box[]): Box {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const { x, y, width, height } of boxes) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x + width > maxX) maxX = x + width;
    if (y + height > maxY) maxY = y + height;
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * The lines of a grid across a view, as the `d` of an SVG path.
 * @param sheet - A sheet of the grid.
 * @param visible - The box the view shows, in points.
 * @returns The path, empty when the sheets are too small to draw at this zoom.
 */
export function sheetLines(sheet: Box, visible: Box): string {
  const columns = linesAcross(sheet.x, sheet.width, visible.x, visible.width);
  const rows = linesAcross(sheet.y, sheet.height, visible.y, visible.height);
  if (columns.length > MAX_LINES || rows.length > MAX_LINES) return '';
  const right = visible.x + visible.width;
  const bottom = visible.y + visible.height;
  let path = '';
  for (const x of columns) path += `M${x} ${visible.y}V${bottom}`;
  for (const y of rows) path += `M${visible.x} ${y}H${right}`;
  return path;
}

function span(start: number, length: number, origin: number, side: number) {
  const first = Math.floor((start + GRAZE - origin) / side);
  const last = Math.floor((start + length - GRAZE - origin) / side);
  return { first, last: Math.max(first, last) };
}

function linesAcross(
  origin: number,
  side: number,
  start: number,
  length: number,
): number[] {
  const first = Math.ceil((start - origin) / side);
  const last = Math.floor((start + length - origin) / side);
  const lines: number[] = [];
  for (let index = first; index <= last; index++) {
    if (lines.length > MAX_LINES) break;
    lines.push(origin + index * side);
  }
  return lines;
}
