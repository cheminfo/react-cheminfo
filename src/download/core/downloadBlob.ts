/**
 * Hand a blob to the browser as a file the visitor saves.
 *
 * The object URL is released as soon as the click is dispatched, so nothing a
 * page ever downloads is kept alive in memory behind it.
 * @param blob - The bytes to save.
 * @param fileName - Name the browser gives the saved file, extension included.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  // Some browsers ignore a click on an anchor that is not in the document.
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
