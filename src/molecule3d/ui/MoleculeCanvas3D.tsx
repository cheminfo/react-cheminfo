/**
 * The molstar canvas of `MoleculeViewer3D`, with its toolbars over it, in a
 * box that can fill the screen.
 *
 * Reached through `React.lazy`, so a page that never shows a molecule never
 * downloads molstar.
 */

import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';

import { DEFAULT_SPIN_SPEED } from '../../molstar/core/index.ts';
import { DEFAULT_FRAMES_PER_SECOND } from '../core/animatedPng.ts';
import type { Molecule3DHighlight } from '../core/highlight.ts';
import type { Measurement, MeasurementKind } from '../core/measurement.ts';
import {
  normalizeMolecule3DSettings,
  resolveMolecule3DTools,
} from '../core/settings.ts';

import { Molecule3DExport } from './Molecule3DExport.tsx';
import { Molecule3DOptions } from './Molecule3DOptions.tsx';
import { Molecule3DStage } from './Molecule3DStage.tsx';
import { Molecule3DToolbar } from './Molecule3DToolbar.tsx';
import { highlightColorOf } from './highlightColor.ts';
import type { MoleculeViewer3DProps } from './moleculeViewer3DProps.ts';
import { useControlledState } from './useControlledState.ts';
import { useImageExport } from './useImageExport.ts';
import { useMoleculeScene } from './useMoleculeScene.ts';
import { useMoleculeViewer } from './useMoleculeViewer.ts';
import { usePolarSurfaceArea } from './usePolarSurfaceArea.ts';

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
    frameNewMolecule = 'keep',
    tools: toolsProp,
    settings: settingsProp,
    defaultSettings,
    onSettingsChange,
    spinning: spinningProp,
    defaultSpinning = false,
    onSpinningChange,
    spinSpeed = DEFAULT_SPIN_SPEED,
    playing = false,
    framesPerSecond = DEFAULT_FRAMES_PER_SECOND,
    measurements: measurementsProp,
    onMeasurementsChange,
    highlights = NO_HIGHLIGHTS,
    fileName = 'molecule',
    background,
    minHeight = 320,
    onFailureChange,
  } = props;
  const tools = resolveMolecule3DTools(toolsProp);
  const [initialSettings] = useState(() =>
    normalizeMolecule3DSettings(defaultSettings),
  );
  const [settings, setSettings] = useControlledState(
    settingsProp,
    initialSettings,
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
  const [frameCount, setFrameCount] = useState(0);
  const polarSurfaceArea = usePolarSurfaceArea(
    molfile,
    settings.surfaceColoring === 'polarity',
  );

  // A callback ref: the element arriving is what creates the viewer, and every
  // effect keyed on it runs again, in order, after the viewer exists.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  // The viewer is created once, so what its callbacks read is kept fresh here.
  const latest = useRef({ measurements, setMeasurements });
  useEffect(() => {
    latest.current = { measurements, setMeasurements };
  });
  const viewerRef = useMoleculeViewer(container, {
    background,
    onMeasure: (measurement) => {
      const current = latest.current;
      current.setMeasurements([...current.measurements, measurement]);
    },
    onFrameCountChange: setFrameCount,
  });

  useEffect(() => {
    void viewerRef.current?.setSpin(spinning, spinSpeed);
  }, [container, viewerRef, spinning, spinSpeed]);

  useEffect(() => {
    void viewerRef.current?.frames.play(playing, framesPerSecond);
  }, [container, viewerRef, playing, framesPerSecond]);

  useEffect(() => {
    void viewerRef.current?.setMeasureKind(measureKind);
  }, [container, viewerRef, measureKind]);

  // Kept out of the scene: a new highlight repaints the model, never redraws it.
  useEffect(() => {
    void viewerRef.current?.setHighlights(
      highlights,
      highlightColorOf(container),
    );
  }, [container, viewerRef, highlights]);

  const { resetView } = useMoleculeScene({
    container,
    viewerRef,
    molfile,
    frameNewMolecule,
    settings,
    measurements,
    spinning,
    onFailureChange,
    camera: props,
  });

  const { canvasSize, exportImage, copyImage } = useImageExport(
    container,
    viewerRef,
    fileName,
    framesPerSecond,
  );

  return (
    <Molecule3DStage style={{ ...STAGE_STYLE, minHeight }}>
      {(fullscreen) => (
        <>
          <div
            ref={setContainer}
            style={CANVAS_STYLE}
            data-testid="molecule3d"
          />
          {molfile !== null && (
            <div style={OVERLAY_STYLE}>
              <Molecule3DToolbar
                tools={tools}
                fullscreen={fullscreen}
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
                    defaults={initialSettings}
                  />
                }
                exportPanel={
                  <Molecule3DExport
                    getSize={canvasSize}
                    onExport={exportImage}
                    onCopy={copyImage}
                    frameCount={frameCount}
                  />
                }
              />
            </div>
          )}
        </>
      )}
    </Molecule3DStage>
  );
}

const NO_MEASUREMENTS: readonly Measurement[] = [];

const NO_HIGHLIGHTS: readonly Molecule3DHighlight[] = [];

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
  bottom: 8,
  left: 8,
  zIndex: 2,
  display: 'flex',
  alignItems: 'flex-start',
  gap: 8,
  pointerEvents: 'none',
};
