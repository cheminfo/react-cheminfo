/**
 * The measurements of one canvas: the list a parent may own, and the reader's
 * ways to change it — a tool adds one, the clear button empties it, and
 * Backspace or Delete removes the one under the pointer.
 */

import type { RefObject } from 'react';
import { useCallback, useEffect, useRef } from 'react';

import { isEditingField } from '../../panel/core/isEditingField.ts';
import type { Measurement } from '../core/measurement.ts';
import { removeMeasurement } from '../core/measurement.ts';

import { useControlledState } from './useControlledState.ts';
import type { Molecule3DViewer } from './viewer.ts';

/** The list, and stable callbacks that change it. */
export interface MeasurementList {
  measurements: readonly Measurement[];
  add: (measurement: Measurement) => void;
  remove: (measurement: Measurement) => void;
  clear: () => void;
}

/**
 * The measurements, owned by the parent when it passes `value`.
 * @param value - The parent's list, or `undefined` to keep one here.
 * @param onChange - Called with the whole list after every change.
 * @returns The list and its callbacks, which never change identity, so a
 * viewer created once can keep them.
 */
export function useMeasurementList(
  value: readonly Measurement[] | undefined,
  onChange: ((measurements: readonly Measurement[]) => void) | undefined,
): MeasurementList {
  const [measurements, setMeasurements] = useControlledState<
    readonly Measurement[]
  >(value, NO_MEASUREMENTS, onChange);
  const latest = useRef(measurements);
  useEffect(() => {
    latest.current = measurements;
  });
  const add = useCallback(
    (measurement: Measurement) => {
      setMeasurements([...latest.current, measurement]);
    },
    [setMeasurements],
  );
  const remove = useCallback(
    (measurement: Measurement) => {
      const next = removeMeasurement(latest.current, measurement);
      if (next !== latest.current) setMeasurements(next);
    },
    [setMeasurements],
  );
  const clear = useCallback(() => {
    setMeasurements(NO_MEASUREMENTS);
  }, [setMeasurements]);
  return { measurements, add, remove, clear };
}

/**
 * Remove the measurement under the pointer when the reader presses Backspace
 * or Delete, unless they are typing in a field.
 * @param container - The element the viewer draws in; a new one is a new viewer.
 * @param viewerRef - The viewer, `null` while there is none.
 * @param onRemove - Called with the measurement to remove; `undefined` turns
 * the gesture off.
 */
export function useMeasurementRemoval(
  container: HTMLElement | null,
  viewerRef: RefObject<Molecule3DViewer | null>,
  onRemove: ((measurement: Measurement) => void) | undefined,
): void {
  const latest = useRef(onRemove);
  useEffect(() => {
    latest.current = onRemove;
  });
  const listening = onRemove !== undefined;
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!listening || viewer === null) return;
    let hovered: Measurement | null = null;
    const stopWatching = viewer.watchHoverMeasurement((measurement) => {
      hovered = measurement;
    });
    function handleKeyDown(event: KeyboardEvent): void {
      if (hovered === null || !isRemovalKey(event)) return;
      event.preventDefault();
      const measurement = hovered;
      // Gone from the scene: a second press must wait for the next hover.
      hovered = null;
      latest.current?.(measurement);
    }
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => {
      globalThis.removeEventListener('keydown', handleKeyDown);
      stopWatching();
    };
  }, [container, viewerRef, listening]);
}

const NO_MEASUREMENTS: readonly Measurement[] = [];

function isRemovalKey(event: KeyboardEvent): boolean {
  if (event.key !== 'Backspace' && event.key !== 'Delete') return false;
  if (event.defaultPrevented) return false;
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  return !isEditingField(event.target);
}
