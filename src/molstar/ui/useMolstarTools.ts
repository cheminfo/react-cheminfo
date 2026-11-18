/**
 * What the toolbar over a molstar canvas changes on the viewer: whether the
 * scene turns, and what a click on an atom measures.
 *
 * Every 3D view of the family keeps its own viewer class — a molecule, its
 * orbitals, a crystal — but all of them turn and measure the same way, so the
 * state and the two effects that hand it to the viewer are written once here.
 */

import type { RefObject } from 'react';
import { useEffect, useState } from 'react';

import type { MeasurementKind } from '../../molecule3d/core/measurement.ts';
import { useControlledState } from '../../molecule3d/ui/useControlledState.ts';
import { DEFAULT_SPIN_SPEED } from '../core/camera.ts';

/** What a viewer offers the toolbar; each method resolves once it is done. */
export interface MolstarToolsViewer {
  /** Turn the automatic spin on or off, at `speed`. */
  setSpin: (spinning: boolean, speed?: number) => Promise<void>;
  /** Make clicks on atoms build this measurement, or give them back. */
  setMeasureKind: (kind: MeasurementKind | null) => Promise<void>;
}

/** Options of {@link useMolstarTools}. */
export interface MolstarToolsOptions {
  /**
   * Whether the scene turns, when the parent owns it.
   * @default undefined
   */
  spinning?: boolean;
  /**
   * Whether the scene turns at first, when the toolbar owns it.
   * @default false
   */
  defaultSpinning?: boolean;
  /**
   * Called with every change of the spin.
   * @default undefined
   */
  onSpinningChange?: (spinning: boolean) => void;
  /**
   * Turn rate, in molstar's own spin unit.
   * @default DEFAULT_SPIN_SPEED
   */
  spinSpeed?: number;
}

/** The toolbar's state, and its setters. */
export interface MolstarTools {
  /** The measurement a click on an atom builds, or `null`. */
  measureKind: MeasurementKind | null;
  setMeasureKind: (kind: MeasurementKind | null) => void;
  /** Whether the scene turns. */
  spinning: boolean;
  setSpinning: (spinning: boolean) => void;
}

/**
 * Keep the viewer turning and measuring as the toolbar says.
 *
 * Call it after the viewer is created, in the same component: effects run in
 * the order they are declared, so a viewer created by an earlier effect is
 * there when these run.
 * @param viewerRef - The viewer, `null` while there is none.
 * @param container - The element the viewer draws in; a new one is a new
 *   viewer, which is handed the state again.
 * @param options - See {@link MolstarToolsOptions}.
 * @returns See {@link MolstarTools}.
 */
export function useMolstarTools(
  viewerRef: RefObject<MolstarToolsViewer | null>,
  container: HTMLElement | null,
  options: MolstarToolsOptions = {},
): MolstarTools {
  const {
    spinning: spinningProp,
    defaultSpinning = false,
    onSpinningChange,
    spinSpeed = DEFAULT_SPIN_SPEED,
  } = options;
  const [measureKind, setMeasureKind] = useState<MeasurementKind | null>(null);
  const [spinning, setSpinning] = useControlledState(
    spinningProp,
    defaultSpinning,
    onSpinningChange,
  );

  useEffect(() => {
    void viewerRef.current?.setSpin(spinning, spinSpeed);
  }, [viewerRef, container, spinning, spinSpeed]);

  useEffect(() => {
    void viewerRef.current?.setMeasureKind(measureKind);
  }, [viewerRef, container, measureKind]);

  return { measureKind, setMeasureKind, spinning, setSpinning };
}
