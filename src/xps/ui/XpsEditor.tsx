import type { Dispatch, ReactNode, Ref } from 'react';
import { useMemo } from 'react';
import { RootLayout } from 'react-science/ui';

import type { XpsAction } from '../core/xpsAction.ts';
import type { XpsEditorHandle } from '../core/xpsEditorApi.ts';
import type { XpsPanelId } from '../core/xpsSidePanels.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';
import type { XpsState } from '../core/xpsState.ts';

import { XpsHighlightProvider } from './XpsHighlightProvider.tsx';
import { XpsShell } from './XpsShell.tsx';
import { XpsStateProvider } from './XpsStateProvider.tsx';
import { useXpsEditor } from './useXpsEditor.ts';
import type { XpsHostPanel } from './xpsHostPanels.ts';
import type { XpsStateHandle } from './xpsStateContext.ts';

export interface XpsEditorProps {
  /**
   * The spectra to open on. Read when the viewer opens and never again: what is
   * on the chart belongs to the viewer from then on, so a host re-rendering with
   * another array does not silently replace what somebody is looking at. The
   * `ref` handle and a drop are how spectra arrive afterwards.
   * @default []
   */
  data?: XpsSpectrum[];
  /**
   * Called whenever the spectra open change — one loaded, one closed, the chart
   * cleared — with the spectra now open.
   *
   * The document only. A zoom, a selection, a rename, a colour and every
   * workspace setting change what is being looked at rather than what is
   * loaded, and a host told about those would re-derive its composition on every
   * drag of the mouse. Never called when the host holds the state itself, since
   * it is then the one dispatching the change.
   * @default undefined
   */
  onChange?: (spectra: XpsSpectrum[]) => void;
  /**
   * The state, when the host holds it rather than the viewer — replaying a
   * session, undoing a step, writing the viewer out to a file and reading it
   * back. Supply it with `dispatch`, or neither: half of the pair is a viewer
   * that renders one state and dispatches into another.
   * @default undefined
   */
  state?: XpsState;
  /**
   * Where the viewer's actions go, when the host holds the state.
   * @default undefined
   */
  dispatch?: Dispatch<XpsAction>;
  /**
   * Whether a paste made anywhere on the page is taken as a spectrum, rather
   * than only one made while the viewer holds the caret. On by default because
   * a spectrum viewer is nearly always the whole page; turn it off for a page
   * showing two, where a paste has to go to the one that was clicked.
   * @default true
   */
  pasteFromPage?: boolean;
  /**
   * The side panels open to begin with: the viewer's own — `'spectra'`,
   * `'metadata'`, `'peaks'`, `'elements'`, `'components'`, `'composition'` — or
   * the id of one of `panels`. An id no panel answers to is ignored. Read when
   * the viewer opens, like `data`.
   * @default DEFAULT_SIDE_PANELS
   */
  defaultPanelIds?: readonly XpsPanelId[];
  /**
   * Panels the host adds to the viewer's own — a structure to predict a
   * spectrum from, a database to browse. Their icons come first on the rail,
   * in the order given, and each then behaves as a built-in panel does:
   * toggled on its own, stacked in the same column with a share of its height,
   * folded and closed from its header.
   * @default []
   */
  panels?: readonly XpsHostPanel[];
  /**
   * The host's own actions on what it keeps — open an example, save a
   * document — as `Toolbar.Item`s of `react-science/ui`, drawn in the header
   * after the viewer's mark.
   * @default undefined
   */
  actions?: ReactNode;
  /**
   * The handle a host drives the viewer through: take these spectra, frame this
   * energy, tell me what is open.
   * @default undefined
   */
  ref?: Ref<XpsEditorHandle>;
}

/**
 * An XPS viewer: a header across the top, the chart in the middle, the tools
 * down the left, and the panels that interrogate it down the right.
 *
 * The chart is where a spectrum is read and the panels are where it is
 * questioned, which is why the panels are switched on one at a time from the
 * activity bar on the far right: a spectrum is mostly chart, and each panel is
 * worth its width only while it is being used.
 *
 * It is sealed in the way NMRium is sealed: the spectra go in as `data` and come
 * back through `onChange`, and everything else a host wants — frame this line,
 * take these spectra — is a gesture on the `ref` rather than a prop that has to
 * change to be obeyed. A host that would rather hold the whole state hands in
 * `state` and `dispatch` instead, and drives it as a reducer.
 * @param props - Component props.
 * @returns The viewer.
 */
export function XpsEditor(props: XpsEditorProps) {
  const {
    data = NO_SPECTRA,
    onChange,
    state,
    dispatch,
    pasteFromPage = true,
    defaultPanelIds,
    panels = NO_PANELS,
    actions,
    ref,
  } = props;

  // Held whether or not the host drives the viewer, because a hook cannot be
  // called conditionally — and left holding an empty document when it does,
  // since nothing ever dispatches into it.
  const own = useXpsEditor({
    spectra: data,
    onChange,
    panelIds: defaultPanelIds,
  });

  const hosted = useMemo<XpsStateHandle | null>(
    () =>
      state === undefined || dispatch === undefined
        ? null
        : { state, dispatch },
    [state, dispatch],
  );

  return (
    <XpsStateProvider editor={hosted ?? own}>
      {/* Mounted here rather than left to whoever mounts the viewer, so one
          standing alone needs nothing around it. */}
      <XpsHighlightProvider>
        {/* `react-science`'s own root, as the infrared and mass viewers mount
            it: it holds the element the browser is asked to show full screen,
            points Blueprint's portals at that element so dialogs and tooltips
            are not left behind in `document.body`, and paints the backdrop
            white. Above the shell rather than inside it, so the shell can ask
            whether it is full screen and offer the way back out of it. */}
        <RootLayout style={rootLayoutStyle}>
          <XpsShell
            pasteFromPage={pasteFromPage}
            handle={ref}
            panels={panels}
            actions={actions}
          />
        </RootLayout>
      </XpsHighlightProvider>
    </XpsStateProvider>
  );
}

/**
 * The viewer fills what it is given, and its own children scroll rather than
 * push: `react-science` lays its root out as a column of full width and height,
 * and a flex column with no `minHeight` grows past its parent instead.
 */
const rootLayoutStyle = { minHeight: 0 } as const;

/** What a viewer opens on when it is handed nothing, kept stable for the memo. */
const NO_SPECTRA: XpsSpectrum[] = [];

/** What a stack the host adds nothing to holds, kept stable for the memo. */
const NO_PANELS: readonly XpsHostPanel[] = [];
