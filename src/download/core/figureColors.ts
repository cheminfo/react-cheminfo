/**
 * A figure in colour, in grey, or in black and white.
 *
 * Every colour the file is painted with is rewritten where it is written — a
 * paint attribute, a `style` attribute, a `<style>` element — rather than
 * passed through a filter, so the file stays shapes in literal colours: an
 * editor opens them as they are, and a journal's PDF conversion keeps them as
 * vectors instead of flattening a filtered group into pixels. A raster inside
 * the file, such as a 3D scene, is greyed by a filter, since it is pixels
 * either way.
 */

import type { Color } from 'culori/fn';
import {
  converter,
  formatHex,
  formatRgb,
  modeHsl,
  modeHwb,
  modeLab,
  modeLch,
  modeLrgb,
  modeOklab,
  modeOklch,
  modeP3,
  modeRgb,
  parse,
  useMode as registerMode,
  wcagLuminance,
} from 'culori/fn';

import { clamp } from '../../format/core/clamp.ts';

import type { FigureSvg } from './figureSvg.ts';

/**
 * How the colours of a figure leave the page: as drawn, as greys of the same
 * lightness, or as black ink on white paper.
 */
export type FigureColors = 'color' | 'grey' | 'blackWhite';

/** The choices, in the order they are offered. */
export const FIGURE_COLORS: readonly FigureColors[] = [
  'color',
  'grey',
  'blackWhite',
];

/**
 * The figure with its colours rewritten.
 * @param figure - The figure, as it was drawn.
 * @param colors - See {@link FigureColors}.
 * @returns The figure in those colours: the same object for `color`.
 */
export function recoloredFigure(
  figure: FigureSvg,
  colors: FigureColors,
): FigureSvg {
  if (colors === 'color') return figure;
  return { ...figure, markup: recolorFigureMarkup(figure.markup, colors) };
}

/**
 * An SVG document with every colour it is painted with rewritten.
 *
 * In grey each colour becomes the grey of the same luminance, so a dark red
 * and a dark blue become the same grey. In black and white every colour with
 * a hue becomes ink or paper: a line is black unless it is all but white, so
 * a pale yellow curve stays on the page; a filled shape — a cell, a marker, a
 * letter — is white from half the luminance of white up, so a tinted cell
 * keeps its black words readable. The greys of the frame — grid, axes, muted
 * words — keep their lightness, so a faint grid does not become black bars
 * across the data. Opacity is kept. A value no colour can be read from — `none`, `url(#…)`,
 * `currentColor`, a `color-mix()` — is left as written.
 * @param markup - The SVG document.
 * @param colors - See {@link FigureColors}.
 * @returns The document, recoloured.
 */
export function recolorFigureMarkup(
  markup: string,
  colors: FigureColors,
): string {
  if (colors === 'color') return markup;
  registerModes();
  const css = (text: string) =>
    replaceGroups(text, PAINT_DECLARATION, ({ name = '', value = '' }) =>
      recolor(value, name, colors),
    );
  const recolored = replaceGroups(
    markup.replaceAll(STYLE_ELEMENT, css).replaceAll(STYLE_ATTRIBUTE, css),
    PAINT_ATTRIBUTE,
    ({ name = '', value = '' }) => recolor(value, name, colors),
  );
  return greyImages(recolored);
}

/** The properties that hold a colour an SVG is painted with. */
const PAINTS = 'fill|stroke|stop-color|flood-color|lighting-color|color';

/** A paint attribute's value, with the property it paints. */
const PAINT_ATTRIBUTE = new RegExp(
  String.raw`(?<=\s(?<name>${PAINTS})=(?<quote>["']))(?<value>[^"']*)(?=\k<quote>)`,
  'g',
);
/** The declarations of a `style` attribute. */
const STYLE_ATTRIBUTE = /(?<=\sstyle=")[^"]*(?=")/g;
/** The rules of a `<style>` element. */
const STYLE_ELEMENT = /(?<=<style\b[^>]*>)[\s\S]*?(?=<\/style>)/g;
/** A paint declaration's value, with the property it paints. */
const PAINT_DECLARATION = new RegExp(
  String.raw`(?<=(?:^|[\s;{])(?<name>${PAINTS})\s*:\s*)(?<value>[^\s;}!"][^;}!"]*)`,
  'g',
);
const IMAGE_WITHOUT_FILTER = /<image\b(?![^>]*\sfilter=)/g;
const ROOT_SVG = /<svg\b[^>]*>/;

/** The filter a raster inside the figure is greyed by. */
const GREY_FILTER_ID = 'cheminfo-figure-grey';

/**
 * The luminance from which a paint stays white in black and white. Lines are
 * ink nearly always; filled shapes are paper once they are fairly light.
 */
const PAPER_LUMINANCE = { stroke: 0.9, fill: 0.5 };

/**
 * The OKLCH chroma under which a paint is one of the frame's greys rather than
 * a colour. The family's slate neutrals reach about 0.03.
 */
const NEUTRAL_CHROMA = 0.04;

const toRgb = converter('rgb');
const toOklch = converter('oklch');

let modesRegistered = false;

/**
 * Teach the parser every colour a computed style can be written in.
 * culori's tree-shakeable entry knows none until they are registered.
 */
function registerModes(): void {
  if (modesRegistered) return;
  for (const mode of [
    modeRgb,
    modeLrgb,
    modeHsl,
    modeHwb,
    modeLab,
    modeLch,
    modeOklab,
    modeOklch,
    modeP3,
  ]) {
    registerMode(mode);
  }
  modesRegistered = true;
}

/**
 * Every match of a pattern replaced by what its named groups make of it.
 * @param text - The text.
 * @param pattern - A global pattern with named groups.
 * @param write - Writes the replacement from the groups.
 * @returns The text, replaced.
 */
function replaceGroups(
  text: string,
  pattern: RegExp,
  write: (groups: Partial<Record<string, string>>) => string,
): string {
  return text.replaceAll(pattern, (...parts: unknown[]) =>
    write(parts.at(-1) as Partial<Record<string, string>>),
  );
}

function recolor(value: string, property: string, colors: FigureColors) {
  const written = value.trim();
  const color: Color | undefined = parse(written);
  if (color === undefined || color.alpha === 0) return value;
  const luminance = clamp(wcagLuminance(color), 0, 1);
  const paper =
    property === 'stroke' ? PAPER_LUMINANCE.stroke : PAPER_LUMINANCE.fill;
  const neutral = (toOklch(color).c ?? 0) < NEUTRAL_CHROMA;
  const level =
    colors === 'grey' || neutral ? luminance : luminance >= paper ? 1 : 0;
  const grey = toRgb({
    mode: 'lrgb',
    r: level,
    g: level,
    b: level,
    alpha: color.alpha,
  });
  return value.replace(
    written,
    color.alpha === undefined ? formatHex(grey) : formatRgb(grey),
  );
}

/**
 * Grey every raster the document holds, by a filter on each image. It works
 * in linear light, so a picture is greyed exactly as the shapes around it.
 * @param markup - The SVG document.
 * @returns The document, with the filter declared when an image needs it.
 */
function greyImages(markup: string): string {
  if (!markup.includes('<image')) return markup;
  const filtered = markup.replaceAll(
    IMAGE_WITHOUT_FILTER,
    `<image filter="url(#${GREY_FILTER_ID})"`,
  );
  return filtered.replace(
    ROOT_SVG,
    (open) =>
      `${open}<defs><filter id="${GREY_FILTER_ID}">` +
      `<feColorMatrix type="saturate" values="0"/></filter></defs>`,
  );
}
