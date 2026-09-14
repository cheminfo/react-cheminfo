import type { Options as SanitizeSchema } from 'rehype-sanitize';
import { defaultSchema } from 'rehype-sanitize';

/**
 * What survives of the raw HTML a deck writes.
 *
 * GitHub's schema, which already strips scripts, event handlers and every URL
 * that is not http, https or relative, plus what decks legitimately use beyond
 * it: figures, the class a site styles a block with, and frames. Which frame
 * may actually be drawn is decided by `isFamilyFrameSource` when it renders.
 */
export const SLIDE_SANITIZE_SCHEMA: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'caption',
    'figcaption',
    'figure',
    'iframe',
    'mark',
    'small',
    'u',
  ],
  attributes: {
    ...defaultSchema.attributes,
    iframe: ['src', 'allowFullScreen'],
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className'],
  },
};
