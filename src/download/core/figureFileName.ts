/**
 * The names a site's own figure is saved under. Every site of the family that
 * changes a figure again — draw, glassware, 3d, lcao, tlc — saves it as an SVG
 * whose extension names the site that opens it, `benzene.3d.svg`, so a file
 * says where it goes back to, and still opens in any program as an SVG.
 */

import { readFigureSource } from './figureSource.ts';
import { sanitizeFileName } from './sanitizeFileName.ts';

/**
 * The extension a site's own figures end in.
 * @param site - The site, e.g. `3d`.
 * @returns E.g. `.3d.svg`.
 */
export function siteFigureExtension(site: string): string {
  return `.${site}.svg`;
}

/**
 * The name a site's own figure is saved under: its stem, then the site's
 * extension, once — a stem that already ends in it is not given it twice.
 * @param stem - What the figure is called, e.g. `benzene`.
 * @param site - The site, e.g. `3d`.
 * @returns E.g. `benzene.3d.svg`.
 */
export function siteFigureName(stem: string, site: string): string {
  const extension = siteFigureExtension(site);
  const bare = stem.toLowerCase().endsWith(extension)
    ? stem.slice(0, -extension.length)
    : stem;
  return `${sanitizeFileName(bare, site)}${extension}`;
}

/**
 * The name an SVG is saved under: the site's extension when the figure says
 * which site drew it, `.svg` otherwise.
 * @param stem - What the figure is called.
 * @param svg - The figure, as an SVG document.
 * @returns E.g. `benzene.3d.svg`, or `benzene.svg`.
 */
export function figureFileName(stem: string, svg: string): string {
  const site = readFigureSource(svg)?.site;
  return site === undefined
    ? `${sanitizeFileName(stem, 'figure')}.svg`
    : siteFigureName(stem, site);
}

/**
 * A stem chosen for a file saved without a name asked for: what it holds, then
 * the minute it was saved, so two saves of one session never overwrite each
 * other.
 * @param prefix - What the file holds, e.g. `apparatus`.
 * @param now - The moment it is saved.
 * @default now
 * @returns E.g. `apparatus-2026-11-07-1715`.
 */
export function automaticFileStem(prefix: string, now = new Date()): string {
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `${prefix}-${date}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}
