/**
 * The molstar canvas of `MoleculeViewer3D`, with its toolbars over it, in a
 * box that can fill the screen.
 *
 * Reached through `React.lazy`, so a page that never shows a molecule never
 * downloads molstar.
 */

import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { DEFAULT_SPIN_SPEED } from '../../molstar/core/index.ts';
import { MolstarToolbar } from '../../molstar/ui/MolstarToolbar.tsx';
import { useMolstarTools } from '../../molstar/ui/useMolstarTools.ts';
import { DEFAULT_FRAMES_PER_SECOND } from '../core/animatedPng.ts';
import type { Molecule3DHighlight } from '../core/highlight.ts';
import {
  normalizeMolecule3DSettings,
  resolveMolecule3DTools,
} from '../core/settings.ts';

import { Molecule3DOptions } from './Molecule3DOptions.tsx';
import { Molecule3DStage } from './Molecule3DStage.tsx';
import { highlightColorOf } from './highlightColor.ts';
import { moleculeFileAtoms } from './moleculeFileFormats.ts';
import type { MoleculeViewer3DProps } from './moleculeViewer3DProps.ts';
import { useAtomHover } from './useAtomHover.ts';
import { useControlledState } from './useControlledState.ts';
import { useImageExport } from './useImageExport.ts';
import {
  useMeasurementList,
  useMeasurementRemoval,
} from './useMeasurements.ts';
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
    onAtomHover,
    fileName = 'molecule',
    background,
    minHeight = 320,
    onCapture,
    onFailureChange,
  } = props;
  const t = useChromeT();
  const tools = resolveMolecule3DTools(toolsProp);
  const [initialSettings] = useState(() =>
    normalizeMolecule3DSettings(defaultSettings),
  );
  const [settings, setSettings] = useControlledState(
    settingsProp,
    initialSettings,
    onSettingsChange,
  );
  const {
    measurements,
    add: addMeasurement,
    remove: removeMeasurement,
    clear: clearMeasurements,
  } = useMeasurementList(measurementsProp, onMeasurementsChange);
  const [frameCount, setFrameCount] = useState(0);
  const polarSurfaceArea = usePolarSurfaceArea(
    molfile,
    settings.surfaceColoring === 'polarity',
  );

  // A callback ref: the element arriving is what creates the viewer, and every
  // effect keyed on it runs again, in order, after the viewer exists.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const viewerRef = useMoleculeViewer(container, {
    background,
    onMeasure: addMeasurement,
    onFrameCountChange: setFrameCount,
  });
  useMeasurementRemoval(
    container,
    viewerRef,
    tools.measure && molfile !== null ? removeMeasurement : undefined,
  );

  const controls = useMolstarTools(viewerRef, container, {
    spinning: spinningProp,
    defaultSpinning,
    onSpinningChange,
    spinSpeed,
  });
  const { spinning } = controls;

  useEffect(() => {
    void viewerRef.current?.frames.play(playing, framesPerSecond);
  }, [container, viewerRef, playing, framesPerSecond]);

  // Kept out of the scene: a new highlight repaints the model, never redraws it.
  useEffect(() => {
    void viewerRef.current?.setHighlights(
      highlights,
      highlightColorOf(container),
    );
  }, [container, viewerRef, highlights]);
  useAtomHover(container, viewerRef, onAtomHover);

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

  const imageExport = useImageExport(
    container,
    viewerRef,
    fileName,
    framesPerSecond,
  );
  const { capture } = imageExport;

  useEffect(() => {
    if (onCapture === undefined || container === null) return;
    onCapture(capture);
    return () => {
      onCapture(null);
    };
  }, [onCapture, container, capture]);

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
            <MolstarToolbar
              controls={controls}
              tools={tools}
              fullscreen={fullscreen}
              measurementCount={measurements.length}
              onClearMeasurements={clearMeasurements}
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
              exportLabel={
                moleculeFileAtoms(molfile, frameCount) > 0
                  ? t('molecule3d.exportImageOrMolfile')
                  : undefined
              }
              imageExport={imageExport}
              frameCount={frameCount}
              molfile={molfile}
              fileName={fileName}
            />
          )}
        </>
      )}
    </Molecule3DStage>
  );
}

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
