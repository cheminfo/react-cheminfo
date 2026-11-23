/**
 * The molstar canvas of the crystal view, with the family's toolbars over it,
 * in a box that can fill the screen.
 *
 * `CrystalViewer3D` reaches this module through `React.lazy`, so a page that
 * never shows a crystal never downloads molstar. Every effect below lists
 * exactly what it reads, so a page that keeps its scene stable redraws only the
 * part that changed: toggling one mirror does not rebuild the structure, and
 * moving the pointer does not redraw anything.
 */

import type { CSSProperties, ReactElement } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Molecule3DCamera } from '../../molecule3d/core/camera.ts';
import type { Measurement } from '../../molecule3d/core/measurement.ts';
import type { Molecule3DSettings } from '../../molecule3d/core/settings.ts';
import { normalizeMolecule3DSettings } from '../../molecule3d/core/settings.ts';
import type { Molecule3DTools } from '../../molecule3d/core/tools.ts';
import { Molecule3DOptions } from '../../molecule3d/ui/Molecule3DOptions.tsx';
import { Molecule3DStage } from '../../molecule3d/ui/Molecule3DStage.tsx';
import { useControlledState } from '../../molecule3d/ui/useControlledState.ts';
import { useImageExport } from '../../molecule3d/ui/useImageExport.ts';
import { MolstarToolbar } from '../../molstar/ui/MolstarToolbar.tsx';
import { useMolstarTools } from '../../molstar/ui/useMolstarTools.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { sceneOrientation } from '../core/orientation.ts';
import type { ViewerAtom } from '../core/types.ts';
import type { CrystalViewer, StructureStyle } from '../viewer/index.ts';
import {
  DEFAULT_CAMERA_DURATION,
  createCrystalViewer,
} from '../viewer/index.ts';

import type { CrystalScene, CrystalViewHandle } from './crystalScene.ts';

/** Props of {@link CrystalCanvas3D}. */
export interface CrystalCanvas3DProps {
  /** What to show. */
  scene: CrystalScene;
  /**
   * Scene background, `#rrggbb`.
   * @default '#ffffff'
   */
  background?: string;
  /**
   * Which tools the toolbars offer; every one it does not name is on.
   * @default every tool
   */
  tools?: Partial<Molecule3DTools>;
  /**
   * How the atoms are drawn, when the page owns it — to keep it in the
   * address, or the same on every page of the site.
   * @default undefined
   */
  settings?: Molecule3DSettings;
  /**
   * How the atoms are drawn at first when the canvas owns it, and what the
   * display options' reset button returns to either way.
   * @default DEFAULT_MOLECULE_3D_SETTINGS
   */
  defaultSettings?: Partial<Molecule3DSettings>;
  /**
   * Called with the new settings after any change from the toolbar.
   * @default undefined
   */
  onSettingsChange?: (settings: Molecule3DSettings) => void;
  /**
   * Base name of a picture saved from the toolbar, extension excluded.
   * @default 'crystal'
   */
  fileName?: string;
  /**
   * Called whenever drawing fails, with one sentence, or `null` once it works
   * again.
   * @default undefined
   */
  onFailure?: (message: string | null) => void;
  /**
   * Called with the means to picture the scene once the canvas exists, and with
   * `null` once it is gone.
   * @default undefined
   */
  onHandle?: (handle: CrystalViewHandle | null) => void;
}

/**
 * Draw the scene, say what the pointer rests on, and float the toolbars.
 * @param props - See {@link CrystalCanvas3DProps}.
 * @returns The stage holding the canvas, its toolbars and its readout.
 */
