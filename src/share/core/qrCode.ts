import { renderSVG } from 'uqr';

import type { FigureSvg } from '../../download/core/figureSvg.ts';

/** How many pixels a module of the code is drawn at in the SVG document. */
const MODULE_PIXELS = 8;

/**
 * The quiet zone around the code, in modules: four is what the standard asks
 * for, and a phone reading a code projected on a busy slide needs all of it.
 */
const QUIET_ZONE = 4;

/**
 * A link as a QR code, written out as a standalone SVG document that a phone
 * camera reads.
 *
 * The error correction is `M` at least, and raised further whenever the link
 * still fits the same symbol: a code on a projector is read through glare and
 * keystone, so any redundancy that costs no extra module is worth taking.
 * @param text - What the code holds, usually the address being handed out.
 * @returns The document and its size in pixels, or `null` when the text is too long for any QR code.
 */
export function qrCodeSvg(text: string): FigureSvg | null {
  let markup: string;
  try {
    markup = renderSVG(text, {
      ecc: 'M',
      boostEcc: true,
      border: QUIET_ZONE,
      pixelSize: MODULE_PIXELS,
    });
  } catch {
    return null;
  }
  const side = Number(/viewBox="0 0 (?<side>\d+)/.exec(markup)?.groups?.side);
  // The library writes a `viewBox` only, which opens at whatever size the
  // viewer guesses; a file states its own.
  return {
    markup: markup.replace('<svg ', `<svg width="${side}" height="${side}" `),
    width: side,
    height: side,
  };
}
