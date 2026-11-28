import type { ComponentType, ReactElement } from 'react';

import { splitEmbedAddress } from '../core/embedAddress.ts';
import type { Slide as SlideData, TalkMeta } from '../core/index.ts';
import { splitDemoLinks } from '../core/index.ts';
import { framedLocally } from '../core/localFrame.ts';
import { GENERIC_SLIDE_LAYOUTS } from '../core/playerLayouts.ts';
import { STEPS_LAYOUT } from '../core/slideSteps.ts';
import { slideOriginOf } from '../core/talkOrigin.ts';

import type { RenderSlideLink } from './DemoLink.tsx';
import { EmbedSlide } from './EmbedSlide.tsx';
import { EndSlide } from './EndSlide.tsx';
import { SectionSlide } from './SectionSlide.tsx';
import { SlideBody } from './SlideBody.tsx';
import { SlideDemos } from './SlideDemos.tsx';
import { SlideLogos } from './SlideLogos.tsx';
import { StepsSlide } from './StepsSlide.tsx';
import { TitleToolSlide } from './TitleToolSlide.tsx';

/** What every layout — the generic ones and a site's own — is handed. */
export interface SlideLayoutProps {
  /** The slide to draw. */
  slide: SlideData;
  /** How the publishing site names the talk in its addresses. */
  talkId: string;
  /** Which slide of the talk this is, zero-based. */
  slideIndex: number;
  /**
   * Which site published the deck, written into the way back.
   * @default undefined — the site playing it
   */
  site?: string;
  /**
   * Where the publishing site lives, which a relative address in the deck is
   * resolved against.
   * @default undefined — the addresses are this site's own
   */
  talkOrigin?: string;
  /** What the talk's front-matter said, for a layout that draws from it. */
  meta: TalkMeta;
  /**
   * The site's own link, used for the in-app links of the slide.
   * @default undefined — a plain anchor
   */
  renderLink?: RenderSlideLink;
  /**
   * The step on show, on a slide walked one step at a time.
   * @default 0
   */
  step?: number;
  /**
   * Called with the step to show, from a click on one of the slide's steps.
   * @default undefined — the steps are not clickable
   */
  onStep?: (step: number) => void;
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
  /**
   * The host this site is published at, as `draw.cheminfo.org`. Every
   * `https://<host>` a slide writes is played from the page's own origin
   * instead, a site's own layouts included, so a checkout or a preview frames
   * itself during a rehearsal.
   * @default undefined — addresses are played as written
   */
  frameHost?: string;
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
  const { layouts, step, onStep, frameHost, ...given } = props;
  const layoutProps =
    frameHost === undefined
      ? given
      : {
          ...given,
          slide: {
            ...given.slide,
            body: framedLocally(given.slide.body, frameHost),
          },
        };
  const { slide } = layoutProps;

  const Custom = layouts?.[slide.layout];
  if (Custom !== undefined) {
    return <Custom {...layoutProps} step={step} onStep={onStep} />;
  }
  if (slide.layout === 'section') return <SectionSlide body={slide.body} />;
  if (slide.layout === 'embed') return <EmbedSlide slide={slide} />;
  if (slide.layout === 'title' && splitEmbedAddress(slide.body).src !== null) {
    return <TitleToolSlide {...layoutProps} />;
  }
  if (slide.layout === STEPS_LAYOUT) {
    return <StepsSlide {...layoutProps} step={step} onStep={onStep} />;
  }
  if (slide.layout === 'end') return <EndSlide {...layoutProps} />;

  return <GenericSlide {...layoutProps} />;
}

function GenericSlide(
  props: Omit<SlideLayoutProps, 'onStep' | 'step'>,
): ReactElement {
  const { slide, meta, renderLink, talkOrigin } = props;
  const layout = GENERIC_SLIDE_LAYOUTS.has(slide.layout)
    ? slide.layout
    : 'content';
  const { body, demos } = splitDemoLinks(slide.body);
  const origin = slideOriginOf(props);
  const logos = layout === 'title' ? (meta.logos ?? []) : [];

  return (
    <div className={`slide slide--${layout}`}>
      <div className="slide-content">
        <SlideBody body={body} origin={origin} renderLink={renderLink} />
        <SlideLogos logos={logos} />
        <SlideDemos
          demos={demos}
          origin={origin}
          renderLink={renderLink}
          talkOrigin={talkOrigin}
        />
      </div>
    </div>
  );
}
