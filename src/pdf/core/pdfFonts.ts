/**
 * The fonts a figure's PDF is set in. A PDF's own fonts reach Latin-1 only,
 * so a minus sign, a Greek letter or an arrow would print as another glyph:
 * the labels and captions are set in Arimo instead, drawn to Arial's metrics,
 * so each text keeps the width it has on screen, and jsPDF keeps only the
 * glyphs used. Times and Courier stay the PDF's own while their text fits
 * Latin-1. svg2pdf.js lays each text out with the widths the browser measures,
 * so the page is given the same Arimo: a centred caption, or a script beside
 * its text, then lands where the PDF draws it.
 *
 * The faces ship in the package's `assets/fonts`, under the SIL Open Font
 * License beside them, and are fetched only when a PDF is written.
 */

import type { jsPDF } from 'jspdf';

/** A face of a family, named as jsPDF and svg2pdf.js name it. */
export type PdfFace = 'normal' | 'bold' | 'italic' | 'bolditalic';

/** The family embedded in the PDF. */
const EMBEDDED_FAMILY = 'Arimo';

// Written out in full so a bundler finds each file and ships it beside the
// script that fetches it.
const ARIMO: Record<PdfFace, () => URL> = {
  normal: () =>
    new URL('../../../assets/fonts/Arimo-Regular.ttf', import.meta.url),
  bold: () => new URL('../../../assets/fonts/Arimo-Bold.ttf', import.meta.url),
  italic: () =>
    new URL('../../../assets/fonts/Arimo-Italic.ttf', import.meta.url),
  bolditalic: () =>
    new URL('../../../assets/fonts/Arimo-BoldItalic.ttf', import.meta.url),
};

const DESCRIPTORS: Record<PdfFace, FontFaceDescriptors> = {
  normal: { weight: '400', style: 'normal' },
  bold: { weight: '700', style: 'normal' },
  italic: { weight: '400', style: 'italic' },
  bolditalic: { weight: '700', style: 'italic' },
};

// Each face is fetched and given to the page once, whatever the PDFs saved.
const loadedFaces = new Map<PdfFace, Promise<ArrayBuffer>>();

/**
 * Point every text of an SVG at a font the PDF holds, and say which faces of
 * the embedded family the texts are set in.
 * @param root - The SVG, parsed; its texts are changed in place.
 * @returns The faces to embed.
 */
export function assignPdfFonts(root: Element): Set<PdfFace> {
  const faces = new Set<PdfFace>();
  for (const text of root.querySelectorAll('text')) {
    const family =
      builtinFamily(inherited(text, 'font-family'), text.textContent ?? '') ??
      EMBEDDED_FAMILY;
    text.setAttribute('font-family', family);
    for (const span of text.querySelectorAll('[font-family]')) {
      span.removeAttribute('font-family');
    }
    if (family !== EMBEDDED_FAMILY) continue;
    for (const element of [text, ...text.querySelectorAll('tspan')]) {
      if (hasOwnText(element)) faces.add(faceOf(element));
    }
  }
  return faces;
}

/**
 * Embed the faces of the embedded family a PDF uses.
 * @param pdf - The PDF being written.
 * @param faces - The faces its texts are set in.
 */
export async function addPdfFonts(
  pdf: jsPDF,
  faces: ReadonlySet<PdfFace>,
): Promise<void> {
  const wanted = [...faces];
  const pending: Array<Promise<ArrayBuffer>> = [];
  for (const face of wanted) pending.push(faceBytes(face));
  const loaded = await Promise.all(pending);
  for (let index = 0; index < wanted.length; index++) {
    const face = wanted[index] as PdfFace;
    const file = `${EMBEDDED_FAMILY}-${face}.ttf`;
    pdf.addFileToVFS(
      file,
      binaryString(new Uint8Array(loaded[index] as ArrayBuffer)),
    );
    pdf.addFont(file, EMBEDDED_FAMILY, face);
  }
}

function faceBytes(face: PdfFace): Promise<ArrayBuffer> {
  let bytes = loadedFaces.get(face);
  if (!bytes) {
    bytes = loadFace(face);
    loadedFaces.set(face, bytes);
    bytes.catch(() => loadedFaces.delete(face));
  }
  return bytes;
}

async function loadFace(face: PdfFace): Promise<ArrayBuffer> {
  const response = await fetch(ARIMO[face]());
  if (!response.ok) {
    throw new Error(`The font of the PDF did not load (${response.status}).`);
  }
  const bytes = await response.arrayBuffer();
  const font = new FontFace(EMBEDDED_FAMILY, bytes.slice(0), DESCRIPTORS[face]);
  document.fonts.add(await font.load());
  return bytes;
}

// Times and Courier are fonts every PDF reader has, as long as the text is
// Latin-1; anything past it would print as another glyph.
function builtinFamily(
  family: string | undefined,
  text: string,
): string | undefined {
  if (!family || !isLatin1(text)) return undefined;
  const first = family.split(',', 1)[0]?.trim().replaceAll(/['"]/g, '') ?? '';
  if (/^times|serif$/i.test(first)) return 'times';
  if (/^courier|monospace$/i.test(first)) return 'courier';
  return undefined;
}

function isLatin1(text: string): boolean {
  for (let index = 0; index < text.length; index++) {
    if ((text.codePointAt(index) ?? 0) > 0xff) return false;
  }
  return true;
}

function inherited(element: Element, name: string): string | undefined {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const value = node.getAttribute(name);
    if (value) return value;
  }
  return undefined;
}

function hasOwnText(element: Element): boolean {
  for (const node of element.childNodes) {
    if (node.nodeType === 3 && node.textContent?.trim()) return true;
  }
  return false;
}

function faceOf(element: Element): PdfFace {
  const weight = inherited(element, 'font-weight') ?? 'normal';
  const style = inherited(element, 'font-style') ?? 'normal';
  const bold =
    weight === 'bold' || weight === 'bolder' || Number(weight) >= 600;
  const italic = style === 'italic' || style === 'oblique';
  if (bold) return italic ? 'bolditalic' : 'bold';
  return italic ? 'italic' : 'normal';
}

// jsPDF reads a font from its virtual file system as a binary string.
function binaryString(bytes: Uint8Array): string {
  const chunks: string[] = [];
  for (let start = 0; start < bytes.length; start += 0x8000) {
    chunks.push(String.fromCodePoint(...bytes.subarray(start, start + 0x8000)));
  }
  return chunks.join('');
}
