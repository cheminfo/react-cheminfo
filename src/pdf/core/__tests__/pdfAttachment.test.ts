import { AFRelationship, PDFDocument } from 'pdf-lib';
import { expect, test } from 'vitest';

import { PDF_ATTACHMENT, isPdf, isSplitPdf } from '../figurePdf.ts';
import { readPdfAttachment } from '../pdfAttachment.ts';

/** A site's own SVG, told by the generator it names. */
const OURS =
  '<svg xmlns="http://www.w3.org/2000/svg" width="10pt" height="10pt"><metadata><generator>draw.cheminfo.org</generator></metadata></svg>';

function isOwn(text: string): boolean {
  return text.includes('<generator>draw.cheminfo.org</generator>');
}

async function pdfWith(attachments: Record<string, string>): Promise<Blob> {
  const document = await PDFDocument.create();
  document.addPage([100, 100]);
  const written: Array<Promise<void>> = [];
  for (const [name, text] of Object.entries(attachments)) {
    written.push(
      document.attach(new TextEncoder().encode(text), name, {
        mimeType: 'image/svg+xml',
        afRelationship: AFRelationship.Source,
      }),
    );
  }
  await Promise.all(written);
  return new Blob([(await document.save()) as Uint8Array<ArrayBuffer>], {
    type: 'application/pdf',
  });
}

test('a PDF gives back the figure attached to it, past any other attachment', async () => {
  const pdf = await pdfWith({
    'spectrum.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
    [PDF_ATTACHMENT]: OURS,
  });

  await expect(isPdf(pdf)).resolves.toBe(true);
  await expect(
    readPdfAttachment(new Uint8Array(await pdf.arrayBuffer()), isOwn),
  ).resolves.toBe(OURS);
});

test('a PDF that carries no figure of the site gives back nothing', async () => {
  const pdf = await pdfWith({
    'spectrum.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
  });

  await expect(
    readPdfAttachment(await pdf.arrayBuffer(), isOwn),
  ).resolves.toBeUndefined();

  const bare = await pdfWith({});

  await expect(
    readPdfAttachment(await bare.arrayBuffer(), isOwn),
  ).resolves.toBeUndefined();
});

test('only a file starting as a PDF is read as one', async () => {
  await expect(isPdf(new Blob(['%PDF-1.7\n']))).resolves.toBe(true);
  await expect(isPdf(new Blob([OURS]))).resolves.toBe(false);
  await expect(isPdf(new Blob(['%PD']))).resolves.toBe(false);
});

test('only a PDF that says it is split by page reads as one', async () => {
  const document = await PDFDocument.create();
  document.addPage([100, 100]);
  const saved = async () =>
    new Blob([(await document.save()) as Uint8Array<ArrayBuffer>]);

  await expect(isSplitPdf(await saved())).resolves.toBe(false);

  document.setKeywords(['split-by-page']);

  await expect(isSplitPdf(await saved())).resolves.toBe(true);
});
