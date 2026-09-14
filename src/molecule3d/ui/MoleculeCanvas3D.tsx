/**
 * The molstar canvas of `MoleculeViewer3D`, with its toolbars over it.
 *
 * Reached through `React.lazy`, so a page that never shows a molecule never
 * downloads molstar.
 */

import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Measurement, MeasurementKind } from '../core/measurement.ts';
import type { Molecule3DFile } from '../core/settings.ts';
import {
  normalizeMolecule3DSettings,
  resolveMolecule3DTools,
} from '../core/settings.ts';

import { Molecule3DExport } from './Molecule3DExport.tsx';
import { Molecule3DOptions } from './Molecule3DOptions.tsx';
import { Molecule3DToolbar } from './Molecule3DToolbar.tsx';
import { DEFAULT_SPIN_SPEED } from './camera.ts';
import { drawScene } from './drawScene.ts';
import type { MoleculeViewer3DProps } from './moleculeViewer3DProps.ts';
import { useControlledState } from './useControlledState.ts';
import { useImageExport } from './useImageExport.ts';
import { usePolarSurfaceArea } from './usePolarSurfaceArea.ts';
import type { Molecule3DViewer } from './viewer.ts';
import { createMolecule3DViewer } from './viewer.ts';

/** Props of {@link MoleculeCanvas3D}. */
export interface MoleculeCanvas3DProps extends Omit<
  MoleculeViewer3DProps,
  'fallback' | 'renderUnsupported'
> {
  /** Called with a drawing failure, and with `null` once a draw succeeds. */
  onFailureChange: (message: string | null) => void;
}

/**
 * Mount one molstar canvas and keep it showing what the props describe.
 * @param props - See {@link MoleculeCanvas3DProps}.
 * @returns The canvas with its toolbars.
 */
export function MoleculeCanvas3D(props: MoleculeCanvas3DProps): ReactElement {
  const {
    molfile,
    tools: toolsProp,
    settings: settingsProp,
    defaultSettings,
    onSettingsChange,
    spinning: spinningProp,
    defaultSpinning = false,
    onSpinningChange,
    spinSpeed = DEFAULT_SPIN_SPEED,
    measurements: measurementsProp,
    onMeasurementsChange,
    fileName = 'molecule',
    background,
    minHeight = 320,
    onFailureChange,
  } = props;
  const tools = resolveMolecule3DTools(toolsProp);
  const [settings, setSettings] = useControlledState(
    settingsProp,
    () => normalizeMolecule3DSettings(defaultSettings),
    onSettingsChange,
  );
  const [spinning, setSpinning] = useControlledState(
    spinningProp,
    defaultSpinning,
    onSpinningChange,
  );
  const [measurements, setMeasurements] = useControlledState<
    readonly Measurement[]
  >(measurementsProp, NO_MEASUREMENTS, onMeasurementsChange);
  const [measureKind, setMeasureKind] = useState<MeasurementKind | null>(null);
  const polarSurfaceArea = usePolarSurfaceArea(
    molfile,
    settings.surfaceColoring === 'polarity',
  );

  // A callback ref: the element arriving is what creates the viewer, and every
  // effect keyed on it runs again, in order, after the viewer exists.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const viewerRef = useRef<Molecule3DViewer | null>(null);
  const framedRef = useRef<{
    molfile: Molecule3DFile;
    viewer: Molecule3DViewer;
  } | null>(null);

  // The viewer is created once, so what its callbacks read is kept fresh here.
  const latest = useRef({
    measurements,
    setMeasurements,
    onFailureChange,
    background,
  });
  useEffect(() => {
    latest.current = {
      measurements,
      setMeasurements,
      onFailureChange,
      background,
    };
  });

  useEffect(() => {
    if (container === null) return;
    const viewer = createMolecule3DViewer(container, {
      background: latest.current.background,
      onMeasure: (measurement) => {
        const current = latest.current;
        current.setMeasurements([...current.measurements, measurement]);
      },
    });
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
  }, [container]);

  // One animation frame of coalescing, so dragging a slider costs one rebuild.
  useEffect(() => {
    const viewer = viewerRef.current;
    if (container === null || viewer === null) return;
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      // Framed on a new molecule or a new viewer, never on a restyle: a slider
      // that snapped the camera back would undo the reader's orientation.
      const framed = framedRef.current;
      const frameCamera =
        molfile !== null &&
        (framed?.molfile !== molfile || framed.viewer !== viewer);
      framedRef.current = molfile === null ? null : { molfile, viewer };
      void drawScene(viewer, molfile, settings, measurements, frameCamera)
        .then(() => {
          if (!cancelled) latest.current.onFailureChange(null);
        })
        .catch((error: unknown) => {
          if (cancelled) return;
          latest.current.onFailureChange(
            error instanceof Error ? error.message : String(error),
          );
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [container, molfile, settings, measurements]);

  useEffect(() => {
    void viewerRef.current?.setSpin(spinning, spinSpeed);
  }, [container, spinning, spinSpeed]);

  useEffect(() => {
    void viewerRef.current?.setMeasureKind(measureKind);
  }, [container, measureKind]);

  const resetView = useCallback(() => {
    void viewerRef.current?.resetCamera();
  }, []);

  const { canvasSize, exportImage } = useImageExport(
    container,
    viewerRef,
    fileName,
  );

  return (
    <div style={{ ...STAGE_STYLE, minHeight }}>
      <div ref={setContainer} style={CANVAS_STYLE} data-testid="molecule3d" />
      {molfile !== null && (
        <div style={OVERLAY_STYLE}>
          <Molecule3DToolbar
            tools={tools}
            measureKind={measureKind}
            onMeasureKindChange={setMeasureKind}
            measurementCount={measurements.length}
            onClearMeasurements={() => {
              setMeasurements(NO_MEASUREMENTS);
            }}
            spinning={spinning}
            onSpinningChange={setSpinning}
            showSurface={settings.showSurface}
            onShowSurfaceChange={(showSurface) => {
              setSettings({ ...settings, showSurface });
            }}
            onResetView={resetView}
            options={
              <Molecule3DOptions
                settings={settings}
                onChange={setSettings}
                polarSurfaceArea={polarSurfaceArea}
              />
            }
            exportPanel={
              <Molecule3DExport getSize={canvasSize} onExport={exportImage} />
            }
          />
        </div>
      )}
    </div>
  );
}

const NO_MEASUREMENTS: readonly Measurement[] = [];

const STAGE_STYLE: CSSProperties = {
  position: 'relative',
  flex: '1 0 auto',
  width: '100%',
  borderRadius: 3,
  overflow: 'hidden',
};

/** molstar inserts its canvas here, which therefore has a size of its own. */
const CANVAS_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

const OVERLAY_STYLE: CSSProperties = {
  position: 'absolute',
  top: 8,
  left: 8,
  zIndex: 2,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  pointerEvents: 'none',
};
