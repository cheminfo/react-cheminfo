import type { ComponentType, ReactElement } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

/** A site's cartoons, by the name a `<!-- glyph: … -->` marker writes. */
export type SlideGlyphs = Readonly<Record<string, ComponentType>>;

/** Props of {@link SlideGlyph}. */
export interface SlideGlyphProps {
  /** The cartoons the site draws. */
  glyphs: SlideGlyphs;
  /** The name the slide wrote. */
  id: string;
  /**
   * How the drawing sits on the slide: in the corner of a divider, or as the
   * figure the slide is about.
   * @default 'corner'
   */
  place?: 'corner' | 'figure';
  /**
   * The site's own class, which its drawings' colours and motion hang off; the
   * drawing also carries it suffixed with `--<place>`.
   * @default undefined
   */
  className?: string;
}

/**
 * The cartoon a slide asks for, on a 620 × 240 canvas. A name nothing answers
 * draws nothing: a deck is written before the site knows how to draw it, and a
 * talk must never fail to open in front of a room.
 * @param props - See {@link SlideGlyphProps}.
 * @returns The drawing, or `null`.
 */
export function SlideGlyph(props: SlideGlyphProps): ReactElement | null {
  const { glyphs, id, place = 'corner', className } = props;
  const Glyph = Object.hasOwn(glyphs, id) ? glyphs[id] : undefined;
  if (Glyph === undefined) return null;
  return (
    <svg
      className={joinClassNames(
        'slide-glyph',
        `slide-glyph--${place}`,
        'keep-motion',
        className,
        className !== undefined && `${className}--${place}`,
      )}
      viewBox="0 0 620 240"
      aria-hidden="true"
    >
      <Glyph />
    </svg>
  );
}
