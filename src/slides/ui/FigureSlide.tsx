import type { ReactElement, ReactNode } from 'react';

import { splitDemoLinks } from '../core/demoLinks.ts';
import { splitSlideHeading } from '../core/slideHeading.ts';
import { slideOriginOf } from '../core/talkOrigin.ts';

import type { SlideLayoutProps } from './Slide.tsx';
import { SlideBody } from './SlideBody.tsx';
import { SlideDemos } from './SlideDemos.tsx';

/** What a figure slide draws: the slide's own text and the layout's figure. */
export interface FigureSlideProps extends SlideLayoutProps {
  /** The slide's Markdown, the figure's marker already taken out. */
  body: string;
  /** What the layout draws beside the text. */
  figure: ReactNode;
  /**
   * Where the figure sits: beside the text, or under it across the slide.
   * @default 'side'
   */
  placement?: 'side' | 'below';
}

/**
 * The frame a site's figure layout draws in: the slide's heading pinned at the
 * top as on any content slide, then its text and the figure — side by side, or
 * the figure under the text — and the demo links the slide ends on. A
 * registered layout draws itself whole, so this repeats around a figure what
 * the player's own content slide does around a body.
 * @param props - See {@link FigureSlideProps}.
 * @returns The slide.
 */
export function FigureSlide(props: FigureSlideProps): ReactElement {
  const {
    body,
    figure,
    placement = 'side',
    slide,
    renderLink,
    talkOrigin,
  } = props;
  const { body: text, demos } = splitDemoLinks(body);
  const { heading, rest } = splitSlideHeading(text);
  const origin = slideOriginOf(props);

  return (
    <div
      className={`slide slide--content figure-slide figure-slide--${placement}`}
      data-layout={slide.layout}
    >
      <div className="slide-content">
        {heading === '' ? null : (
          <SlideBody body={heading} origin={origin} renderLink={renderLink} />
        )}
        <div className="figure-slide__body">
          {rest === '' ? null : (
            <div className="figure-slide__text">
              <SlideBody body={rest} origin={origin} renderLink={renderLink} />
            </div>
          )}
          <div className="figure-slide__figure">{figure}</div>
        </div>
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

/** What {@link FigureMessage} says. */
export interface FigureMessageProps {
  /** The message. */
  children: ReactNode;
}

/**
 * What a figure slide shows in place of its figure when the marker asks for
 * something that does not exist: the deck's author reads it while rehearsing
 * and fixes the marker.
 * @param props - See {@link FigureMessageProps}.
 * @returns The message.
 */
export function FigureMessage(props: FigureMessageProps): ReactElement {
  return <p className="chem-figure-message">{props.children}</p>;
}

/**
 * What a figure slide shows while the code drawing its figure loads: an empty
 * box the size of the figure, so the text beside it does not move.
 * @returns The box.
 */
export function FigureLoading(): ReactElement {
  return <div className="chem-figure-loading" aria-busy="true" />;
}
