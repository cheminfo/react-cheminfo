import { cropFigure } from '../../download/core/cropFigure.ts';
import { svgAttribute, svgRootTag } from '../../download/core/svgMarkup.ts';

/**
 * A figure handed back by a framed tool, cropped to what it draws when it is
 * a page-sized SVG in pixels. A drawing in points — what draw and its kin
 * write — is already cropped, and is handed back as it came.
 * @param svg - The SVG document the tool handed back.
 * @returns The document, cropped.
 */
export async function croppedToolFigure(svg: string): Promise<string> {
  const root = svgRootTag(svg);
  const stated = svgAttribute(root, 'width');
  if (stated !== undefined && /^[\d.]+pt$/.test(stated)) return svg;
  const width = Number(stated);
  const height = Number(svgAttribute(root, 'height'));
  if (!(width > 0 && height > 0)) return svg;
  const { markup } = await cropFigure({ markup: svg, width, height });
  return markup;
}
