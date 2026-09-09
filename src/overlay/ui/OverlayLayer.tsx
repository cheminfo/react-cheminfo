import type { ReactElement, ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { OverlayDensity } from '../core/overlayMetrics.ts';
import { overlayMetrics } from '../core/overlayMetrics.ts';

import { OVERLAY_LAYER_STYLE } from './overlayStyles.ts';
import type { OverlaySurface } from './overlaySurface.ts';
import { OverlaySurfaceContext, useCoarsePointer } from './overlaySurface.ts';

/** What {@link OverlayLayer} needs. */
export interface OverlayLayerProps {
  /** The cards, legends and readouts that float over the figure. */
  children: ReactNode;
  /**
   * How tightly every card inside packs its controls. A coarse pointer wins
   * over this, whatever it says.
   * @default 'comfortable'
   */
  density?: OverlayDensity;
  /**
   * Width of the figure, in pixels, normally from `useContainerSize`. It is
   * what decides whether a card folds; zero keeps every card expanded.
   * @default 0
   */
  width?: number;
  /**
   * Whether the figure is repainting — a lasso being dragged, a canvas
   * animating.
   * @default false
   */
  busy?: boolean;
  /**
   * Whether the cards are awake. Left out, the layer wakes them while the
   * pointer is anywhere over the figure or a control inside holds the focus,
   * which is what lets a card rest without becoming a puzzle.
   * @default undefined — the layer watches the pointer and the focus itself
   */
  awake?: boolean;
  /**
   * Class the layer carries, in addition to `overlay-layer`.
   * @default undefined
   */
  className?: string;
}

/**
 * The inert layer a figure's floating chrome lives in.
 *
 * It covers the figure and lets every pointer event through, so a lasso
 * started under a card still starts; only the cards themselves take the
 * pointer back. Everything they share — the measurements, whether they are
 * awake, whether the figure is repainting — is settled here once, so two cards
 * over the same figure cannot disagree.
 *
 * It is marked as chrome, so that saving the figure saves the picture and not
 * the cog sitting in its corner: the glyph of a control is an `<svg>` like any
 * chart, and nothing else on the page could tell the two apart.
 * @param props - See {@link OverlayLayerProps}.
 * @returns The layer.
 */
export function OverlayLayer(props: OverlayLayerProps): ReactElement {
  const {
    children,
    density = 'comfortable',
    width = 0,
    busy = false,
    awake,
    className,
  } = props;

  const layer = useRef<HTMLDivElement>(null);
  const [pointerOverFigure, setPointerOverFigure] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const pointer = useCoarsePointer() ? 'coarse' : 'fine';
  const watchingPointer = awake === undefined;

  useEffect(() => {
    const figure = layer.current?.parentElement;
    if (!watchingPointer || figure === null || figure === undefined) return;
    const enter = () => setPointerOverFigure(true);
    const leave = () => setPointerOverFigure(false);
    figure.addEventListener('pointerenter', enter);
    figure.addEventListener('pointerleave', leave);
    return () => {
      figure.removeEventListener('pointerenter', enter);
      figure.removeEventListener('pointerleave', leave);
    };
  }, [watchingPointer]);

  const surface = useMemo<OverlaySurface>(
    () => ({
      metrics: overlayMetrics(density, pointer),
      awake: awake ?? (pointerOverFigure || focusInside),
      busy,
      width,
      pointer,
    }),
    [density, pointer, awake, pointerOverFigure, focusInside, busy, width],
  );

  return (
    <div
      ref={layer}
      className={
        className === undefined ? 'overlay-layer' : `overlay-layer ${className}`
      }
      style={OVERLAY_LAYER_STYLE}
      data-figure="chrome"
      onFocus={() => setFocusInside(true)}
      onBlur={() => setFocusInside(false)}
    >
      <OverlaySurfaceContext.Provider value={surface}>
        {children}
      </OverlaySurfaceContext.Provider>
    </div>
  );
}