export function CrystalCanvas3D(props: CrystalCanvas3DProps): ReactElement {
  const {
    scene,
    background,
    tools,
    settings: settingsProp,
    defaultSettings,
    onSettingsChange,
    fileName = 'crystal',
    onFailure,
    onHandle,
  } = props;
  const {
    atoms,
    camera = null,
    cell = null,
    repeat,
    bonds = 'all',
    elements,
    labels,
    elementStyle,
    play = null,
  } = scene;
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [initialSettings] = useState(() =>
    normalizeMolecule3DSettings(defaultSettings),
  );
  const [settings, setSettings] = useControlledState(
    settingsProp,
    initialSettings,
    onSettingsChange,
  );
  const style = useStructureStyle(settings, bonds);

  // The viewer is not React state: it is an external resource the effects below
  // reach through this handle. Putting it in state would set state inside an
  // effect, and every draw would then cost an extra render.
  const held = useRef<CrystalViewer | null>(null);

  // Which way the scene is opened on: measured from its own principal axis, so
  // a molecule built about z and one built about x both open on a view where a
  // plane reads as a plane and an axis reads as a rod.
  const orientation = useMemo(
    () => sceneOrientation({ cell, elements }),
    [cell, elements],
  );
  // Held in a ref rather than read as a dependency, because only a new
  // structure reframes: switching a layer off changes which elements are drawn,
  // and a camera that swung round at that moment would look like the chip had
  // moved the molecule.
  const framing = useRef(orientation);
  useEffect(() => {
    framing.current = orientation;
  }, [orientation]);

  // A camera a figure carried is put back once, on the structure it came
  // with; every later redraw frames the scene as any other does.
  const opening = useRef<Molecule3DCamera | null>(camera);
  const applied = useRef<Molecule3DCamera | null>(null);
  useEffect(() => {
    opening.current = camera;
  }, [camera]);

  // Kept in a ref as well, so a page passing an inline callback does not redraw
  // the whole scene on every render.
  const failure = useRef(onFailure);
  useEffect(() => {
    failure.current = onFailure;
  }, [onFailure]);

  // The draw in flight, so a picture or a measurement asked for meanwhile
  // waits for it.
  const drawing = useRef<Promise<void> | null>(null);

  const { measurements, addMeasurement, clearMeasurements } =
    useMeasurementsOf(atoms);

  const imageExport = useImageExport(container, held, fileName);
  const { capture } = imageExport;
  const handing = useRef(onHandle);
  useEffect(() => {
    handing.current = onHandle;
  }, [onHandle]);
  useEffect(() => {
    const listener = handing.current;
    if (listener === undefined || container === null) return;
    listener({
      capture,
      readCamera: () => held.current?.readCamera() ?? Promise.resolve(null),
      whenDrawn: () => drawing.current ?? Promise.resolve(),
    });
    return () => {
      listener(null);
    };
  }, [capture, container]);

  // A callback ref, so the viewer is created by the element arriving; the
  // effects that draw are declared after this one and so run after it, and
  // every one of them lists `container` so a remount redraws.
  useEffect(() => {
    if (container === null) return;
    const created = createCrystalViewer(container, {
      background,
      onMeasure: addMeasurement,
    });
    held.current = created;
    const observer = new ResizeObserver(() => {
      created.handleResize();
    });
    observer.observe(container);
    return () => {
      held.current = null;
      observer.disconnect();
      created.dispose();
    };
  }, [container, background, addMeasurement]);

  const controls = useMolstarTools(held, container);

  useEffect(() => {
    const viewer = held.current;
    if (viewer === null) return;
    return viewer.onHover(setHovered);
  }, [container, background]);

  // Before the structure below, so a new viewer draws its first structure in
  // the style on screen; a later change redraws the style alone.
  useEffect(() => {
    const viewer = held.current;
    if (viewer === null) return;
    void report(failure, viewer.setStyle(style));
  }, [container, background, style]);

  useEffect(() => {
    const viewer = held.current;
    if (viewer === null) return;
    container?.setAttribute('data-drawn', 'false');
    const work = (async () => {
      await viewer.showStructure(atoms);
      await viewer.showCell(cell, repeat);
      const wanted = opening.current;
      if (wanted !== null && wanted !== applied.current) {
        applied.current = wanted;
        await viewer.applyCamera(wanted);
      } else {
        await viewer.resetCamera(0, framing.current);
      }
      container?.setAttribute('data-drawn', 'true');
    })();
    drawing.current = work.catch(() => undefined);
    void report(failure, work);
  }, [container, background, atoms, cell, repeat]);

  // Once the structure above is on screen, so they are drawn on the atoms they
  // name.
  useEffect(() => {
    const viewer = held.current;
    if (viewer === null) return;
    let cancelled = false;
    void (drawing.current ?? Promise.resolve()).then(() => {
      if (!cancelled) void viewer.showMeasurements(measurements);
    });
    return () => {
      cancelled = true;
    };
  }, [container, background, measurements]);

  useEffect(() => {
    const viewer = held.current;
    if (viewer === null) return;
    void report(
      failure,
      viewer.showElements(elements ?? [], { labels, style: elementStyle }),
    );
  }, [container, background, elements, labels, elementStyle]);

  // The nonce is the cue that replays the same operation; the operation itself
  // is in the list so that changing it applies the new one.
  const operation = play?.operation ?? null;
  const duration = play?.durationMs;
  const nonce = play?.nonce ?? null;
  useEffect(() => {
    const viewer = held.current;
    if (viewer === null) return;
    if (operation === null || nonce === null) {
      void report(failure, viewer.resetOperation());
      return;
    }
    void report(
      failure,
      viewer.playOperation(operation, { durationMs: duration }),
    );
  }, [container, background, operation, duration, nonce]);

  return (
    <Molecule3DStage style={STAGE_STYLE}>
      {(fullscreen) => (
        <>
          <div
            ref={setContainer}
            style={CANVAS_STYLE}
            data-testid="crystal-3d"
          />
          {atoms.length > 0 && (
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
              options={
                <Molecule3DOptions
                  settings={settings}
                  onChange={setSettings}
                  polarSurfaceArea={null}
                  defaults={initialSettings}
                />
              }
              onResetView={() => {
                void held.current?.resetCamera(
                  DEFAULT_CAMERA_DURATION,
                  framing.current,
                );
              }}
              imageExport={imageExport}
              fileName={fileName}
            />
          )}
          {hovered !== null && (
            <div style={READOUT_STYLE} data-testid="crystal-3d-readout">
              {hovered}
            </div>
          )}
        </>
      )}
    </Molecule3DStage>
  );
}

