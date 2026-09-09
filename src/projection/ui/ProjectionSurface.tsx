import type { ReactElement, ReactNode } from 'react';
import { useMemo } from 'react';

import { overlayMetrics } from '../../overlay/core/overlayMetrics.ts';
import type { OverlaySurface } from '../../overlay/ui/overlaySurface.ts';
import {
  OverlaySurfaceContext,
  useCoarsePointer,
  useOverlaySurface,
} from '../../overlay/ui/overlaySurface.ts';

/** What {@link ProjectionSurface} needs. */
export interface ProjectionSurfaceProps {
  /** The chrome drawn at the compact size: the settings bar, a floating key. */
  children: ReactNode;
  /**
   * Width of the figure, in pixels, for the chrome that has to decide whether
   * it still fits. Only the settings bar needs it — chrome inside a chart is
   * already over a measured figure and inherits its width.
   * @default undefined — whatever the surface above it was measured at
   */
  width?: number;
}

/**
 * The compact measurements every piece of this viewer's chrome is drawn from.
 *
 * The viewer is meant to be embedded in somebody else's page, so its chrome
 * takes the smallest measurements the overlay domain offers rather than the
 * roomier ones a figure standing alone can afford. A finger still wins: the
 * pointer is read here, and a coarse one is handed the largest set whatever
 * the figure asked for.
 *
 * It is a surface of its own rather than an `OverlayLayer` because the
 * settings bar is in the flow above the picture, and a layer is absolutely
 * positioned over one — a bar inside a layer would float over the very data it
 * introduces. Everything else about the surface it stands on is carried
 * through, so a key nested inside a chart's own layer still fades with that
 * chart and still knows it is repainting.
 * @param props - See {@link ProjectionSurfaceProps}.
 * @returns The chrome, drawn compact.
 */
export function ProjectionSurface(props: ProjectionSurfaceProps): ReactElement {
  const { children, width } = props;
  const above = useOverlaySurface();
  const pointer = useCoarsePointer() ? 'coarse' : 'fine';

  const surface = useMemo<OverlaySurface>(
    () => ({
      ...above,
      metrics: overlayMetrics('compact', pointer),
      pointer,
      width: width ?? above.width,
    }),
    [above, pointer, width],
  );

  return (
    <OverlaySurfaceContext.Provider value={surface}>
      {children}
    </OverlaySurfaceContext.Provider>
  );
}
