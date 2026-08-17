import { downloadBlob } from './downloadBlob.ts';

/** What a file of text is taken to be when the caller does not say. */
const DEFAULT_MIME_TYPE = 'text/plain;charset=utf-8';

/**
 * Hand a piece of text to the browser as a file the visitor saves.
 * @param text - The content of the file.
 * @param fileName - Name the browser gives the saved file, extension included.
 * @param mimeType - What the content is, so the system opens it with the right
 *   application.
 */
export function downloadText(
  text: string,
  fileName: string,
  mimeType: string = DEFAULT_MIME_TYPE,
): void {
  downloadBlob(new Blob([text], { type: mimeType }), fileName);
}
