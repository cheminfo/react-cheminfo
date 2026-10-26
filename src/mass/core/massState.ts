/**
 * Everything the viewer knows, in the three buckets NMRium splits its own into
 * — the same three the infrared viewer holds, under the same names.
 *
 * The split is the persistence boundary as much as anything: `data` is the
 * document, `view` is where you are in it and lasts as long as the session, and
 * `settings` is the workspace, which is how every spectrum is drawn whichever
 * ones happen to be open.
 *
 * The peaks are in `data`, each spectrum carrying its own centroid: picked once,
 * when the spectrum was read, so nothing about drawing it ever picks again.
 */

import type { MassPanelId, MassSidePanelId } from './massSidePanels.ts';
import type { MassDomain, MassSpectrum } from './massSpectrum.ts';
import type { MzDecimalsSetting } from './mzDecimalsSetting.ts';
import { readMzDecimalsSetting } from './mzDecimalsSetting.ts';

/** The document: what the files held. */
export interface MassData {
  /** The spectra, in the order they were loaded. */
  spectra: MassSpectrum[];
}

/** What a drag across the chart is for while it is chosen. */
export type MassTool = 'read' | 'box';

/** Where you are in the viewer. */
export interface MassView {
  /** Identity of the spectrum the panels act on, `null` for none. */
  selectedId: string | null;
  /**
   * The window being shown, `null` while the chart is showing what fits.
   *
   * Held here so that a toolbar button and a row of the peak table can zoom —
   * the chart is told a window and reports every window it arrives at, and this
   * is where the answer lives between the two.
   */
  domain: MassDomain | null;
  /** Which tool a drag across the chart is running. */
  tool: MassTool;
  /**
   * The side panels that are open: the viewer's own and any a host added. An id
   * no panel on offer answers to opens nothing.
   */
  openPanelIds: MassPanelId[];
  /** Why the last action was refused, `null` as soon as one succeeds. */
  error: string | null;
}

/** The workspace: how every spectrum is drawn, whichever ones are open. */
export interface MassSettings {
  /** Whether the peaks of the selected spectrum are labelled on the chart. */
  showLabels: boolean;
  /** At most how many peaks are labelled at once. */
  labelLimit: number;
  /** Whether a label writes the charge of a peak whose charge was established. */
  showCharges: boolean;
  /**
   * How many decimals the masses on screen are written with: `'auto'` for what
   * the spectra resolve — high-resolution masses or nominal ones — or the
   * number the reader chose.
   */
  mzDecimals: MzDecimalsSetting;
}

/** Everything the viewer knows. */
export interface MassState {
  /** The spectra that are open. */
  data: MassData;
  /** Where you are in the viewer. */
  view: MassView;
  /** How spectra are drawn. */
  settings: MassSettings;
}

/** Part of a state, as a host restoring one supplies it. */
export interface PartialMassState {
  /** The spectra that were open. */
  data?: MassData;
  /** Where the viewer was left. */
  view?: Partial<MassView>;
  /** The workspace they were drawn in. */
  settings?: Partial<MassSettings>;
}

/** The panel the splitter brings back when it is dragged open on nothing. */
export const DEFAULT_SIDE_PANEL: MassSidePanelId = 'spectra';

/**
 * The panels a fresh viewer opens with: the list, and the peaks of whichever
 * spectrum is selected in it, because a spectrum is read through its peaks.
 */
export const DEFAULT_SIDE_PANELS: MassSidePanelId[] = ['spectra', 'peaks'];

/** How many peaks are labelled to begin with. */
export const DEFAULT_LABEL_LIMIT = 20;

/** At most how many peaks a setting may ask to have labelled. */
export const MAXIMUM_LABEL_LIMIT = 500;

/** The workspace a fresh viewer starts from. */
export const DEFAULT_SETTINGS: MassSettings = {
  showLabels: true,
  labelLimit: DEFAULT_LABEL_LIMIT,
  showCharges: true,
  mzDecimals: 'auto',
};

/** What a viewer opens on. */
export interface CreateMassStateOptions {
  /**
   * The spectra to open on.
   * @default []
   */
  spectra?: MassSpectrum[];
  /**
   * The workspace to open in.
   * @default DEFAULT_SETTINGS
   */
  settings?: Partial<MassSettings>;
  /**
   * The panels open to begin with, the viewer's own or a host's.
   * @default DEFAULT_SIDE_PANELS
   */
  panelIds?: readonly MassPanelId[];
}

/**
 * The state a viewer opens with.
 *
 * The panel list is spread rather than stored by reference: a caller's array is
 * the caller's to mutate, and a viewer holding it would find its open panels
 * changing under it.
 * @param options - What it opens on.
 * @returns The state.
 */
export function createMassState(
  options: CreateMassStateOptions = {},
): MassState {
  const { spectra = [], settings, panelIds } = options;
  return {
    data: { spectra: [...spectra] },
    view: {
      selectedId: spectra[0]?.id ?? null,
      domain: null,
      tool: 'read',
      openPanelIds: [...(panelIds ?? DEFAULT_SIDE_PANELS)],
      error: null,
    },
    settings: mergeMassSettings(DEFAULT_SETTINGS, settings),
  };
}

/**
 * Fold a change into the workspace, refusing what no chart survives.
 *
 * A number typed into a field arrives here as `NaN` for every keystroke that is
 * not yet a number — a lone minus sign, an empty box — and a limit of `NaN`
 * silently stops every label being drawn. So the limit is checked, and the
 * current value kept where the new one is unusable rather than the field being
 * fought with while it is being typed in. The decimals are read back the same
 * way, through `readMzDecimalsSetting`, since a stored workspace is no more to
 * be trusted than a half-typed field.
 * @param current - The workspace in force.
 * @param change - What to change about it.
 * @returns The new workspace.
 */
export function mergeMassSettings(
  current: MassSettings,
  change: Partial<MassSettings> = {},
): MassSettings {
  const asked = change.labelLimit ?? current.labelLimit;
  return {
    ...current,
    ...change,
    labelLimit: Number.isFinite(asked)
      ? Math.min(MAXIMUM_LABEL_LIMIT, Math.max(0, Math.round(asked)))
      : current.labelLimit,
    mzDecimals: readMzDecimalsSetting(change.mzDecimals) ?? current.mzDecimals,
  };
}

/**
 * Whether a window is one a chart can be built on.
 *
 * Both ends finite and the low one below the high one. A window failing either
 * makes every scale built from it infinite, which the DOM refuses outright — so
 * a handle told to frame a peak it worked out wrongly leaves the chart alone
 * instead of blanking it.
 * @param domain - The window to check.
 * @returns Whether it can be shown.
 */
export function isMassWindow(domain: MassDomain): boolean {
  return isWindow(domain.x) && isWindow(domain.y);
}

/**
 * Whether one axis of a window runs from somewhere to somewhere else.
 * @param bounds - `[from, to]` on that axis.
 * @returns Whether it is usable.
 */
function isWindow(bounds: readonly [number, number]): boolean {
  const [from, to] = bounds;
  return Number.isFinite(from) && Number.isFinite(to) && from < to;
}
