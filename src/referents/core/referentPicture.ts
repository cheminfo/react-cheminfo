/**
 * The picture a referent is offered with: the preview its figure wrote for a
 * member, else the figure cut down to where the referent is drawn. A host
 * shows it as it is, knowing nothing of what it shows.
 */

import type { FigureReferent, ReferentBox } from './types.ts';

/** How much room is kept around a referent, as a share of its larger side. */
const MARGIN = 0.08;

const METADATA = /<metadata\b[^>]*>[\s\S]*?<\/metadata\s*>/g;

/**
 * The picture of a referent, or of one of its members.
 * @param svg - The figure it is drawn in, as an SVG document.
 * @param referent - The referent.
 * @param row - The row of its series, for a member.
 * @returns An SVG document, or `undefined` when the figure says neither what
 * it looks like nor where it is.
 */
export function referentPicture(
  svg: string,
  referent: FigureReferent,
  row?: string,
): string | undefined {
  if (row !== undefined) {
    const member = referent.members?.find((candidate) => candidate.row === row);
    if (member?.preview !== undefined) return member.preview;
  }
  return referent.box === undefined
    ? undefined
    : cropFigureToBox(svg, referent.box);
}

/**
 * A figure cut down to one rectangle of it, with a thin margin, at the scale
 * it was drawn at.
 * @param svg - The figure, as an SVG document.
 * @param box - The rectangle, in the figure's units.
 * @returns The figure showing only that rectangle, without its metadata: a
 * picture, not a document; the figure itself when its root cannot be read.
 */
export function cropFigureToBox(svg: string, box: ReferentBox): string {
  const text = svg.replaceAll(METADATA, '');
  const root = /<svg\b[^>]*>/i.exec(text);
  if (!root) return svg;
  const margin = MARGIN * Math.max(box.width, box.height);
  const view = {
    x: box.x - margin,
    y: box.y - margin,
    width: box.width + 2 * margin,
    height: box.height + 2 * margin,
  };
  const scale = scaleOf(root[0]);
  let tag = setAttribute(
    root[0],
    'viewBox',
    [view.x, view.y, view.width, view.height].map(rounded).join(' '),
  );
  tag = setAttribute(
    tag,
    'width',
    `${rounded(view.width * scale.factor)}${scale.unit}`,
  );
  tag = setAttribute(
    tag,
    'height',
    `${rounded(view.height * scale.factor)}${scale.unit}`,
  );
  return `${text.slice(0, root.index)}${tag}${text.slice(root.index + root[0].length)}`;
}

// How many of its width's units one unit of the figure is: a figure 300pt
// wide over a viewBox 400 wide draws a unit as 0.75pt.
function scaleOf(tag: string): { factor: number; unit: string } {
  const width = /\swidth\s*=\s*"(?<size>[\d.]+)(?<unit>[a-z%]*)"/i.exec(
    tag,
  )?.groups;
  const viewBox = /\sviewBox\s*=\s*"(?<values>[^"]*)"/i.exec(tag)?.groups
    ?.values;
  const viewWidth = Number(viewBox?.trim().split(/[\s,]+/, 3)[2]);
  const size = Number(width?.size);
  if (
    width === undefined ||
    width.unit === '%' ||
    !(size > 0) ||
    !(viewWidth > 0)
  ) {
    return { factor: 1, unit: '' };
  }
  return { factor: size / viewWidth, unit: width.unit ?? '' };
}

function setAttribute(tag: string, name: string, value: string): string {
  const pattern = new RegExp(String.raw`\s${name}\s*=\s*"[^"]*"`, 'i');
  const written = ` ${name}="${value}"`;
  if (pattern.test(tag)) return tag.replace(pattern, written);
  return tag.replace(/\s*\/?>$/, (end) => `${written}${end}`);
}

function rounded(value: number): string {
  return String(Math.round(value * 100) / 100);
}
