import { useCallback, useMemo } from 'react';

import { hasBindingAxis } from '../core/energyAxis.ts';
import { findSpectrum } from '../core/spectrumGroups.ts';
import { surveyLinesOf } from '../core/surveyElements.ts';
import { surveyLineRegions } from '../core/surveyLines.ts';
import { NO_HIGHLIGHT } from '../core/xpsHighlight.ts';
import type { XpsInstrument } from '../core/xpsInstrument.ts';
import { findInstrument } from '../core/xpsInstrument.ts';
import type { XpsDomain, XpsSpectrum } from '../core/xpsSpectrum.ts';

import { XpsChart } from './XpsChart.tsx';
import { XpsStatusBar } from './XpsStatusBar.tsx';
import type { XpsChartWindows } from './xpsChartProps.ts';
import { useLookAtEnergy, useXpsHighlight } from './xpsHighlightContext.ts';
import { useXpsActions, useXpsEditorState } from './xpsStateContext.ts';

export interface XpsCanvasProps {
  /**
   * The id of the box the chart is drawn in, which a picture of the chart is
   * taken from.
   * @default undefined
   */
  chartId?: string;
  /**
   * Whether a file is being dragged over the viewer.
   * @default false
   */
  isOver?: boolean;
  /**
   * Whether one is being read.
   * @default false
   */
  isReading?: boolean;
}

/**
 * The chart side of the split: the drawing, and the status bar under it.
 *
 * Everything about drawing an XPS spectrum lives in `XpsChart`, which holds
 * nothing and takes every answer as a prop. This is only the wiring — where the
 * spectra come from, where the window is kept, who is told what the pointer
 * found — which is what lets the same chart draw a report page or a test with no
 * editor anywhere near it.
 *
 * The empty chart says what to do with it rather than showing an axis from 0 to
 * 1 and leaving the question open: the two ways in are a file and a paste, and
 * neither is discoverable from a blank plot. The invitation goes as soon as
 * anything is open, since from then on the axes are the answer.
 * @param props - Component props.
 * @returns The canvas side of the split.
 */
export function XpsCanvas(props: XpsCanvasProps) {
  const { isOver = false, isReading = false, chartId } = props;
  const { state } = useXpsEditorState();
  const actions = useXpsActions();
  const highlight = useXpsHighlight();
  const lookAt = useLookAtEnergy();

  // The window a gesture asked for is view state, so it survives a colour edit
  // and a panel being opened; `null` is the chart saying "fit everything again",
  // which is the one sentence it has for a double click.
  const onDomainChange = useCallback(
    (domain: XpsDomain | null) => {
      if (domain === null) {
        actions.resetDomain();
        return;
      }
      actions.setDomain(domain);
    },
    [actions],
  );

  // A click on the axis is a question about the energy under it, and the way to
  // ask the whole viewer one is to light it up: the guide stands there and every
  // panel reads the same energy from the highlight.
  const onPickEnergy = useCallback(
    (bindingEnergy: number | null) => {
      lookAt(
        bindingEnergy === null
          ? NO_HIGHLIGHT
          : { ...NO_HIGHLIGHT, bindingEnergy },
      );
    },
    [lookAt],
  );

  const { settings, data, view } = state;
  const { spectra } = data;
  const { selectedId, openPanelIds, domain } = view;
  const { instruments, instrumentId } = settings;
  const quantifying = openPanelIds.includes('quantification');
  const windows = useMemo(
    () =>
      quantifying
        ? quantificationWindows(spectra, selectedId, instruments, instrumentId)
        : undefined,
    [quantifying, spectra, selectedId, instruments, instrumentId],
  );

  return (
    <div style={sideStyle}>
      <div id={chartId} style={chartStyle}>
        <XpsChart
          spectra={spectra}
          settings={settings}
          domain={domain}
          selectedId={selectedId}
          highlight={highlight}
          onDomainChange={onDomainChange}
          onHighlightChange={lookAt}
          onPickEnergy={onPickEnergy}
          onSelectSpectrum={actions.selectSpectrum}
          windows={windows}
          isOver={isOver}
          isReading={isReading}
        />
        {spectra.length === 0 && !isReading ? (
          <div style={inviteStyle}>
            <div style={inviteTitleStyle}>Drop a spectrum here</div>
            <div>
              Drop a VAMAS (.vms) file, or paste two columns of numbers —
              binding energy in eV, then counts.
            </div>
          </div>
        ) : null}
      </div>
      <XpsStatusBar isReading={isReading} />
    </div>
  );
}

// The chart and whatever it has to say, stacked: the pane is the whole height of
// the split, and the status bar takes what it needs off the bottom of it.
const sideStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minWidth: 0,
  minHeight: 0,
} as const;

const chartStyle = {
  position: 'relative',
  display: 'flex',
  flex: '1 1 1px',
  minWidth: 0,
  minHeight: 0,
} as const;

// Over the plot rather than instead of it: the axes are what the invitation is
// about, and a chart that appears only once a file has been read gives no clue
// where the file is going.
const inviteStyle = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  padding: 16,
  textAlign: 'center',
  pointerEvents: 'none',
  fontSize: 13,
  opacity: 0.65,
} as const;

const inviteTitleStyle = { fontSize: 15, fontWeight: 600 } as const;

/**
 * The windows the selected survey is quantified over, for the chart to shade
 * while the quantification panel is open.
 * @param spectra - Everything that is open.
 * @param selectedId - The spectrum the panels act on.
 * @param instruments - The reader's instruments.
 * @param instrumentId - The one in force.
 * @returns The windows, `undefined` when nothing is being quantified.
 */
function quantificationWindows(
  spectra: readonly XpsSpectrum[],
  selectedId: string | null,
  instruments: readonly XpsInstrument[],
  instrumentId: string,
): XpsChartWindows | undefined {
  const spectrum = findSpectrum(spectra, selectedId);
  if (spectrum === null || !hasBindingAxis(spectrum)) return undefined;
  const instrument = findInstrument(instruments, instrumentId);
  return {
    sourceEnergy: spectrum.sourceEnergy,
    regions: surveyLineRegions(surveyLinesOf(spectrum, spectra, instrument)),
  };
}
