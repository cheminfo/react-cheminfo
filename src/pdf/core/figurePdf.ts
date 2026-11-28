/**
 * A figure as a PDF that opens again where it was made: its SVG drawn on a
 * page its own size, or each sheet of its paper on a page of its own, in
 * vectors, with the site's own SVG attached to the file whole, the way a
 * PDF/A-3 carries its source. Opening the PDF reads the attachment, so the
 * figure comes back rather than its picture. jsPDF, svg2pdf.js and pdf-lib
 * load only when a PDF is written or read.
 */

import { svgSizeInPoints } from '../../download/core/svgMarkup.ts';

import type { PdfFace } from './pdfFonts.ts';
import { addPdfFonts, assignPdfFonts } from './pdfFonts.ts';

/** The name a figure is attached to a PDF under, unless the site names one. */
export const PDF_ATTACHMENT = 'drawing.svg';

/** The keyword of a PDF split by page, so Save writes it back the same way. */
export const SPLIT_PDF_KEYWORD = 'split-by-page';

/** What a figure's PDF says about itself and the source it carries. */
export interface FigurePdfOptions {
  /** The PDF's title, as a reader shows it. */
  title: string;
  /** The program named as the PDF's creator, such as `draw.cheminfo.org`. */
  creator: string;
  /** The SVG attached whole, which the site opens again. */
  attachment: {
    /**
     * What a PDF reader says the attachment is, such as `The drawing, which
     * draw.cheminfo.org opens again`.
     */
    description: string;
    /**
     * The attachment's file name.
     * @default PDF_ATTACHMENT
     */
    name?: string;
  };
  /**
   * What each page of the PDF draws, an SVG the size of the page; the PDF is
   * then marked as split by page.
   * @default the figure's SVG, on one page its own size
   */
  pages?: readonly string[];
}

/**
 * Write a figure's SVG as a PDF that carries it.
 * @param svg - The site's own SVG of the figure, attached to the PDF.
 * @param options - See {@link FigurePdfOptions}.
 * @returns The PDF.
 */
export async function writeFigurePdf(
  svg: string,
  options: FigurePdfOptions,
): Promise<Blob> {
  const { title, creator, attachment, pages } = options;
  const [{ jsPDF: JsPdf }, { svg2pdf }, { AFRelationship, PDFDocument }] =
    await Promise.all([
      import('jspdf'),
      import('svg2pdf.js'),
      import('pdf-lib'),
    ]);
  const faces = new Set<PdfFace>();
  const sources = pages ?? [svg];
  const sheets: Array<{ root: Element; width: number; height: number }> = [];
  for (const page of sources) {
    const root = new DOMParser().parseFromString(
      page,
      'image/svg+xml',
    ).documentElement;
    for (const face of assignPdfFonts(root)) faces.add(face);
    sheets.push({ root, ...svgSizeInPoints(page) });
  }
  const pdf = new JsPdf({
    unit: 'pt',
    format: [sheets[0]?.width ?? 1, sheets[0]?.height ?? 1],
    orientation: orientationOf(sheets[0]),
    compress: true,
  });
  await addPdfFonts(pdf, faces);
  // jsPDF draws on the page last added, so the pages are drawn one at a time.
  let drawn: Promise<unknown> = Promise.resolve();
  for (let index = 0; index < sheets.length; index++) {
    const sheet = sheets[index] as (typeof sheets)[number];
    const { root, width, height } = sheet;
    drawn = drawn.then(() => {
      if (index > 0) pdf.addPage([width, height], orientationOf(sheet));
      return svg2pdf(root, pdf, { x: 0, y: 0, width, height });
    });
  }
  await drawn;

  const document = await PDFDocument.load(pdf.output('arraybuffer'), {
    updateMetadata: false,
  });
  document.setTitle(title);
  document.setCreator(creator);
  if (pages) document.setKeywords([SPLIT_PDF_KEYWORD]);
  await document.attach(
    new TextEncoder().encode(svg),
    attachment.name ?? PDF_ATTACHMENT,
    {
      mimeType: 'image/svg+xml',
      description: attachment.description,
      afRelationship: AFRelationship.Source,
    },
  );
  const bytes = await document.save();
  return new Blob([bytes as Uint8Array<ArrayBuffer>], {
    type: 'application/pdf',
  });
}

/**
 * Whether a file is a PDF, by the bytes it starts with.
 * @param file - The file.
 * @returns True for a PDF.
 */
export async function isPdf(file: Blob): Promise<boolean> {
  return (await file.slice(0, 5).text()) === '%PDF-';
}

/**
 * Whether a PDF was written split by page, so Save writes it back the same way.
 * @param file - The PDF.
 * @returns True when it says so.
 */
export async function isSplitPdf(file: Blob): Promise<boolean> {
  const { PDFDocument } = await import('pdf-lib');
  const document = await PDFDocument.load(await file.arrayBuffer(), {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  return document.getKeywords()?.includes(SPLIT_PDF_KEYWORD) ?? false;
}

function orientationOf(
  sheet: { width: number; height: number } | undefined,
): 'landscape' | 'portrait' {
  return sheet && sheet.width > sheet.height ? 'landscape' : 'portrait';
}
