import type { ReactElement } from 'react';

import { splitEmbedAddress } from '../core/embedAddress.ts';

import { FramedTool } from './FramedTool.tsx';
import type { SlideLayoutProps } from './Slide.tsx';
import { SlideBody } from './SlideBody.tsx';

/**
 * A title slide with the tool running beside it: the title on the left half,
 * and on the right the address the slide ends with, framed live — a reaction
 * boiling, a spectrum drawn, a structure turning — so the talk opens on what
 * the tool makes rather than on a picture of it.
 * @param props - What the player hands every layout.
 * @returns The slide.
 */
export function TitleToolSlide(
  props: Omit<SlideLayoutProps, 'onStep' | 'step'>,
): ReactElement {
  const { slide, meta, renderLink } = props;
  const { prose, src } = splitEmbedAddress(slide.body);
  const logos = meta.logos ?? [];
  return (
    <div className="slide slide--title slide--title-tool">
      <div className="slide-content">
        <SlideBody body={prose} renderLink={renderLink} />
        {logos.length === 0 ? null : (
          <div className="slide-logos">
            {logos.map((logo) => (
              <img key={logo} className="slide-logo" src={logo} alt="" />
            ))}
          </div>
        )}
      </div>
      {src === null ? null : <FramedTool src={src} />}
    </div>
  );
}
