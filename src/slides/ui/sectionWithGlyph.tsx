import type { ComponentType, ReactElement } from 'react';

import { readSlideGlyph } from '../core/slideMarker.ts';

import { SectionSlide } from './SectionSlide.tsx';
import type { SlideLayoutProps } from './Slide.tsx';
import type { SlideGlyphs } from './SlideGlyph.tsx';
import { SlideGlyph } from './SlideGlyph.tsx';

/** What {@link sectionWithGlyph} is told about the drawings. */
export interface SectionWithGlyphOptions {
  /**
   * The site's own class for its drawings, as `SlideGlyph` takes it.
   * @default undefined
   */
  className?: string;
}

/**
 * The section layout of a site that draws cartoons: the player's divider, with
 * the drawing a `<!-- glyph: … -->` marker names in its corner.
 * @param glyphs - The cartoons the site draws.
 * @param options - See {@link SectionWithGlyphOptions}.
 * @returns The layout, to register as `section`.
 */
export function sectionWithGlyph(
  glyphs: SlideGlyphs,
  options: SectionWithGlyphOptions = {},
): ComponentType<SlideLayoutProps> {
  const { className } = options;
  function SectionWithGlyph(props: SlideLayoutProps): ReactElement {
    const { glyph, body } = readSlideGlyph(props.slide.body);
    return (
      <>
        <SectionSlide body={body} />
        <SlideGlyph glyphs={glyphs} id={glyph} className={className} />
      </>
    );
  }
  return SectionWithGlyph;
}
