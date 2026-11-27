import { writeClipboardItem } from '../../clipboard/core/clipboardItem.ts';
import { writeToClipboard } from '../../clipboard/core/writeToClipboard.ts';

import type { CitationFormatId } from './formats.ts';
import type { Reference } from './reference.ts';
import { formatCitations } from './works.ts';

/**
 * Put every reference a site asks for on the clipboard, in one value. HTML goes
 * on in both flavours, so a paste into Word or Google Docs keeps the emphasis of
 * the style while a plain text editor still receives readable lines rather than
 * the markup. The write starts with the click and the citations follow while
 * they are formatted, which is what Safari asks of a copy.
 * @param references - References to copy, in reading order.
 * @param format - Format to copy them in.
 * @param style - The CSL style of a format written as a journal writes it.
 * @returns Resolves once the clipboard holds the citations.
 * @throws {Error} When the clipboard took nothing.
 */
export async function copyCitations(
  references: readonly Reference[],
  format: CitationFormatId,
  style?: string,
): Promise<void> {
  const value = formatCitations(references, format, style);
  const text =
    format === 'html' ? formatCitations(references, 'text', style) : value;
  const representations: Record<string, Promise<Blob>> = {
    'text/plain': text.then(
      (written) => new Blob([written], { type: 'text/plain' }),
    ),
  };
  if (format === 'html') {
    representations['text/html'] = value.then(
      (written) => new Blob([written], { type: 'text/html' }),
    );
  }
  if (await writeClipboardItem(representations)) return;
  if (!(await writeToClipboard(await text))) {
    throw new Error('The clipboard refused the citation');
  }
}
