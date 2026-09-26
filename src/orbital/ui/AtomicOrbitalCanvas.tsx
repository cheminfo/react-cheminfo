/**
 * The molstar canvas showing one atomic orbital.
 *
 * `AtomicOrbitalViewer` reaches this through `React.lazy`, so a page that
 * never shows an orbital never downloads molstar for it — which is the whole
 * reason the two components are separate files.
 */

import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { errorMessage } from '../../error/core/index.ts';
import { useResizeObserver } from '../../hooks/ui/useResizeObserver.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { ResolutionLimits } from '../core/atomicGrid.ts';
import type { PhasePalette } from '../core/palette.ts';
import { PHASE_PALETTES } from '../core/palette.ts';
import type { AtomicSampler } from '../core/sample.ts';
import { sampleInProcess } from '../core/sample.ts';

import { AtomicOrbitalControls } from './AtomicOrbitalControls.tsx';
import { DEFAULT_SPIN_SPEED } from './camera.ts';
import { fitAxes, resolutionKey } from './orbitalCanvasHelpers.ts';
import type { OrbitalViewer } from './viewer.ts';
import { createOrbitalViewer } from './viewer.ts';

/** Props of {@link AtomicOrbitalCanvas}. */
interface AtomicOrbitalCanvasProps {
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
   * Whether the labelled x, y, z frame is drawn through the nucleus when the
   * canvas opens. A `3d_xz` is only `3d_xz` because of where its lobes sit
   * against those axes, and a lone isosurface says nothing about that, so the
   * frame is on unless a site says otherwise.
   *
   * The canvas owns the state from then on: the button in its corner flips it,
   * and {@link AtomicOrbitalCanvasProps.onAxesChange} reports the new value to
   * a site that wants to remember it for the next mount.
   * @default true
   */
  axes?: boolean;
  /**
   * Called when the student flips the frame, with its new state — so a site can
   * persist the choice and pass it back as `axes`.
   * @default undefined
   */
  onAxesChange?: (axes: boolean) => void;
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
   * Called with the reason when an orbital cannot be drawn, and with `null`
   * once one has been drawn again.
   * @default undefined
   */
  onFailureChange?: (message: string | null) => void;
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
    axes: initialAxes = true,
    spinning = false,
    spinSpeed = DEFAULT_SPIN_SPEED,
    sample = sampleInProcess,
    onAxesChange,
    onNodeRadii,
    onFailureChange,
  } = props;

  const t = useChromeT();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<OrbitalViewer | null>(null);
  const [drawn, setDrawn] = useState<string | null>(null);

  // How far the drawn surface reaches, and whether the frame is wanted around
  // it. Both are read by the sampling effect, which finishes long after the
  // render that started it; keeping them in refs is what lets the frame be
  // switched on without re-sampling the orbital.
  const reachRef = useRef<number | null>(null);
  const axesRef = useRef(initialAxes);

  const [axes, setAxes] = useState(initialAxes);

  // What the canvas is being asked to show. Comparing it with what it *is*
  // showing gives the progress note without a state write on every prop change.
  const wanted = `${atomicNumber}|${orbitalId}|${resolutionKey(resolution)}|${palette.id}`;
  const busy = drawn !== wanted;

  // Callbacks are read through refs so a caller passing an inline arrow does
  // not re-sample the orbital on every render of its parent.
  const callbacks = useRef({ onAxesChange, onNodeRadii, onFailureChange });
  useEffect(() => {
    callbacks.current = { onAxesChange, onNodeRadii, onFailureChange };
  });

  // Created and disposed once per mount. React 19 runs this twice in
  // development; `createOrbitalViewer` is synchronous so the first canvas is
  // always disposed instead of leaking its WebGL context.
  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;
    const viewer = createOrbitalViewer(container);
    viewerRef.current = viewer;
    return () => {
      viewerRef.current = null;
      viewer.dispose();
    };
  }, []);

  useResizeObserver(containerRef, () => {
    viewerRef.current?.handleResize();
  });

  useEffect(() => {
    const viewer = viewerRef.current;
    if (viewer === null) return;
    let cancelled = false;
    void sample({ atomicNumber, orbitalId, resolution })
      .then(async (result) => {
        if (cancelled) return;
        callbacks.current.onNodeRadii?.(result.nodeRadii);
        const reach = await viewer.showOrbital(result.grid, result.contour, {
          positiveColor: palette.positive,
          negativeColor: palette.negative,
        });
        reachRef.current = reach ?? null;
        await viewer.refit(await fitAxes(viewer, reach, axesRef.current));
        if (cancelled) return;
        setDrawn(wanted);
        callbacks.current.onFailureChange?.(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        callbacks.current.onFailureChange?.(errorMessage(error));
      });
    return () => {
      cancelled = true;
    };
  }, [atomicNumber, orbitalId, resolution, palette, sample, wanted]);

  // Toggling the frame on an orbital already on screen: the field it was drawn
  // from is unchanged, so nothing is re-sampled.
  useEffect(() => {
    axesRef.current = axes;
    const viewer = viewerRef.current;
    const reach = reachRef.current;
    if (viewer === null || reach === null) return;
    void fitAxes(viewer, reach, axes).then((framed) => viewer.refit(framed));
  }, [axes]);

  useEffect(() => {
    void viewerRef.current?.setSpin(spinning, spinSpeed);
  }, [spinning, spinSpeed]);

  return (
    <div ref={containerRef} style={CANVAS_STYLE}>
      {busy && <div style={BUSY_STYLE}>{t('orbital.sampling')}</div>}
      <AtomicOrbitalControls
        axes={axes}
        onToggleAxes={() => {
          setAxes(!axes);
          callbacks.current.onAxesChange?.(!axes);
        }}
        onResetView={() => {
          void viewerRef.current?.resetView();
        }}
      />
    </div>
  );
}

/** Samples per edge; 56 resolves the radial node of a 3s in about 25 ms. */
const DEFAULT_RESOLUTION = 56;

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
  background: TOKEN.surface,
  opacity: 0.85,
  color: TOKEN.textMuted,
  fontSize: 11,
};
