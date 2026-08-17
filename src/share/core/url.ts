import type { ShareConfig } from './config.ts';
import { applyShareConfig } from './config.ts';
import { escapeAttribute } from './escape.ts';
import type { ShareParamCodecs, ShareVocabulary } from './vocabulary.ts';

/** What {@link buildShareUrl} needs to write a link. */
export interface ShareUrlOptions<
  Codecs extends ShareParamCodecs = Record<string, never>,
> {
  /**
   * Where the page is served from — origin and path. Anything from the first
   * `?` or `#` is dropped, so the current address can be handed over as it is.
   */
  base: string;
  /**
   * The address as it stands, so the tool's own inputs travel with the link.
   * @default ''
   */
  search?: string;
  /** The configuration the link carries. */
  config: ShareConfig<Codecs>;
  /** What this site's links can say. */
  vocabulary: ShareVocabulary<Codecs>;
}

/**
 * The absolute link the share dialog hands out: the page, the tool's own
 * inputs, and the configuration written over whatever the address carried.
 * @param options - Where the page is, what it is showing, and how it is configured.
 * @returns An absolute URL.
 */
export function buildShareUrl<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(options: ShareUrlOptions<Codecs>): string {
  const { base, search = '', config, vocabulary } = options;
  const query = applyShareConfig(search, config, vocabulary);
  const address = trimAddress(base);
  return query === '' ? address : `${address}?${query}`;
}

/** What {@link buildEmbedCode} needs to write the snippet. */
export interface EmbedCodeOptions {
  /** The link the frame loads. */
  url: string;
  /** What a screen reader announces the frame as; a frame without one is unreadable. */
  title: string;
  /**
   * Height of the frame, in pixels.
   * @default 700
   */
  height?: number;
  /**
   * Width of the frame; a number is taken as pixels.
   * @default '100%'
   */
  width?: number | string;
  /**
   * The CSS border the frame is drawn with.
   * @default '1px solid #ddd'
   */
  border?: string;
}

/**
 * The snippet to paste into a course page: one iframe loading the shared link.
 * Every value is escaped, so an address carrying an ampersand or a title
 * carrying a quote cannot break out of its attribute.
 * @param options - The link, its accessible name and the frame's dimensions.
 * @returns One line of HTML.
 */
export function buildEmbedCode(options: EmbedCodeOptions): string {
  const {
    url,
    title,
    height = DEFAULT_HEIGHT,
    width = '100%',
    border = '1px solid #ddd',
  } = options;
  const style = `border: ${border}; border-radius: 8px`;
  return [
    `<iframe src="${escapeAttribute(url)}"`,
    `title="${escapeAttribute(title)}"`,
    `width="${escapeAttribute(formatWidth(width))}"`,
    `height="${formatHeight(height)}"`,
    `style="${escapeAttribute(style)}"`,
    'loading="lazy"></iframe>',
  ].join(' ');
}

const DEFAULT_HEIGHT = 700;

function trimAddress(base: string): string {
  const cut = base.search(/[#?]/);
  return cut === -1 ? base : base.slice(0, cut);
}

function formatWidth(width: number | string): string {
  if (typeof width !== 'number') return width;
  return String(Math.max(1, Math.round(width)));
}

function formatHeight(height: number): string {
  if (!Number.isFinite(height)) return String(DEFAULT_HEIGHT);
  return String(Math.max(1, Math.round(height)));
}
