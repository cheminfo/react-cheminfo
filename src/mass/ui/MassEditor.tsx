import type { Ref } from 'react';
import { RootLayout } from 'react-science/ui';

import type { MassEditorHandle, MassPlotClick } from '../core/massEditorApi.ts';
import type { MassPanelId } from '../core/massSidePanels.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import type { MassSettings } from '../core/massState.ts';

import { MassShell } from './MassShell.tsx';
import { MassStateProvider } from './MassStateProvider.tsx';
import type { MassHostPanel } from './massHostPanels.ts';
import { useMassEditor } from './useMassEditor.ts';

export interface MassEditorProps {
  /**
   * The spectra to open on. Read when the viewer opens and never again: what is
   * on the chart belongs to the viewer from then on, so a host re-rendering with
   * another array does not silently replace what somebody is looking at. The
   * `ref` handle is how spectra arrive afterwards.
   * @default []
   */
  data?: MassSpectrum[];
  /**
   * Called whenever the spectra open change — one loaded, one closed, the chart
   * cleared — with the spectra now open.
   *
   * The document only. A zoom, a selection, a rename and a colour change what is
   * being looked at rather than what is loaded, and a host told about those
   * would be told on every drag of the mouse.
   * @default undefined
   */
  onChange?: (spectra: MassSpectrum[]) => void;
  /**
   * How the spectra are drawn to begin with: whether the peaks are labelled,
   * how many, and whether their charges are written.
   * @default DEFAULT_SETTINGS
   */
  settings?: Partial<MassSettings>;
  /**
   * The side panels open to begin with: the viewer's own — `'spectra'`,
   * `'peaks'`, `'metadata'` — or the id of one of `panels`. An id no panel
   * answers to is ignored.
   * @default DEFAULT_SIDE_PANELS
   */
  defaultPanelIds?: readonly MassPanelId[];
  /**
   * Panels the host adds to the viewer's own — a formula to predict an isotopic
   * pattern from, say. Their icons come first in the activity bar, in the order
   * given, and each then behaves as a built-in panel does.
   * @default []
   */
  panels?: readonly MassHostPanel[];
  /**
   * The plot was clicked (a press that did not travel, so not a zoom drag), with
   * the m/z it landed at, the picked peak within reach and the spectrum selected
   * at that moment.
   * @default undefined
   */
  onPlotClick?: (click: MassPlotClick) => void;
  /**
   * The handle a host drives the viewer through: take these spectra, read
   * these files, frame this mass, select that one.
   * @default undefined
   */
  ref?: Ref<MassEditorHandle>;
}

/**
 * A mass spectrum viewer: a header across the top, the chart in the middle, the
 * tools down the left, and the panels that interrogate it down the right.
 *
 * The same shape as the infrared viewer, deliberately — a page may well hold
 * both, and a chemist who has learned one should not have to learn the other.
 * Files are dropped on the chart or opened from the toolbar: JCAMP-DX and two
 * columns of text. A profile is peak picked as it is read, every spectrum is
 * judged high or low resolution, and the peaks of the selected one are labelled
 * as the chart is zoomed.
 *
 * It is sealed the way NMRium is sealed: the spectra go in as `data` and come
 * back through `onChange`, and everything else a host wants is a gesture on the
 * `ref` rather than a prop that has to change to be obeyed.
 * @param props - Component props.
 * @returns The viewer.
 */
export function MassEditor(props: MassEditorProps) {
  const {
    data = NO_SPECTRA,
    onChange,
    settings,
    defaultPanelIds,
    panels = NO_PANELS,
    onPlotClick,
    ref,
  } = props;

  const editor = useMassEditor({
    spectra: data,
    ...(settings === undefined ? {} : { settings }),
    ...(defaultPanelIds === undefined ? {} : { panelIds: defaultPanelIds }),
    ...(onChange === undefined ? {} : { onChange }),
  });

  return (
    <MassStateProvider editor={editor}>
      {/* `react-science`'s own root: it holds the element the browser is asked
          to show full screen, points Blueprint's portals at that element so
          dialogs and tooltips are not left behind in `document.body`, and paints
          the backdrop white. */}
      <RootLayout style={rootLayoutStyle}>
        <MassShell
          handle={ref}
          panels={panels}
          {...(onPlotClick === undefined ? {} : { onPlotClick })}
        />
      </RootLayout>
    </MassStateProvider>
  );
}

/**
 * The viewer fills what it is given, and its own children scroll rather than
 * push: a flex column with no `minHeight` grows past its parent instead.
 */
const rootLayoutStyle = { minHeight: 0 } as const;

/** What a viewer opens on when it is handed nothing, kept stable for the memo. */
const NO_SPECTRA: MassSpectrum[] = [];

/** What a viewer the host adds no panel to offers, kept stable for the memo. */
const NO_PANELS: readonly MassHostPanel[] = [];
