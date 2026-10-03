/** The screens a link can be looked at on, before it is handed out. */
export type SharePreviewDeviceKey = 'window' | 'mobile' | 'laptop' | 'hd';

/** A screen the preview lays the page out at. */
export interface SharePreviewSize {
  /** Width in CSS pixels. */
  width: number;
  /** Height in CSS pixels. */
  height: number;
}

/**
 * The screens offered, in the order the capsules read. `window` is the
 * reader's own, and is resolved against the browser rather than written here.
 */
export const SHARE_PREVIEW_DEVICES: readonly SharePreviewDeviceKey[] = [
  'window',
  'mobile',
  'laptop',
  'hd',
];

const FIXED_SIZES: Record<
  Exclude<SharePreviewDeviceKey, 'window'>,
  SharePreviewSize
> = {
  mobile: { width: 390, height: 844 },
  laptop: { width: 1280, height: 800 },
  hd: { width: 1920, height: 1080 },
};

/** What the preview falls back to where there is no window to measure. */
const FALLBACK_WINDOW: SharePreviewSize = { width: 1280, height: 800 };

/**
 * The page size a device lays the preview out at.
 * @param key - The device picked.
 * @param window - The reader's own window, for the `window` device.
 * @returns Its width and height in CSS pixels.
 */
export function sharePreviewSize(
  key: SharePreviewDeviceKey,
  window?: Partial<SharePreviewSize>,
): SharePreviewSize {
  if (key !== 'window') return FIXED_SIZES[key];
  const width = window?.width ?? 0;
  const height = window?.height ?? 0;
  return width > 0 && height > 0 ? { width, height } : FALLBACK_WINDOW;
}

/**
 * How far the page is shrunk to fit the pane it is previewed in.
 *
 * It is never enlarged: a phone shown bigger than a phone is not what the
 * reader is checking.
 * @param pane - The room the preview pane has.
 * @param page - The size the page is laid out at.
 * @returns The scale, between 0 and 1.
 */
export function sharePreviewScale(
  pane: Partial<SharePreviewSize>,
  page: SharePreviewSize,
): number {
  const width = pane.width ?? 0;
  const height = pane.height ?? 0;
  if (width <= 0 || height <= 0) return 1;
  return Math.min(1, width / page.width, height / page.height);
}

/**
 * The address as the preview's own bar writes it, without its scheme.
 *
 * What a reader checks there is the site and the query the link carries, and a
 * bar as wide as a phone has no room for `https://`.
 * @param url - The link the preview loads.
 * @returns The address, scheme dropped.
 */
export function sharePreviewAddress(url: string): string {
  return url.replace(/^[a-z][\w+.-]*:\/\//i, '');
}
