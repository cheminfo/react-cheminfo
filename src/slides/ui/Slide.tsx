import type { ComponentType, ReactElement } from 'react';
import { Fragment } from 'react';

import type {
  Slide as SlideData,
  TalkMeta,
  TalkOrigin,
} from '../core/index.ts';
import { demoLabel, splitDemoLinks } from '../core/index.ts';

import type { RenderSlideLink } from './DemoLink.tsx';
import { DemoLink } from './DemoLink.tsx';
import { EmbedSlide } from './EmbedSlide.tsx';
import { SectionSlide } from './SectionSlide.tsx';
import { SlideBody } from './SlideBody.tsx';

/** What every layout — the generic ones and a site's own — is handed. */
export interface SlideLayoutProps {
  /** The slide to draw. */
  slide: SlideData;
  /** How the publishing site names the talk in its addresses. */
  talkId: string;
  /** Which slide of the talk this is, zero-based. */
  slideIndex: number;
  /** What the talk's front-matter said, for a layout that draws from it. */
  meta: TalkMeta;
  /**
   * The site's own link, used for the in-app links of the slide.
   * @default undefined — a plain anchor
   */
  renderLink?: RenderSlideLink;
}

/** A slide, and the layouts available to draw it. */
export interface SlideViewProps extends SlideLayoutProps {
  /**
   * The layouts this site adds, by the name a slide writes in its
   * `<!-- layout: … -->` marker. An entry here also replaces a generic layout
   * of the same name.
   * @default undefined
   */
  layouts?: Record<string, ComponentType<SlideLayoutProps>>;
}

/**
 * Draw one slide with the layout it asks for.
 *
 * The layout name is not a closed list — a deck is written before the site
 * knows how to draw it — so a name neither the site nor the player recognises
 * falls back to the plain content layout. A talk must never fail to open
 * because one of its slides asks for something that is not there yet.
 * @param props - See {@link SlideViewProps}.
 * @returns The slide.
 */
export function SlideView(props: SlideViewProps): ReactElement {
  const { layouts, ...layoutProps } = props;
  const { slide } = layoutProps;

  const Custom = layouts?.[slide.layout];
  if (Custom !== undefined) return <Custom {...layoutProps} />;
  if (slide.layout === 'section') return <SectionSlide body={slide.body} />;
  if (slide.layout === 'embed') return <EmbedSlide slide={slide} />;

  return <GenericSlide {...layoutProps} />;
}

/** The layouts the player draws itself, for any deck on any site. */
const GENERIC_LAYOUTS = new Set(['content', 'title', 'quote', 'thanks']);

function GenericSlide(props: SlideLayoutProps): ReactElement {
  const { slide, talkId, slideIndex, meta, renderLink } = props;
  const layout = GENERIC_LAYOUTS.has(slide.layout) ? slide.layout : 'content';
  const { body, demos } = splitDemoLinks(slide.body);
  const origin: TalkOrigin = { talkId, slide: slideIndex };
  const logos = layout === 'title' ? (meta.logos ?? []) : [];

  return (
    <div className={`slide slide--${layout}`}>
      <div className="slide-content">
        <SlideBody body={body} origin={origin} renderLink={renderLink} />
        {logos.length === 0 ? null : (
          <div className="slide-logos">
            {logos.map((logo) => (
              <img key={logo} className="slide-logo" src={logo} alt="" />
            ))}
          </div>
        )}
        {demos.length === 0 ? null : (
          <div className="slide-demos">
            <span className="slide-demos-label">Live demos:</span>
            {demos.map((demo, index) => (
              <Fragment key={demo.href}>
                {index === 0 ? null : (
                  <span className="slide-demos-separator" aria-hidden="true">
                    |
                  </span>
                )}
                <DemoLink
                  href={demo.href}
                  origin={origin}
                  renderLink={renderLink}
                >
                  {demoLabel(demo.label)}
                </DemoLink>
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
