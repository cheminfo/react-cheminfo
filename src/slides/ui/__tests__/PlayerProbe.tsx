import { useState } from 'react';

import type { SlideshowProps } from '../Slideshow.tsx';
import { Slideshow } from '../Slideshow.tsx';

/** What {@link PlayerProbe} needs: the player's props, its slide held here. */
export type PlayerProbeProps = Omit<SlideshowProps, 'index' | 'onIndex'> & {
  /** The slide it opens on. */
  start: number;
  /** Called with every slide the player asks the site for. */
  onAsk: (index: number) => void;
};

/**
 * The player as a site holds it: the slide kept here, the way a site keeps
 * it in the address, and every slide asked for shown next.
 * @param props - See {@link PlayerProbeProps}.
 * @returns The player.
 */
export function PlayerProbe(props: PlayerProbeProps) {
  const { start, onAsk, ...rest } = props;
  const [index, setIndex] = useState(start);
  return (
    <Slideshow
      {...rest}
      index={index}
      onIndex={(next) => {
        onAsk(next);
        setIndex(next);
      }}
    />
  );
}
