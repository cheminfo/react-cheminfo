// @vitest-environment jsdom
import { PDFDocument } from 'pdf-lib';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { isSplitPdf, writeFigurePdf } from '../figurePdf.ts';
import { readPdfAttachment } from '../pdfAttachment.ts';

// The package's main file is a UMD build that looks for jsPDF on the global
// object; a browser bundler reads its ES build, and so does this test.
const { esBuild } = vi.hoisted(() => ({
  esBuild: 'svg2pdf.js/dist/svg2pdf.es.min.js',
}));
vi.mock('svg2pdf.js', () => import(esBuild));

// jsdom and Node each bring a Uint8Array, and pdf-lib takes the bytes of an
// attachment only from the one it sees: a browser has one.
class OneRealmEncoder extends TextEncoder {
  override encode(input?: string): Uint8Array<ArrayBuffer> {
    return new Uint8Array(super.encode(input));
  }
}

beforeEach(() => {
  vi.stubGlobal('TextEncoder', OneRealmEncoder);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** A figure with no text, so no font is fetched. */
const FIGURE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="200pt" height="100pt" viewBox="0 0 200 100"><generator>glassware.cheminfo.org</generator><rect x="10" y="10" width="50" height="20" fill="#0d9488"/></svg>';

const PAGE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="100pt" height="150pt" viewBox="0 0 100 150"><circle cx="50" cy="50" r="20"/></svg>';

function isOwn(text: string): boolean {
  return text.includes('<generator>glassware.cheminfo.org</generator>');
}

test('a figure PDF names its title and creator and carries its SVG', async () => {
  const pdf = await writeFigurePdf(FIGURE, {
    title: 'Reflux',
    creator: 'glassware.cheminfo.org',
    attachment: {
      description: 'The apparatus, which glassware.cheminfo.org opens again',
    },
  });
  const bytes = await pdf.arrayBuffer();
  const document = await PDFDocument.load(bytes, { updateMetadata: false });

  expect(document.getTitle()).toBe('Reflux');
  expect(document.getCreator()).toBe('glassware.cheminfo.org');
  expect(document.getPageCount()).toBe(1);
  expect(document.getPage(0).getSize()).toStrictEqual({
    width: 200,
    height: 100,
  });
  await expect(readPdfAttachment(bytes, isOwn)).resolves.toBe(FIGURE);
  await expect(isSplitPdf(pdf)).resolves.toBe(false);
});

test('a figure split by page is a page per sheet, and says so', async () => {
  const pdf = await writeFigurePdf(FIGURE, {
    title: 'Two sheets',
    creator: 'draw.cheminfo.org',
    attachment: { description: 'The drawing', name: 'figure.svg' },
    pages: [PAGE, PAGE],
  });
  const document = await PDFDocument.load(await pdf.arrayBuffer());

  expect(document.getPageCount()).toBe(2);
  expect(document.getPage(1).getSize()).toStrictEqual({
    width: 100,
    height: 150,
  });
  await expect(isSplitPdf(pdf)).resolves.toBe(true);
  await expect(readPdfAttachment(await pdf.arrayBuffer(), isOwn)).resolves.toBe(
    FIGURE,
  );
});
