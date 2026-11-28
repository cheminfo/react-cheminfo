/**
 * The files a PDF carries attached, read back: how a figure's PDF opens again
 * as the figure rather than as its picture.
 */

/**
 * The text of the first file attached to a PDF that a site takes as its own,
 * whatever its name there.
 * @param data - The PDF's bytes.
 * @param accept - Whether an attached text is the site's own figure, such as
 * its native SVG test.
 * @returns The text, or undefined when the PDF carries none it accepts.
 */
export async function readPdfAttachment(
  data: ArrayBuffer | Uint8Array,
  accept: (text: string) => boolean,
): Promise<string | undefined> {
  const {
    PDFArray,
    PDFDict,
    PDFDocument,
    PDFName,
    PDFRawStream,
    decodePDFRawStream,
  } = await import('pdf-lib');
  const document = await PDFDocument.load(data, {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  const names = document.catalog.lookupMaybe(PDFName.of('Names'), PDFDict);
  const tree = names?.lookupMaybe(PDFName.of('EmbeddedFiles'), PDFDict);
  // A name tree keeps its entries in `Names`, two by two, or in the nodes of
  // its `Kids`.
  const nodes = tree ? [tree] : [];
  const decoder = new TextDecoder();
  for (let node = nodes.pop(); node; node = nodes.pop()) {
    const kids = node.lookupMaybe(PDFName.of('Kids'), PDFArray);
    for (let index = 0; index < (kids?.size() ?? 0); index++) {
      const kid = kids?.lookupMaybe(index, PDFDict);
      if (kid) nodes.push(kid);
    }
    const entries = node.lookupMaybe(PDFName.of('Names'), PDFArray);
    for (let index = 1; index < (entries?.size() ?? 0); index += 2) {
      const files = entries
        ?.lookupMaybe(index, PDFDict)
        ?.lookupMaybe(PDFName.of('EF'), PDFDict);
      const stream =
        files?.lookup(PDFName.of('F')) ?? files?.lookup(PDFName.of('UF'));
      if (!(stream instanceof PDFRawStream)) continue;
      const text = decoder.decode(decodePDFRawStream(stream).decode());
      if (accept(text)) return text;
    }
  }
  return undefined;
}
