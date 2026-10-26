import type { DragEvent } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { MassPlotClick } from '../core/massEditorApi.ts';
import type { MassDomain } from '../core/massSpectrum.ts';
import type { NearestPeak } from '../core/nearestPeak.ts';

import { MassChart } from './MassChart.tsx';
import { MassStatusBar } from './MassStatusBar.tsx';
import { useMassActions, useMassEditorState } from './massStateContext.ts';

export interface MassCanvasProps {
  /**
   * The m/z of the peak the pointer is resting on, wherever it was hovered —
   * the chart or the peak table.
   * @default null
   */
  highlightMz?: number | null;
  /**
   * Told which peak the pointer has come to rest on over the chart.
   * @default undefined
   */
  onHighlight?: (mz: number | null) => void;
  /**
   * The `id` put on the box the chart is drawn in, which the "Save figure"
   * panel is pointed at.
   * @default undefined
   */
  chartId?: string;
  /**
   * Told of a click on the plot, with the spectrum selected at that moment.
   * @default undefined
   */
  onPlotClick?: (click: MassPlotClick) => void;
  /**
   * Read files dropped on the chart.
   * @default undefined — a drop is left to the page
   */
  onDropFiles?: (files: File[]) => void;
}

/**
 * The chart, and the status bar under it.
 *
 * This is where the state meets the drawing: the chart holds nothing, so
 * everything it draws is read out of the state here and every gesture it reports
 * is written back. The window in particular goes **both** ways — the chart is
 * told what to show and reports what it arrives at — which is what lets a toolbar
 * button, a row of the peak table and a drag all move it.
 *
 * The chart is also where files are dropped, because that is where a chemist
 * expects the spectrum to land; the box is outlined while one is held over it.
 * @param props - Component props.
 * @returns The canvas.
 */
export function MassCanvas(props: MassCanvasProps) {
  const {
    highlightMz = null,
    onHighlight,
    chartId,
    onPlotClick,
    onDropFiles,
  } = props;
  const { state, visibleSpectra } = useMassEditorState();
  const actions = useMassActions();
  const { domain, tool, selectedId } = state.view;
  const { showLabels, labelLimit, showCharges, mzDecimals } = state.settings;
  const [isDropping, setIsDropping] = useState(false);

  const onDomainChange = useCallback(
    (next: MassDomain) => actions.setDomain(next),
    [actions],
  );

  const onPeakHover = useMemo(
    () =>
      onHighlight === undefined
        ? undefined
        : (peak: NearestPeak | null) => onHighlight(peak?.mz ?? null),
    [onHighlight],
  );

  // Which spectrum was selected is the viewer's to say, not the chart's: the
  // chart only knows where the press landed.
  const onClick = useMemo(
    () =>
      onPlotClick === undefined
        ? undefined
        : (mz: number, peak: NearestPeak | null) =>
            onPlotClick({
              mz,
              peakMz: peak?.mz ?? null,
              spectrumId: selectedId,
            }),
    [onPlotClick, selectedId],
  );

  const drop =
    onDropFiles === undefined
      ? {}
      : {
          onDragOver: (event: DragEvent<HTMLDivElement>) => {
            if (!event.dataTransfer.types.includes('Files')) return;
            // Without this the browser opens the file in place of the page.
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            if (!isDropping) setIsDropping(true);
          },
          onDragLeave: () => setIsDropping(false),
          onDrop: (event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setIsDropping(false);
            const files = [...event.dataTransfer.files];
            if (files.length > 0) onDropFiles(files);
          },
        };

  return (
    <div style={rootStyle}>
      <div
        id={chartId}
        style={isDropping ? droppingChartStyle : chartStyle}
        {...drop}
      >
        <MassChart
          spectra={visibleSpectra}
          labelledId={selectedId}
          showLabels={showLabels}
          labelLimit={labelLimit}
          showCharges={showCharges}
          // A number chosen holds for every mass on the chart; left to the
          // spectra, the chart decides per spectrum, labels and crosshair alike.
          {...(mzDecimals === 'auto' ? {} : { mzDecimals })}
          highlightMz={highlightMz}
          domain={domain}
          onDomainChange={onDomainChange}
          drag={tool === 'box' ? 'box' : 'xAxis'}
          // The shell runs `f` through its command table, where it is listed.
          answersKeys={false}
          emphasisedId={visibleSpectra.length > 1 ? selectedId : null}
          {...(onPeakHover === undefined ? {} : { onPeakHover })}
          {...(onClick === undefined ? {} : { onPlotClick: onClick })}
        />
      </div>
      <MassStatusBar />
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
const chartStyle = {
  flex: '1 1 1px',
  minHeight: 0,
  outline: '2px dashed transparent',
  outlineOffset: -4,
} as const;

/** The same box while a file is held over it, saying where it will land. */
const droppingChartStyle = {
  ...chartStyle,
  outlineColor: 'var(--accent, currentColor)',
} as const;
