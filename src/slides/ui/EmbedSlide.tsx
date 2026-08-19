import type { ReactElement } from 'react';

import type { Slide } from '../core/talk.ts';

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
 * above the frame; the last bare URL of the body is what is framed.
 * @param props - See {@link EmbedSlideProps}.
 * @returns The slide.
 */
export function EmbedSlide(props: EmbedSlideProps): ReactElement {
  const { slide } = props;
  const { prose, src } = splitEmbedAddress(slide.body);

  return (
    <div className="slide slide--embed">
      <div className="slide-content">
        {prose === '' ? null : <SlideBody body={prose} />}
        {src === null ? (
          <p className="slide-embed-missing">
            This slide frames a tool, but carries no address.
          </p>
        ) : (
          <iframe
            className="slide-embed-frame"
            src={src}
            title={frameTitle(src)}
            allow="clipboard-write; fullscreen"
          />
        )}
      </div>
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

/**
 * A frame without a title is unreadable to a screen reader.
 * @param src - The address being framed.
 * @returns What the frame is called.
 */
function frameTitle(src: string): string {
  try {
    return `${new URL(src).hostname}, embedded`;
  } catch {
    return 'Embedded tool';
  }
}
