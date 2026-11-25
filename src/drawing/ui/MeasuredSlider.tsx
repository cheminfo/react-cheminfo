import type { SliderProps } from '@blueprintjs/core';
import { Slider } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { useResizeObserver } from '../../hooks/ui/useResizeObserver.ts';
import { snapToStep } from '../../number/core/numberText.ts';

/**
 * Blueprint's slider, measured again whenever its width changes, its values
 * on the grid of its steps. Blueprint measures its track once, when it
 * mounts: mounted in a folded panel or a hidden bar, it measures nothing, and
 * a drag then jumps between the two ends of the range. So a new width mounts
 * it again — but never under a pointer pressed on it: mounting it again drops
 * the handle the drag holds, and the drag stops on the frame it reached. A
 * width that changes during a drag (a label beside the slider growing with
 * the value) is measured once the pointer is released. Blueprint also moves
 * the value by adding steps to it, so a slider in steps of `0.05` reports
 * `0.4999999999999996`: each value is brought back onto the grid laid from
 * `min`, as it is stored and written.
 * @param props - Blueprint's slider props.
 * @returns The slider.
 */
export function MeasuredSlider(props: SliderProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  // The width the slider was last mounted for, and the latest one seen.
  const [measured, setMeasured] = useState(0);
  const latest = useRef(0);
  const [pressed, setPressed] = useState(false);
  useResizeObserver(ref, (size) => {
    latest.current = Math.round(size.width);
    if (!pressed) setMeasured(latest.current);
  });
  useEffect(() => {
    if (!pressed) return;
    const release = (): void => {
      setPressed(false);
      setMeasured(latest.current);
    };
    globalThis.addEventListener('pointerup', release);
    globalThis.addEventListener('pointercancel', release);
    return () => {
      globalThis.removeEventListener('pointerup', release);
      globalThis.removeEventListener('pointercancel', release);
    };
  }, [pressed]);
  // Blueprint's own defaults: a step of 1 from 0.
  const snap = (value: number): number =>
    snapToStep(value, props.stepSize ?? 1, props.min ?? 0);
  return (
    <div
      ref={ref}
      className="measured-slider"
      onPointerDownCapture={() => setPressed(true)}
    >
      <Slider
        key={measured}
        {...props}
        {...(props.onChange === undefined
          ? {}
          : { onChange: (value: number) => props.onChange?.(snap(value)) })}
        {...(props.onRelease === undefined
          ? {}
          : { onRelease: (value: number) => props.onRelease?.(snap(value)) })}
      />
    </div>
  );
}
