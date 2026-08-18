/**
 * The molstar canvas showing one atomic orbital.
 *
 * `AtomicOrbitalViewer` reaches this through `React.lazy`, so a page that
 * never shows an orbital never downloads molstar for it — which is the whole
 * reason the two components are separate files.
 */

import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { ResolutionLimits } from '../core/atomicGrid.ts';
import type { PhasePalette } from '../core/palette.ts';
import { PHASE_PALETTES } from '../core/palette.ts';
import type { AtomicSampler } from '../core/sample.ts';
import { sampleInProcess } from '../core/sample.ts';

import { DEFAULT_SPIN_SPEED } from './camera.ts';
import type { OrbitalViewer } from './viewer.ts';
import { createOrbitalViewer } from './viewer.ts';

/** Props of {@link AtomicOrbitalCanvas}. */
export interface AtomicOrbitalCanvasProps {
  /** Proton count of the element on screen. */
  atomicNumber: number;
  /** Which orbital of it, e.g. `3dz2`. */
  orbitalId: string;
  /**
   * Colours the two phases are drawn in.
   * @default PHASE_PALETTES.textbook
   */
  palette?: PhasePalette;
  /**
   * Samples along each edge of the cube; the cost is the cube of it.
   *
   * A number fixes it. A {@link ResolutionLimits} pair lets each orbital's own
   * shape pick a resolution between the two, which is what the orbitals with
   * inner shells packed against the nucleus need.
   * @default 56
   */
  resolution?: number | ResolutionLimits;
  /**
   * Whether the scene turns on its own, which is what makes a still screenshot
   * of a 3D shape readable.
   * @default false
   */
  spinning?: boolean;
  /**
   * How fast it turns, in molstar's own spin unit. Lower is slower.
   * @default 0.3
   */
  spinSpeed?: number;
  /**
   * How the field is produced. Supply a worker-backed sampler to keep the main
   * thread free; the default runs in process.
   * @default sampleInProcess
   */
  sample?: AtomicSampler;
  /**
   * Called with the radial node radii, ångström, each time an orbital is
   * sampled — so the page can mark them on a radial plot beside the canvas.
   * @default undefined
   */
  onNodeRadii?: (radii: number[]) => void;
  /**
   * Called when an orbital cannot be drawn, with the reason.
   * @default undefined
   */
  onError?: (message: string) => void;
}

/**
 * Mount one molstar canvas and keep it showing the orbital named by the props.
 * @param props - See {@link AtomicOrbitalCanvasProps}.
 * @returns The canvas, with a progress note while it samples.
 */
export function AtomicOrbitalCanvas(
  props: AtomicOrbitalCanvasProps,
): ReactElement {
  const {
    atomicNumber,
    orbitalId,
    palette = PHASE_PALETTES.textbook,
    resolution = DEFAULT_RESOLUTION,
    spinning = false,
    spinSpeed = DEFAULT_SPIN_SPEED,
    sample = sampleInProcess,
    onNodeRadii,
    onError,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OrbitalViewer | null>(null);
  const [drawn, setDrawn] = useState<string | null>(null);

  // What the canvas is being asked to show. Comparing it with what it *is*
  // showing gives the progress note without a state write on every prop change.
  const wanted = `${atomicNumber}|${orbitalId}|${resolutionKey(resolution)}|${palette.id}`;
  const busy = drawn !== wanted;

  // Callbacks are read through refs so a caller passing an inline arrow does
  // not re-sample the orbital on every render of its parent.
  const callbacks = useRef({ onNodeRadii, onError });
  useEffect(() => {
    callbacks.current = { onNodeRadii, onError };
  });

  // Created and disposed once per mount. React 19 runs this twice in
  // development; `createOrbitalViewer` is synchronous so the first canvas is
  // always disposed instead of leaking its WebGL context.
  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;
    const viewer = createOrbitalViewer(container);
    viewerRef.current = viewer;
    const observer = new ResizeObserver(() => {
      viewer.handleResize();
    });
    observer.observe(container);
    return () => {
      observer.disconnect();
      viewerRef.current = null;
      viewer.dispose();
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer === null) return;
    let cancelled = false;
    void sample({ atomicNumber, orbitalId, resolution })
      .then(async (result) => {
        if (cancelled) return;
        callbacks.current.onNodeRadii?.(result.nodeRadii);
        const reach = await viewer.showOrbital(result.grid, result.contour, {
          positiveColour: palette.positive,
          negativeColour: palette.negative,
        });
        await viewer.frame(reach);
        if (!cancelled) setDrawn(wanted);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        callbacks.current.onError?.(
          error instanceof Error ? error.message : String(error),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [atomicNumber, orbitalId, resolution, palette, sample, wanted]);

  useEffect(() => {
    void viewerRef.current?.setSpin(spinning, spinSpeed);
  }, [spinning, spinSpeed]);

  return (
    <div ref={containerRef} style={CANVAS_STYLE}>
      {busy && <div style={BUSY_STYLE}>Sampling…</div>}
    </div>
  );
}

/** Samples per edge; 56 resolves the radial node of a 3s in about 25 ms. */
const DEFAULT_RESOLUTION = 56;

/**
 * A stable identity for either shape the resolution prop can take.
 * @param resolution - A fixed sample count, or the limits it may vary between.
 * @returns A string that changes exactly when the sampling would.
 */
function resolutionKey(resolution: number | ResolutionLimits): string {
  return typeof resolution === 'number'
    ? String(resolution)
    : `${resolution.floor}-${resolution.cap}`;
}

/**
 * A square, centred stage: an atomic orbital is as tall as it is wide, so a
 * square wastes the least of the frame and keeps the lobes the same size when
 * the surrounding column changes width.
 */
const CANVAS_STYLE: CSSProperties = {
  position: 'relative',
  width: '100%',
  maxWidth: 'min(100%, 60vh)',
  aspectRatio: '1 / 1',
  margin: '0 auto',
  minHeight: 260,
  borderRadius: 3,
  overflow: 'hidden',
};

const BUSY_STYLE: CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 1,
  padding: '3px 8px',
  borderRadius: 3,
  background: 'rgba(255, 255, 255, 0.85)',
  color: '#5f6b7c',
  fontSize: 11,
};