/**
 * The style the viewer draws, the same object while nothing it reads changes:
 * a page rebuilding equal settings on every render must not redraw the atoms.
 * @param settings - The display options.
 * @param bonds - Which bonds the scene asks for.
 * @returns The style.
 */
function useStructureStyle(
  settings: Molecule3DSettings,
  bonds: StructureStyle['bonds'],
): StructureStyle {
  const {
    representation,
    sizeFactor,
    bondSizeFactor,
    showSurface,
    probeRadius,
    surfaceAlpha,
    surfaceColoring,
    surfaceColor,
  } = settings;
  return useMemo(
    () => ({
      representation,
      sizeFactor,
      bondSizeFactor,
      bonds,
      surface: showSurface
        ? {
            probeRadius,
            alpha: surfaceAlpha,
            coloring: surfaceColoring,
            color: surfaceColor,
          }
        : null,
    }),
    [
      representation,
      sizeFactor,
      bondSizeFactor,
      bonds,
      showSurface,
      probeRadius,
      surfaceAlpha,
      surfaceColoring,
      surfaceColor,
    ],
  );
}

/** What was measured, and on which atoms. */
interface TakenMeasurements {
  readonly atoms: readonly ViewerAtom[];
  readonly list: readonly Measurement[];
}

/**
 * The measurements taken on the atoms on screen. A new set of atoms is a new
 * structure, whose atoms no measurement names, so the list starts empty again.
 * @param atoms - The atoms on screen.
 * @returns The list, and stable callbacks that change it.
 */
function useMeasurementsOf(atoms: readonly ViewerAtom[]): {
  measurements: readonly Measurement[];
  addMeasurement: (measurement: Measurement) => void;
  clearMeasurements: () => void;
} {
  const latest = useRef(atoms);
  useEffect(() => {
    latest.current = atoms;
  }, [atoms]);
  const [taken, setTaken] = useState<TakenMeasurements>(() => ({
    atoms,
    list: NO_MEASUREMENTS,
  }));
  const addMeasurement = useCallback((measurement: Measurement) => {
    setTaken((previous) => ({
      atoms: latest.current,
      list:
        previous.atoms === latest.current
          ? [...previous.list, measurement]
          : [measurement],
    }));
  }, []);
  const clearMeasurements = useCallback(() => {
    setTaken({ atoms: latest.current, list: NO_MEASUREMENTS });
  }, []);
  const measurements = taken.atoms === atoms ? taken.list : NO_MEASUREMENTS;
  return { measurements, addMeasurement, clearMeasurements };
}

/**
 * Report a failure as one sentence, and clear it once the next draw works.
 * @param listener - The ref holding the page's failure callback.
 * @param listener.current - The callback, given the message or `null`.
 * @param work - The draw whose outcome is reported.
 */
async function report(
  listener: { current?: (message: string | null) => void },
  work: Promise<void>,
): Promise<void> {
  try {
    await work;
    listener.current?.(null);
  } catch (error) {
    listener.current?.(
      error instanceof Error ? error.message : 'The scene could not be drawn.',
    );
  }
}

const NO_MEASUREMENTS: readonly Measurement[] = [];

const STAGE_STYLE: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: 0,
  background: TOKEN.surface,
};

/** molstar inserts its canvas here, which therefore has a size of its own. */
const CANVAS_STYLE: CSSProperties = { position: 'absolute', inset: 0 };

/*
 * The readout sits over the canvas rather than beside it, so naming an axis does
 * not reflow the page while the pointer moves.
 */
const READOUT_STYLE: CSSProperties = {
  position: 'absolute',
  right: 8,
  bottom: 8,
  left: 8,
  padding: '3px 8px',
  borderRadius: 6,
  background: TOKEN.surface,
  color: TOKEN.text,
  fontSize: 12,
  opacity: 0.92,
  pointerEvents: 'none',
  textAlign: 'right',
};
