import type { ReactElement } from 'react';
import { useContext, useRef } from 'react';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { frameTitle } from '../core/familyFrame.ts';
import type { Slide } from '../core/talk.ts';
import { toolFrame } from '../core/toolFrame.ts';

import { SlideBody } from './SlideBody.tsx';
import { SlideScaleContext } from './slideScaleContext.ts';

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
 * and only a room too narrow for its desktop layout shrinks it (see
 * {@link toolFrame}).
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

function FramedTool(props: { src: string }): ReactElement {
  const { src } = props;
  const slideScale = useContext(SlideScaleContext);
  const roomRef = useRef<HTMLDivElement>(null);
  const room = useContainerSize(roomRef);
  const frame = room.width === 0 ? null : toolFrame(room, slideScale);

  return (
    <div ref={roomRef} className="slide-embed">
      <iframe
        className="slide-embed-frame"
        src={src}
        title={frameTitle(src)}
        allow="clipboard-write; fullscreen"
        style={
          frame === null
            ? undefined
            : {
                width: frame.width,
                height: frame.height,
                transform: `scale(${frame.scale})`,
              }
        }
      />
    </div>
  );
}

/**
 * The prose and the address of an embedded slide.
 *
 * The address is written as a bare URL on its own line, because a teacher
 * pastes what the tool's Share dialog gave them and nothing else.
 * @param body - The slide body.
 * @returns The prose without the address, and the address.
 */
function splitEmbedAddress(body: string): {
  prose: string;
  src: string | null;
} {
  const lines = body.split('\n');
  for (let index = lines.length - 1; index >= 0; index--) {
    const line = (lines[index] ?? '').trim();
    if (line === '') continue;
    if (!line.startsWith('http://') && !line.startsWith('https://')) break;
    if (line.includes(' ')) break;
    const prose = [...lines.slice(0, index), ...lines.slice(index + 1)]
      .join('\n')
      .trim();
    return { prose, src: line };
  }
  return { prose: body.trim(), src: null };
}
