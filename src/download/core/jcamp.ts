/**
 * What every JCAMP-DX writer of the family shares: the file's extension and
 * type, one record value, the `LINK` block a list is saved in, and the
 * download of a list as one file.
 */

import { downloadText } from './downloadText.ts';
import { sanitizeFileName } from './sanitizeFileName.ts';

/** The extension a written spectrum is saved under. */
export const JCAMP_EXTENSION = '.jdx';

/** What a JCAMP-DX file is served as. */
export const JCAMP_MIME_TYPE = 'chemical/x-jcamp-dx';

/**
 * A value put where a JCAMP record's value goes.
 *
 * A record is one line and `$$` opens a comment that runs to the end of it, so
 * a value with a newline in it — an instrument's scan description, as often as
 * not — would otherwise either break the file in two or lose its tail. Both
 * failures are silent on the way back in, which is why this is done to every
 * value rather than to the ones known to be long.
 * @param value - The value as it is held.
 * @returns The value as one line, with no comment marker in it.
 */
export function jcampRecordValue(value: string): string {
  return value.replaceAll(/\s+/g, ' ').replaceAll('$$', '$').trim();
}

/**
 * Several blocks as one file, inside the `LINK` block JCAMP has for a
 * container, so dropping the file back on a chart brings the whole list back.
 * A list of one is that block alone: wrapping a single spectrum gains nothing.
 * @param title - What to call the file's own outer block.
 * @param blocks - The blocks, in the order the list holds them.
 * @returns The file.
 */
export function jcampLinkFile(
  title: string,
  blocks: readonly string[],
): string {
  const [only] = blocks;
  if (blocks.length === 1 && only !== undefined) return only;
  return `##TITLE=${jcampRecordValue(title)}
##JCAMP-DX=4.24
##DATA TYPE=LINK
##BLOCKS=${blocks.length}
${blocks.join('\n')}
##END=
`;
}

/**
 * Download a list as one JCAMP-DX file. A list of one is saved under that
 * item's own name, since the file is that spectrum: a chemist who has one open
 * should not have to work out which of their downloads `spectra.jdx` was.
 * @param items - What is saved, in the order the list holds it.
 * @param nameOf - The name of one item, as the list calls it.
 * @param write - The file the list is written as.
 */
export function downloadJcampList<TItem>(
  items: readonly TItem[],
  nameOf: (item: TItem) => string,
  write: (items: readonly TItem[]) => string,
): void {
  const [only] = items;
  const name =
    items.length === 1 && only !== undefined
      ? sanitizeFileName(nameOf(only), 'spectrum')
      : 'spectra';
  downloadText(write(items), `${name}${JCAMP_EXTENSION}`, JCAMP_MIME_TYPE);
}
