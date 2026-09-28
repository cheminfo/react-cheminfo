/**
 * Everything the viewer knows, in the three buckets NMRium splits its own into
 * — the same three the mass viewer holds, under the same names.
 *
 * The split is the persistence boundary as much as anything: `data` is the
 * document, `view` is where you are in it and lasts as long as the session, and
 * `settings` is the workspace, which is how every spectrum is drawn whichever
 * ones happen to be open.
 *
 * The bands are **not** in here. They are derived from the spectra and the
 * picking settings, so holding them would mean holding an answer that has to be
 * kept in step with its own inputs — `useIrEditor` recomputes them instead, and
 * a stale band is then impossible rather than merely unlikely.
 */

import type { IrSidePanelId } from './irSidePanels.ts';
import type { IrDomain, IrMode, IrSpectrum } from './irSpectrum.ts';
import type { PickBandsOptions } from './pickBands.ts';

/** The document: what a file holds. */
export interface IrData {
  /** The spectra, in the order they were loaded. */
  spectra: IrSpectrum[];
}

/** What a drag across the chart is for while it is chosen. */
export type IrTool = 'read' | 'box';

/** Where you are in the viewer. */
export interface IrView {
  /** Identity of the spectrum the panels act on, `null` for none. */
  selectedId: string | null;
  /**
   * The window being shown, `null` while the chart is showing what fits.
   *
   * Held here so that a toolbar button can zoom — the chart is told a window and
   * reports every window it arrives at, and this is where the answer lives
   * between the two.
   */
  domain: IrDomain | null;
  /** Which tool a drag across the chart is running. */
  tool: IrTool;
  /** The side panels that are open, in the order their icons are stacked. */
  openPanelIds: IrSidePanelId[];
  /** Why the last action was refused, `null` as soon as one succeeds. */
  error: string | null;
}

/** The workspace: how every spectrum is drawn, whichever ones are open. */
export interface IrSettings {
  /** Which value axis the spectra are read in. */
  mode: IrMode;
  /** Whether the bands are picked at all. */
  pickBands: boolean;
  /** How the bands are picked when they are. */
  picking: PickBandsOptions;
  /** Whether a band's label names its assignment as well as its wavenumber. */
  showAssignments: boolean;
  /** At most how many bands are labelled on the chart. */
  labelLimit: number;
  /** How far outside a table range a band may fall and still be offered it. */
  assignmentTolerance: number;
}

/** Everything the viewer knows. */
export interface IrState {
  /** The spectra that are open. */
  data: IrData;
  /** Where you are in the viewer. */
  view: IrView;
  /** How spectra are drawn and read. */
  settings: IrSettings;
}

/** Part of a state, as a host restoring one supplies it. */
export interface PartialIrState {
  /** The spectra that were open. */
  data?: IrData;
  /** Where the viewer was left. */
  view?: Partial<IrView>;
  /** The workspace they were drawn in. */
  settings?: Partial<IrSettings>;
}

/** The panel the splitter brings back when it is dragged open on nothing. */
export const DEFAULT_SIDE_PANEL: IrSidePanelId = 'spectra';

/**
 * The panels a fresh viewer opens with.
 *
 * The band table, because it is the reason to open an infrared spectrum at all
 * — a trace on its own can be looked at, and it is the table beside it that lets
 * it be read.
 */
export const DEFAULT_SIDE_PANELS: IrSidePanelId[] = ['spectra', 'bands'];

/** At most how many bands a gesture may ask to have labelled. */
export const MAXIMUM_LABEL_LIMIT = 200;

/** How many are labelled to begin with. */
export const DEFAULT_LABEL_LIMIT = 12;

/** How the bands are picked before anybody adjusts it. */
export const DEFAULT_PICKING: PickBandsOptions = {
  minRelativeHeight: 0.02,
  minPeakWidth: 4,
};

/** The workspace a fresh viewer starts from. */
export const DEFAULT_SETTINGS: IrSettings = {
  mode: 'transmittance',
  pickBands: true,
  picking: DEFAULT_PICKING,
  showAssignments: false,
  labelLimit: DEFAULT_LABEL_LIMIT,
  assignmentTolerance: 5,
};

/**
 * Fold a change into the workspace, refusing what no chart survives.
 *
 * A number typed into a field arrives here as `NaN` for every keystroke that is
 * not yet a number — a lone minus sign, an empty box — and a limit of `NaN`
 * silently stops every label being drawn. So each is checked, and the current
 * value is kept where the new one is unusable rather than the field being
 * fought with while it is being typed in.
 * @param current - The workspace in force.
 * @param change - What to change about it.
 * @returns The new workspace.
 */
export function mergeIrSettings(
  current: IrSettings,
  change: Partial<IrSettings> = {},
): IrSettings {
  const asked = change.labelLimit ?? current.labelLimit;
  const tolerance = change.assignmentTolerance ?? current.assignmentTolerance;
  return {
    ...current,
    ...change,
    picking: { ...current.picking, ...change.picking },
    labelLimit: Number.isFinite(asked)
      ? Math.min(MAXIMUM_LABEL_LIMIT, Math.max(0, Math.round(asked)))
      : current.labelLimit,
    assignmentTolerance:
      Number.isFinite(tolerance) && tolerance >= 0
        ? tolerance
        : current.assignmentTolerance,
  };
}

/**
 * Whether a window is one a chart can be built on.
 *
 * Both ends finite and the low one below the high one. A window failing either
 * makes every scale built from it infinite, which the DOM refuses outright — so
 * a handle told to frame a band it worked out wrongly leaves the chart alone
 * instead of blanking it.
 * @param domain - The window to check.
 * @returns Whether it can be shown.
 */
export function isIrWindow(domain: IrDomain): boolean {
  return isWindow(domain.x) && isWindow(domain.y);
}

/**
 * Whether one axis of a window runs from somewhere to somewhere else.
 * @param bounds - `[from, to]` on that axis.
 * @returns Whether it is usable.
 */
function isWindow(bounds: [number, number]): boolean {
  const [from, to] = bounds;
  return Number.isFinite(from) && Number.isFinite(to) && from < to;
}
