import { useCallback } from 'react';

import type { IrBand } from '../core/irBand.ts';
import type { IrDomain } from '../core/irSpectrum.ts';

import { IrChart } from './IrChart.tsx';
import { IrStatusBar } from './IrStatusBar.tsx';
import { useIrActions, useIrEditorState } from './irStateContext.ts';

export interface IrCanvasProps {
  /**
   * The band the pointer is resting on, wherever it was hovered — the chart or
   * the band table.
   * @default null
   */
  highlight?: IrBand | null;
  /**
   * Told which band the pointer has come to rest on.
   * @default undefined
   */
  onHighlight?: (band: IrBand | null) => void;
  /**
   * Put on the box the chart is drawn in, so a picture can be taken of it. The
   * box rather than the chart itself, because the chart is laid out again on
   * every resize.
   * @default undefined
   */
  attachChart?: (element: HTMLDivElement | null) => void;
  /**
   * The `id` put on the box the chart is drawn in, which the "Save figure"
   * panel is pointed at.
   * @default undefined
   */
  chartId?: string;
}

/**
 * The chart, and the status bar under it.
 *
 * This is where the state meets the drawing: the chart holds nothing, so
 * everything it draws is read out of the state here and every gesture it reports
 * is written back. The window in particular goes **both** ways — the chart is
 * told what to show and reports what it arrives at — which is what lets a toolbar
 * button and a drag both move it.
 *
 * The status bar is inside the canvas rather than under the whole shell, so it
 * stops at the splitter: what is open on the right belongs to the chart, and a
 * bar running under the panels as well would read as belonging to the page.
 * @param props - Component props.
 * @returns The canvas.
 */
export function IrCanvas(props: IrCanvasProps) {
  const { highlight = null, onHighlight, attachChart, chartId } = props;
  const { state, visibleSpectra, assigned } = useIrEditorState();
  const actions = useIrActions();
  const { domain, tool, selectedId } = state.view;
  const { mode, showAssignments, labelLimit } = state.settings;

  const onDomainChange = useCallback(
    (next: IrDomain) => {
      actions.setDomain(next);
    },
    [actions],
  );

  return (
    <div style={rootStyle}>
      <div ref={attachChart} id={chartId} style={chartStyle}>
        <IrChart
          spectra={visibleSpectra}
          mode={mode}
          assigned={assigned}
          showAssignments={showAssignments}
          labelLimit={labelLimit}
          highlight={highlight}
          onHighlight={onHighlight}
          domain={domain}
          onDomainChange={onDomainChange}
          drag={tool === 'box' ? 'box' : 'xAxis'}
          emphasisedId={selectedId}
        />
      </div>
      <IrStatusBar />
    </div>
  );
}

const rootStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1 1px',
  minWidth: 0,
  minHeight: 0,
} as const;

/** The chart takes what the status bar does not. */
const chartStyle = { flex: '1 1 1px', minHeight: 0 } as const;
