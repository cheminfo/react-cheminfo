/**
 * Everything the viewer knows, in the three buckets NMRium splits its own into
 * — the same three the mass viewer holds, under the same names.
 *
 * The split is the persistence boundary as much as anything: `data` is the
 * document, `view` is where you are in it and lasts as long as the session, and
 * `settings` is the workspace, which is how every spectrum is drawn whichever
 * ones happen to be open.
 *
 * The bands are in `data`, each spectrum carrying its own: picked when it
 * arrives, picked again by the reducer when the settings change while they were
 * found automatically, and left alone once picked by hand. That is what lets a
 * band be added or taken away, and a list be handed to a host and back.
 */

import type { IrPanelId, IrSidePanelId } from './irSidePanels.ts';
import type { IrDomain, IrMode, IrSpectrum } from './irSpectrum.ts';
import type { IrTechnique } from './irTechnique.ts';
import { defaultIrMode, irModeFor, offersIrMode } from './irTechnique.ts';
import type { PickBandsOptions } from './pickBands.ts';
import { withBands } from './spectrumBands.ts';

/** The document: what a file holds. */
export interface IrData {
  /** The spectra, in the order they were loaded. */
  spectra: IrSpectrum[];
}

/**
 * What a drag across the chart is for while it is chosen, and for `pick`, what
 * a click is: a band added where it lands, or taken away.
 */
export type IrTool = 'read' | 'box' | 'pick';

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
  /**
   * The side panels that are open: the viewer's own and any a host added. An id
   * no panel on offer answers to opens nothing.
   */
  openPanelIds: IrPanelId[];
  /** Why the last action was refused, `null` as soon as one succeeds. */
  error: string | null;
}

/** The workspace: how every spectrum is drawn, whichever ones are open. */
export interface IrSettings {
  /**
   * What the spectra were measured with. Chosen when the viewer opens and fixed
   * from then on: a change asking for another is ignored.
   */
  technique: IrTechnique;
  /** Which value axis the spectra are read in, always one the technique offers. */
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
  technique: 'infrared',
  mode: 'transmittance',
  pickBands: true,
  picking: DEFAULT_PICKING,
  showAssignments: false,
  labelLimit: DEFAULT_LABEL_LIMIT,
  assignmentTolerance: 5,
};

/** What a viewer opens on. */
export interface CreateIrStateOptions {
  /**
   * The spectra to open on.
   * @default []
   */
  spectra?: IrSpectrum[];
  /**
   * The workspace to open in. Its `technique` is fixed for the life of the
   * viewer, and its `mode` falls back to the technique's first when the
   * technique does not offer it.
   * @default DEFAULT_SETTINGS
   */
  settings?: Partial<IrSettings>;
  /**
   * The panels open to begin with, the viewer's own or a host's.
   * @default DEFAULT_SIDE_PANELS
   */
  panelIds?: readonly IrPanelId[];
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
export function createIrState(options: CreateIrStateOptions = {}): IrState {
  const { spectra = [], settings, panelIds } = options;
  const technique = settings?.technique ?? DEFAULT_SETTINGS.technique;
  const opened: IrSettings = {
    ...DEFAULT_SETTINGS,
    technique,
    mode: defaultIrMode(technique),
  };
  const merged = mergeIrSettings(opened, settings);
  return {
    data: {
      spectra: spectra.map((spectrum) => withBands(spectrum, merged.picking)),
    },
    view: {
      selectedId: spectra[0]?.id ?? null,
      domain: null,
      tool: 'read',
      openPanelIds: [...(panelIds ?? DEFAULT_SIDE_PANELS)],
      error: null,
    },
    settings: merged,
  };
}

/**
 * Fold a change into the workspace, refusing what no chart survives.
 *
 * A number typed into a field arrives here as `NaN` for every keystroke that is
 * not yet a number — a lone minus sign, an empty box — and a limit of `NaN`
 * silently stops every label being drawn. So each is checked, and the current
 * value is kept where the new one is unusable rather than the field being
 * fought with while it is being typed in. The technique is never changed, and a
 * mode it does not offer is refused the same way: a Raman spectrum has no
 * absorbance to draw.
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
    technique: current.technique,
    mode: offersIrMode(current.technique, change.mode)
      ? change.mode
      : irModeFor(current.technique, current.mode),
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
