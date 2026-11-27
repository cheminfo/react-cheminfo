/**
 * What every spectrum viewer derives from its list the same way: the spectra
 * drawn, the one selected, and the report to the host when the list changes.
 */

import { useEffect, useMemo, useRef } from 'react';

/** As much of a spectrum as the hooks read. */
interface IdentifiedSpectrum {
  /** Its identity, stable across edits. */
  id: string;
}

/**
 * The spectra drawn, in the order they are listed.
 * @param spectra - Every spectrum open.
 * @param isDrawn - Whether one is drawn; it must keep its identity.
 * @returns The ones drawn.
 */
export function useVisibleSpectra<TSpectrum>(
  spectra: readonly TSpectrum[],
  isDrawn: (spectrum: TSpectrum) => boolean,
): TSpectrum[] {
  return useMemo(() => {
    const visible: TSpectrum[] = [];
    for (const spectrum of spectra) {
      if (isDrawn(spectrum)) visible.push(spectrum);
    }
    return visible;
  }, [spectra, isDrawn]);
}

/**
 * The spectrum selected.
 * @param spectra - Every spectrum open.
 * @param selectedId - The identity selected, or `null`.
 * @returns It, or `null` when none is or the id names no spectrum open.
 */
export function useSelectedSpectrum<TSpectrum extends IdentifiedSpectrum>(
  spectra: readonly TSpectrum[],
  selectedId: string | null,
): TSpectrum | null {
  return useMemo(() => {
    if (selectedId === null) return null;
    for (const spectrum of spectra) {
      if (spectrum.id === selectedId) return spectrum;
    }
    return null;
  }, [spectra, selectedId]);
}

/**
 * Whether two lists hold the same spectra, in order, by identity: every edit
 * replaces the array, including the ones that only change how a spectrum is
 * drawn, and those are not a change of what is loaded.
 * @param current - What was reported last.
 * @param next - What is open now.
 * @returns Whether the report can be skipped.
 */
export function sameSpectrumIds<TSpectrum extends IdentifiedSpectrum>(
  current: readonly TSpectrum[],
  next: readonly TSpectrum[],
): boolean {
  if (current === next) return true;
  if (current.length !== next.length) return false;
  for (let index = 0; index < current.length; index++) {
    if ((current[index] as TSpectrum).id !== (next[index] as TSpectrum).id) {
      return false;
    }
  }
  return true;
}

/**
 * Tell the host what is open whenever it changes. What was reported last is
 * kept, so a host passing a fresh callback on every render is not told about
 * spectra that did not change.
 * @param spectra - Every spectrum open.
 * @param onChange - The host's callback, when it gave one.
 * @param same - Whether two lists are the same document; it must keep its
 * identity.
 */
export function useReportedSpectra<TList extends readonly IdentifiedSpectrum[]>(
  spectra: TList,
  onChange: ((spectra: TList) => void) | undefined,
  same: (current: TList, next: TList) => boolean = sameSpectrumIds,
): void {
  const reported = useRef(spectra);
  useEffect(() => {
    if (same(reported.current, spectra)) return;
    reported.current = spectra;
    onChange?.(spectra);
  }, [spectra, onChange, same]);
}
