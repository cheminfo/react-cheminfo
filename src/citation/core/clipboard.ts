import type { CitationFormatId } from './formats.ts';
import type { Reference } from './reference.ts';
import type { CitationStyleId } from './segments.ts';
import { formatCitations } from './works.ts';

/**
 * Put every reference a site asks for on the clipboard, in one value. HTML goes
 * on in both flavours, so a paste into Word or Google Docs keeps the emphasis of
 * the style while a plain text editor still receives readable lines rather than
 * the markup.
 * @param references - References to copy, in reading order.
 * @param format - Format to copy them in.
 * @param style - Journal style, for the formats that have one.
 * @returns Resolves once the clipboard holds the citations.
 */
export function copyCitations(
  references: readonly Reference[],
  format: CitationFormatId,
  style?: CitationStyleId,
): Promise<void> {
  const value = formatCitations(references, format, style);
  if (format !== 'html' || typeof ClipboardItem === 'undefined') {
    return navigator.clipboard.writeText(value);
  }
  return navigator.clipboard.write([
    new ClipboardItem({
      'text/html': new Blob([value], { type: 'text/html' }),
      'text/plain': new Blob([formatCitations(references, 'text', style)], {
        type: 'text/plain',
      }),
    }),
  ]);
}

/**
 * Put one reference on the clipboard.
 * @param reference - Reference to copy.
 * @param format - Format to copy it in.
 * @param style - Journal style, for the formats that have one.
 * @returns Resolves once the clipboard holds the citation.
 */
export function copyCitation(
  reference: Reference,
  format: CitationFormatId,
  style?: CitationStyleId,
): Promise<void> {
  return copyCitations([reference], format, style);
}
