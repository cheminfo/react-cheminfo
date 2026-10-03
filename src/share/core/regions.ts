/**
 * Where each part of a page sits, so a share dialog can show which region of
 * the preview a row of its list names.
 *
 * The two sides are different documents — the dialog and the framed page — so
 * they speak by message. Everything that arrives is somebody else's input: a
 * framed page is messaged by whatever page frames it, and a dialog by whatever
 * it frames, so both ends read rather than trust.
 */

/** Asks a framed page to report where its parts are, and to keep reporting. */
export const SHARE_REGIONS_REQUEST = 'cheminfo:share-regions-request';

/** Carries the answer back to the dialog. */
export const SHARE_REGIONS_MESSAGE = 'cheminfo:share-regions';

/** The box one part of the page occupies, in the page's own coordinates. */
export interface ShareRegion {
  /** The name the part takes in `?hide=`. */
  part: string;
  /** Distance from the left edge of the page, in CSS pixels. */
  x: number;
  /** Distance from the top edge of the page, in CSS pixels. */
  y: number;
  /** Width of the box, in CSS pixels. */
  width: number;
  /** Height of the box, in CSS pixels. */
  height: number;
}

/**
 * Whether a message asks this page to report where its parts are.
 * @param data - What arrived on the message event.
 * @returns Whether it is the request.
 */
export function isShareRegionsRequest(data: unknown): boolean {
  return messageType(data) === SHARE_REGIONS_REQUEST;
}

/**
 * The regions a framed page reported, or `null` for anything else that arrived.
 *
 * A region with a name that is not a string, or a side that is not a finite
 * number, is dropped rather than taken: a dialog drawing a box from a number it
 * did not check draws it across the whole screen.
 * @param data - What arrived on the message event.
 * @returns The regions, or `null` when the message is not one.
 */
export function readShareRegions(data: unknown): ShareRegion[] | null {
  if (messageType(data) !== SHARE_REGIONS_MESSAGE) return null;
  const { regions } = data as { regions?: unknown };
  if (!Array.isArray(regions)) return null;

  const read: ShareRegion[] = [];
  for (const candidate of regions) {
    const region = readRegion(candidate);
    if (region !== null) read.push(region);
  }
  return read;
}

function readRegion(candidate: unknown): ShareRegion | null {
  if (typeof candidate !== 'object' || candidate === null) return null;
  const { part, x, y, width, height } = candidate as Record<string, unknown>;
  if (typeof part !== 'string' || part === '') return null;
  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return null;
  }
  return {
    part,
    x: x as number,
    y: y as number,
    width: width as number,
    height: height as number,
  };
}

function messageType(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) return null;
  const { type } = data as { type?: unknown };
  return typeof type === 'string' ? type : null;
}
