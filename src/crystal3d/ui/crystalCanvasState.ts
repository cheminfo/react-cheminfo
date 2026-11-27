/**
 * What the crystal canvas keeps besides the viewer: the style it draws, the
 * measurements taken on its atoms, and how a failed draw is reported.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Measurement } from '../../molecule3d/core/measurement.ts';
import type { Molecule3DSettings } from '../../molecule3d/core/settings.ts';
import type { ViewerAtom } from '../core/types.ts';
import type { StructureStyle } from '../viewer/index.ts';

/**
 * The style the viewer draws, the same object while nothing it reads changes:
 * a page rebuilding equal settings on every render must not redraw the atoms.
 * @param settings - The display options.
 * @param bonds - Which bonds the scene asks for.
 * @returns The style.
 */
export function useStructureStyle(
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
export function useMeasurementsOf(atoms: readonly ViewerAtom[]): {
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
export async function report(
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
