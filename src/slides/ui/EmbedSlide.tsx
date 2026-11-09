import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { splitEmbedAddress } from '../core/embedAddress.ts';
import type { Slide } from '../core/talk.ts';

import { FramedTool } from './FramedTool.tsx';
import { SlideBody } from './SlideBody.tsx';

/** What an embedded slide draws. */
export interface EmbedSlideProps {
  /** The slide, whose body holds the prose and, on its own line, the address. */
  slide: Slide;
}

/**
 * A slide that is the tool itself, running.
 *
 * Every tool of the family takes `?embed`, so a lecture can show the real thing
 * instead of a screenshot of it — which is also the only version of the slide
 * that stays true after the tool is improved. The heading and any prose stay
 * above the frame, kept small; the last bare URL of the body is what is framed.
 *
 * The player shrinks the slide to fit the screen, but not the tool: the frame
 * undoes that scale, so a laptop shows the tool at the size a visitor sees it,
 * and only a room too narrow for its desktop layout shrinks it.
 * @param props - See {@link EmbedSlideProps}.
 * @returns The slide.
 */
export function EmbedSlide(props: EmbedSlideProps): ReactElement {
  const { slide } = props;
  const t = useChromeT();
  const { prose, src } = splitEmbedAddress(slide.body);

  return (
    <div className="slide slide--embed">
      <div className="slide-content">
        {prose === '' ? null : <SlideBody body={prose} />}
        {src === null ? (
          <p className="slide-embed-missing">{t('slides.noAddress')}</p>
        ) : (
          <FramedTool src={src} />
        )}
      </div>
    </div>
  );
}
