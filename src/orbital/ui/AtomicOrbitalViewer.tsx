/**
 * One atomic orbital in three dimensions, and what to say when there cannot be
 * one.
 *
 * Two precautions, both of which are the reason to use this component rather
 * than the canvas directly: the WebGL probe runs *before* molstar is touched,
 * because a locked-down school machine would otherwise get a blank rectangle
 * with no explanation, and the canvas sits behind `React.lazy`, so a page that
 * never reaches it never downloads molstar.
 *
 * ```tsx
 * import { AtomicOrbitalViewer } from 'react-cheminfo/orbital';
 *
 * <AtomicOrbitalViewer atomicNumber={26} orbitalId="3dz2" />;
 * ```
 */

import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { Suspense, lazy, useState } from 'react';

import type { ResolutionLimits } from '../core/atomicGrid.ts';
import type { PhasePalette } from '../core/palette.ts';
import type { AtomicSampler } from '../core/sample.ts';

// Deep import on purpose: `capability.ts` imports nothing, while the sibling
// canvas pulls molstar in — which is exactly what this probe exists to avoid.
import type { ViewerCapability } from './capability.ts';
import { probeViewerCapability } from './capability.ts';

const AtomicOrbitalCanvas = lazy(async () => {
  const module = await import('./AtomicOrbitalCanvas.tsx');
  return { default: module.AtomicOrbitalCanvas };
});

/** Props of {@link AtomicOrbitalViewer}. */
export interface AtomicOrbitalViewerProps {
  /** Proton count of the element, 1 to 118. */
  atomicNumber: number;
  /** Which orbital of it, e.g. `3dz2`; ids come from `atomicOrbitalsOf`. */
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
   * shape pick a resolution between the two.
   * @default 56
   */
  resolution?: number | ResolutionLimits;
  /**
   * Whether the scene turns on its own.
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
   * sampled.
   * @default undefined
   */
  onNodeRadii?: (radii: number[]) => void;
  /**
   * What to show while molstar is downloading.
   * @default 'Loading the 3D viewer…'
   */
  fallback?: ReactNode;
  /**
   * What to show when the machine cannot render at all. Receives the probe, so
   * a site can word the refusal in its own voice; the default writes
   * `capability.message`.
   * @default undefined
   */
  renderUnsupported?: (capability: ViewerCapability) => ReactNode;
}

/**
 * The 3D atomic orbital.
 * @param props - See {@link AtomicOrbitalViewerProps}.
 * @returns The viewer, or an explanation of why this machine cannot show one.
 */
export function AtomicOrbitalViewer(
  props: AtomicOrbitalViewerProps,
): ReactElement {
  const {
    fallback = 'Loading the 3D viewer…',
    renderUnsupported,
    ...canvas
  } = props;
  const [capability] = useState(probeViewerCapability);
  const [failure, setFailure] = useState<string | null>(null);

  if (!capability.supported) {
    return (
      <div style={NOTE_STYLE}>
        {renderUnsupported?.(capability) ?? capability.message}
      </div>
    );
  }

  return (
    <div style={ROOT_STYLE}>
      <Suspense fallback={<div style={NOTE_STYLE}>{fallback}</div>}>
        <AtomicOrbitalCanvas
          {...canvas}
          onError={(message) => {
            setFailure(message);
          }}
        />
      </Suspense>
      {failure !== null && (
        <div style={FAILURE_STYLE}>
          This orbital could not be drawn: {failure}
        </div>
      )}
    </div>
  );
}

const ROOT_STYLE: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  minWidth: 0,
};

const NOTE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 260,
  padding: 12,
  borderRadius: 3,
  background: 'rgb(241 245 249)',
  color: '#5f6b7c',
  fontSize: 13,
  textAlign: 'center',
};

const FAILURE_STYLE: CSSProperties = {
  padding: '6px 9px',
  borderRadius: 3,
  background: '#fdeaea',
  color: '#8c2b2b',
  fontSize: 12,
};
