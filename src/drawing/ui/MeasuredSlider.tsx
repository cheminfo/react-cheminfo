import type { SliderProps } from '@blueprintjs/core';
import { Slider } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useRef, useState } from 'react';

import { useResizeObserver } from '../../hooks/ui/useResizeObserver.ts';

/**
 * Blueprint's slider, measured again whenever its width changes. Blueprint
 * measures its track once, when it mounts: mounted in a folded panel or a
 * hidden bar, it measures nothing, and a drag then jumps between the two
 * ends of the range.
 * @param props - Blueprint's slider props.
 * @returns The slider.
 */
export function MeasuredSlider(props: SliderProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useResizeObserver(ref, (size) => {
    setWidth(Math.round(size.width));
  });
  return (
    <div ref={ref} className="measured-slider">
      <Slider key={width} {...props} />
    </div>
  );
}
