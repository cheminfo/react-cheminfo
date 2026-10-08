import type { ReactElement, ReactNode } from 'react';
import { useMemo, useRef } from 'react';

import { useContainerSize } from '../../hooks/ui/useContainerSize.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { OverlayDensity } from '../core/overlayMetrics.ts';
import { overlayMetrics } from '../core/overlayMetrics.ts';

import type { OverlayBarProps } from './OverlayBar.tsx';
import { OverlayBar } from './OverlayBar.tsx';
import type { OverlaySurface } from './overlaySurface.ts';
import {
  OverlaySurfaceContext,
  useCoarsePointer,
  useOverlaySurface,
} from './overlaySurface.ts';
import { useFigureBarAwake } from './useFigureBarAwake.ts';

/** What {@link FigureBar} needs. */
export interface FigureBarProps extends Omit<
  OverlayBarProps,
  'placement' | 'restingOpacity' | 'children'
> {
  /**
   * The controls at the start of the row — how the figure is drawn, such as
   * its axis scales. They never fold.
   * @default undefined — the start of the row is empty
   */
  children?: ReactNode;
  /**
   * How tightly the bar packs its controls. A coarse pointer wins over this,
   * whatever it says.
   * @default 'compact'
   */
  density?: OverlayDensity;
  /**
   * Class the bar carries, in addition to `figure-bar no-print`.
   * @default undefined
   */
  className?: string;
}

/**
 * The controls of a figure, in one bar spanning the width above it.
 *
 * Settings read from the left edge — `children`, which never fold, then `end`,
 * which folds behind a cog on a narrow figure — and the glyphs keep the right
 * one: the `?` in `info`, saving and printing in `tools`. Every figure of the
 * family is laid out this way, so the reader finds both in the same place.
 *
 * Put it right before the figure, never inside its box, and give the two a
 * parent of their own: it is in the flow, so it covers neither the data nor
 * the axes, and with `rest` it wakes while that parent is pointed at. It measures its own width to decide
 * what folds, is left out of a printed page, and is marked as chrome so that
 * saving a figure it sits inside saves the picture without it.
 * @param props - See {@link FigureBarProps}.
 * @returns The bar.
 */
export function FigureBar(props: FigureBarProps): ReactElement {
  const { children, density = 'compact', className, ...bar } = props;
  const { rest = 'visible' } = props;
  const box = useRef<HTMLDivElement>(null);
  const { width } = useContainerSize(box);
  const above = useOverlaySurface();
  const pointer = useCoarsePointer() ? 'coarse' : 'fine';
  // A finger has nothing to point with until it touches, so it never rests.
  const awake = useFigureBarAwake(
    box,
    rest !== 'visible' && pointer === 'fine',
  );

  const surface = useMemo<OverlaySurface>(
    () => ({
      ...above,
      metrics: overlayMetrics(density, pointer),
      awake,
      pointer,
      width,
    }),
    [above, density, awake, pointer, width],
  );

  return (
    <div
      ref={box}
      className={joinClassNames('figure-bar no-print', className)}
      data-figure="chrome"
    >
      <OverlaySurfaceContext.Provider value={surface}>
        <OverlayBar {...bar} placement="stretch">
          {children}
        </OverlayBar>
      </OverlaySurfaceContext.Provider>
    </div>
  );
}
