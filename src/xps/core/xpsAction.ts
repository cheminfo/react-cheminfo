/**
 * Everything the viewer can be asked to do, one action type per bucket of the
 * state it changes.
 *
 * Every action that names a spectrum names it by its `id`. A VAMAS file of one
 * experiment opens every sample and every transition it holds at once, and the
 * list of them is read by sample first, so a position in that list means
 * something different as soon as another file is dropped or a spectrum is
 * closed — an index-based action recolours, renames or closes whichever
 * spectrum has since taken that place.
 */

import type { XpsPanelId } from './xpsSidePanels.ts';
import type { XpsDomain, XpsPeak, XpsSpectrum } from './xpsSpectrum.ts';
import type { PartialXpsState, XpsSettings } from './xpsState.ts';

/** An action that changes which spectra are open, or how one of them reads. */
export type XpsDataAction =
  /**
   * Open spectra, keeping the ones already open.
   *
   * A list rather than one spectrum at a time, because a file gives many at
   * once: one VAMAS block is one spectrum, so six samples measured over eight
   * transitions arrive as a single action rather than as forty-eight of them,
   * each reporting the document as changed.
   */
  | { type: 'addSpectra'; spectra: XpsSpectrum[] }
  /** Close a spectrum. */
  | { type: 'removeSpectrum'; id: string }
  /** Give a spectrum another name, which is never its identity. */
  | { type: 'renameSpectrum'; id: string; name: string }
  /** Draw a spectrum in another colour. */
  | { type: 'setSpectrumColor'; id: string; color: string }
  /** Draw a spectrum, or stop drawing it. */
  | { type: 'setSpectrumVisibility'; id: string; visible: boolean }
  /**
   * Draw one spectrum and no other.
   *
   * The gesture a file of forty-eight blocks is actually read with: the survey
   * scan of one sample is looked at on its own, and hiding the other
   * forty-seven one at a time is not something anybody does twice.
   */
  | { type: 'showOnly'; id: string }
  /** Draw every spectrum that is open, undoing a `showOnly`. */
  | { type: 'showEvery' }
  /**
   * Replace the maxima found in a spectrum.
   *
   * The detection is run again whenever what it is asked for changes, and its
   * answer is stored on the spectrum rather than worked out again per view, so
   * the peak table and the labels on the chart are never showing two different
   * pickings of the same trace.
   */
  | { type: 'setSpectrumPeaks'; id: string; peaks: XpsPeak[] }
  /** Close every spectrum and start again from an empty chart. */
  | { type: 'clear' };

/**
 * An action that changes what is looked at rather than which spectra are open.
 *
 * None of them reaches `data`, so none of them tells a consumer the document
 * changed: a zoom is not an edit.
 */
export type XpsViewAction =
  /** Select the spectrum the panels act on, or nothing. */
  | { type: 'selectSpectrum'; id: string | null }
  /** Show a window of the chart, instead of letting it fit what is drawn. */
  | { type: 'setDomain'; domain: XpsDomain }
  /** Give the window back to the chart, which is what "zoom to fit" asks for. */
  | { type: 'resetDomain' }
  /**
   * Stretch the counts axis about its baseline, leaving the energy axis alone.
   *
   * The gesture a survey scan needs: the O 1s line and the Si 2p line of the
   * same sample are four decades apart, so the small one is invisible at the
   * window that fits the large one, and reading it means pulling the top of
   * the counts axis down rather than choosing new bounds by hand.
   */
  | {
      type: 'zoomY';
      /**
       * How much taller the trace is drawn: above one magnifies, below one
       * pulls back. The window keeps its lower bound and its span is divided
       * by this, so the baseline stays where it is.
       */
      factor: number;
      /**
       * The window to stretch while the state holds none, which is what the
       * chart is showing when it is still fitting what is drawn. Only the
       * chart knows that window, so it comes in with the gesture.
       * @default undefined
       */
      from?: XpsDomain;
    }
  /** Open a side panel that is closed, close one that is open. */
  | { type: 'togglePanel'; panelId: XpsPanelId }
  /**
   * Say why something outside the reducer was refused — a file that could not
   * be read, a peak detection that found nothing — so a failure reaches the
   * user the same way a refused action does, and is cleared by the same next
   * success.
   */
  | { type: 'setError'; error: string | null };

/** An action that changes the workspace, which outlives the spectra open. */
export interface XpsSettingsAction {
  type: 'setSettings';
  /** The settings that change; the ones left out are kept. */
  settings: Partial<XpsSettings>;
}

/**
 * Open a state that was written out, in place of the one held.
 *
 * Everything the file leaves out comes back as the viewer's default rather
 * than as what stood, because this is opening a document and not merging one.
 */
export interface XpsLoadAction {
  type: 'loadState';
  /** What the file held, every bucket of it optional. */
  state: PartialXpsState;
}

/** Something the viewer is asked to do. */
export type XpsAction =
  XpsDataAction | XpsViewAction | XpsSettingsAction | XpsLoadAction;
