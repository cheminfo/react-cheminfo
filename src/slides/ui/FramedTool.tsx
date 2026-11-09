import type { ReactElement, Ref } from 'react';
import { useContext, useRef } from 'react';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import { frameTitle } from '../core/familyFrame.ts';
import { toolFrame } from '../core/toolFrame.ts';

import { SlideScaleContext } from './slideScaleContext.ts';

/** A tool framed on a slide. */
export interface FramedToolProps {
  /** The address framed. */
  src: string;
  /**
   * The frame, for a slide that talks to the tool in it.
   * @default undefined
   */
  frameRef?: Ref<HTMLIFrameElement>;
}

/**
 * A tool running in the room a slide gives it.
 *
 * The player shrinks the slide to fit the screen, but not the tool: the frame
 * undoes that scale, so a laptop shows the tool at the size a visitor sees it,
 * and only a room too narrow for its desktop layout shrinks it (see
 * {@link toolFrame}).
 * @param props - See {@link FramedToolProps}.
 * @returns The frame, in its room.
 */
export function FramedTool(props: FramedToolProps): ReactElement {
  const { src, frameRef } = props;
  const slideScale = useContext(SlideScaleContext);
  const roomRef = useRef<HTMLDivElement>(null);
  const room = useContainerSize(roomRef);
  const frame = room.width === 0 ? null : toolFrame(room, slideScale);

  return (
    <div ref={roomRef} className="slide-embed">
      <iframe
        ref={frameRef}
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
