/**
 * Reading the files a chemist drops on the chart or picks from a dialog.
 *
 * Every file is read on its own, and one that cannot be read is said rather
 * than stopping the others: a drop of eleven files with one infrared JCAMP among
 * them draws the ten mass spectra and names the eleventh in the status bar.
 */

import { useCallback, useMemo } from 'react';

import { errorMessage } from '../../error/core/index.ts';
import type { LoadMassSpectraResult } from '../core/loadMassSpectra.ts';
import { loadMassSpectra } from '../core/loadMassSpectra.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import { toMassSpectra } from '../core/toMassSpectrum.ts';

import { useMassActions, useMassEditorState } from './massStateContext.ts';

/** How files reach the viewer. */
export interface MassFiles {
  /**
   * Read these files and add what they hold.
   * @param files - What was dropped or chosen.
   * @returns Once every file has been read.
   */
  readFiles: (files: readonly File[]) => Promise<void>;
}

/**
 * Read files into the viewer this is called inside.
 * @returns How to read them.
 */
export function useMassFiles(): MassFiles {
  const { state } = useMassEditorState();
  const actions = useMassActions();
  const { spectra: open } = state.data;

  const readFiles = useCallback(
    async (files: readonly File[]) => {
      // Read together, since each read is the browser's work rather than ours,
      // and then dressed in the order the files were given, so the colours are
      // handed out in that order too.
      const results = await Promise.all(files.map(readFile));
      const colors = open.map((spectrum) => spectrum.color);
      const read: MassSpectrum[] = [];
      const problems: string[] = [];
      for (const [index, result] of results.entries()) {
        const name = files[index]?.name ?? 'A file';
        if (typeof result === 'string') {
          problems.push(result);
          continue;
        }
        try {
          const spectra = toMassSpectra(result.spectra, { taken: colors });
          for (const spectrum of spectra) colors.push(spectrum.color);
          read.push(...spectra);
        } catch (error) {
          problems.push(
            `${name} could not be peak picked — ${errorMessage(error)}`,
          );
          continue;
        }
        if (result.dropped > 0) {
          problems.push(
            `${name} holds ${result.spectra.length + result.dropped} spectra and only the first ${result.spectra.length} were read.`,
          );
        }
      }
      if (read.length > 0) actions.addSpectra(read);
      // After the spectra, which clear any error standing from before.
      if (problems.length > 0) actions.setError(problems.join(' '));
    },
    [actions, open],
  );

  return useMemo(() => ({ readFiles }), [readFiles]);
}

/**
 * Read one file, saying why when it cannot be.
 * @param file - The file.
 * @returns What it held, or the sentence its refusal came with.
 */
async function readFile(file: File): Promise<LoadMassSpectraResult | string> {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    return await loadMassSpectra(bytes, { fileName: file.name });
  } catch (error) {
    return errorMessage(error);
  }
}
