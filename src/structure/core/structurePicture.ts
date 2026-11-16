/**
 * A structure as a picture, drawn at the size it is saved at.
 *
 * The resolution is a bond length rather than a canvas: OpenChemLib caps the
 * bond it draws at 24 pixels whatever box it is given, so asking for a canvas
 * four times larger produces the same small drawing with more white around it
 * — a resolution control that changes the file and not the picture. Lifting
 * the cap and cropping to the structure is what makes `4×` genuinely four
 * times the drawing.
 */

import type { Molecule, MoleculeToSVGOptions } from 'openchemlib';

import type { FigurePixels } from '../../download/core/figureScale.ts';

/** How the picture is drawn. */
export interface StructurePictureOptions {
  /**
   * The longest bond drawn, in pixels, which is what sets the size of
   * everything else — the picture is cropped to the structure afterwards.
   * @default 60
   */
  bondLength?: number;
  /**
   * What is painted behind the structure. An SVG left unpainted opens
   * transparent, and a structure is drawn in black, so it disappears in
   * anything with a dark background — a slide, a reader in dark mode.
   * @default '#ffffff'
   */
  background?: string;
  /**
   * The id of the document, which its own style rules are scoped to. Named, the
   * same structure gives the same file on every run, which a figure kept in a
   * repository needs.
   * @default undefined — numbered by OpenChemLib, from a counter of its own
   */
  id?: string;
  /**
   * Whether the stereo text is written: "abs" and the enantiomer note under
   * the structure, the R and S of each centre, E and Z, and the "?" of a centre
   * left undefined. The wedges are drawn either way; a figure read at a glance
   * is clearer without the labels.
   * @default true
   */
  stereoText?: boolean;
  /**
   * The type the atom labels are set in, as a CSS `font-family`. OpenChemLib
   * writes `sans-serif` into the document's own style, which no stylesheet of
   * a page reaches when the file is opened on its own.
   * @default undefined — `sans-serif`, as OpenChemLib writes it
   */
  fontFamily?: string;
  /**
   * More of OpenChemLib's drawing options — atom numbers, grey bonds, no
   * implicit hydrogens. The size and the crop are not among them: they follow
   * `bondLength`.
   * @default {}
   */
  depictor?: StructureDepictorOptions;
}

/** OpenChemLib's drawing options a picture may set; the size is its own. */
export type StructureDepictorOptions = Omit<
  MoleculeToSVGOptions,
  'autoCrop' | 'autoCropMargin' | 'maxAVBL'
>;

/** A structure drawn, and how big it came out. */
export interface StructurePicture extends FigurePixels {
  /** The SVG document, ready to be saved or rasterized. */
  markup: string;
}

/**
 * The bond length a picture is drawn at before the resolution multiplies it.
 *
 * Chosen so a drug-sized molecule comes out around 300 pixels wide, which is
 * what a note or a chat window wants; two or three times that is a slide, and
 * four is print.
 */
export const STRUCTURE_BOND_LENGTH = 60;

/**
 * The canvas the structure is laid out in before it is cropped out of it.
 *
 * Only a ceiling: past it the box, rather than the bond length, would decide
 * the size, and it is far beyond what a browser will paint anyway.
 */
const CANVAS = 20_000;

/** Where the opening `<svg …>` tag ends, so the background goes after it. */
const OPEN_TAG = /<svg\b[^>]*>/u;

/** The size OpenChemLib wrote on the document it produced. */
const SIDE = /\b(?<side>width|height)="(?<pixels>\d+)px"/gu;

/**
 * Draw a structure as a standalone SVG document, cropped to the structure.
 * @param molecule - The structure. Not modified.
 * @param options - How large to draw it, and what to paint behind it.
 * @returns The document and the size it came out at.
 */
export function structurePicture(
  molecule: Molecule,
  options: StructurePictureOptions = {},
): StructurePicture {
  const {
    bondLength = STRUCTURE_BOND_LENGTH,
    background = '#ffffff',
    id,
    stereoText = true,
    fontFamily,
    depictor,
  } = options;
  const drawn = molecule.toSVG(CANVAS, CANVAS, id, {
    ...depictor,
    ...(stereoText ? undefined : NO_STEREO_TEXT),
    autoCrop: true,
    autoCropMargin: Math.max(2, Math.round(bondLength / 6)),
    maxAVBL: Math.max(1, Math.round(bondLength)),
  });
  const markup =
    fontFamily === undefined ? drawn : withFontFamily(drawn, fontFamily);

  return { markup: painted(markup, background), ...sizeOf(markup) };
}

/** What leaves the stereo text out of a picture, wedges kept. */
const NO_STEREO_TEXT: StructureDepictorOptions = {
  suppressChiralText: true,
  suppressCIPParity: true,
  suppressESR: true,
  noStereoProblem: true,
};

/** The rule OpenChemLib sets the labels' type with, in the document's style. */
const FONT_RULE = /(?<rule> text \{font-family: )sans-serif;/u;

/**
 * Set the labels in another type than the `sans-serif` OpenChemLib names.
 *
 * The family is written into a style element, so whatever could close the
 * rule or the element is left out of it.
 * @param markup - The document as OpenChemLib wrote it.
 * @param fontFamily - The CSS `font-family`.
 * @returns The document.
 */
function withFontFamily(markup: string, fontFamily: string): string {
  const family = fontFamily.replaceAll(/[{};<>&]/gu, '').trim();
  if (family === '') return markup;
  return markup.replace(
    FONT_RULE,
    (_match, rule: string) => `${rule}${family};`,
  );
}

/**
 * Paint a background into the document, so the file does not open
 * transparent.
 * @param markup - The document as OpenChemLib wrote it.
 * @param background - What to paint, or `transparent` to paint nothing.
 * @returns The document.
 */
function painted(markup: string, background: string): string {
  if (background === 'transparent') return markup;
  const open = OPEN_TAG.exec(markup);
  // A document whose opening tag cannot be found is handed back unpainted
  // rather than corrupted by an insertion at a guessed offset.
  if (open === null) return markup;
  const end = open.index + open[0].length;
  return `${markup.slice(0, end)}<rect width="100%" height="100%" fill="${background}" />${markup.slice(end)}`;
}

/**
 * How big the cropped document came out.
 *
 * Read off the document rather than computed, because the crop is the
 * structure's own shape: two molecules asked for at the same bond length come
 * out at different sizes, and the size is what the reader is shown.
 * @param markup - The document as OpenChemLib wrote it.
 * @returns Its size in pixels.
 */
function sizeOf(markup: string): FigurePixels {
  const sides: Record<string, number> = {};
  SIDE.lastIndex = 0;
  for (const match of markup.matchAll(SIDE)) {
    const { side, pixels } = match.groups ?? {};
    if (side !== undefined && pixels !== undefined && !(side in sides)) {
      sides[side] = Number(pixels);
    }
  }
  return { width: sides.width ?? CANVAS, height: sides.height ?? CANVAS };
}
