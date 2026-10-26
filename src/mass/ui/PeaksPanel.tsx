import { useCallback, useMemo, useState } from 'react';
import { SelectedTotal, Toolbar } from 'react-science/ui';

import { useCopyToClipboard } from '../../clipboard/ui/useCopyToClipboard.ts';
import {
  panelBodyStyle,
  panelEmptyStyle,
  panelStyle,
  panelToolbarCountStyle,
  panelToolbarStyle,
} from '../../panel/core/panelStyles.ts';
import { mzFrame } from '../core/massDomain.ts';
import {
  PEAK_TABLE_LIMIT,
  PEAK_TABLE_THRESHOLD,
  peakTableRows,
  peakTableToTsv,
} from '../core/peakTable.ts';

import { MzDecimalsMenu } from './MzDecimalsMenu.tsx';
import type { PeakSortKey } from './PeakTable.tsx';
import { PeakTable } from './PeakTable.tsx';
import { useMassCommandProps } from './massCommandContext.tsx';
import { useMassActions, useMassEditorState } from './massStateContext.ts';

export interface PeaksPanelProps {
  /**
   * The m/z of the peak the pointer is resting on, wherever it was hovered.
   * @default null
   */
  highlightMz?: number | null;
  /**
   * Told which peak a row the pointer rests on is, `null` when it leaves.
   * @default undefined
   */
  onHighlight?: (mz: number | null) => void;
}

/**
 * What is actually in the selected spectrum, peak by peak.
 *
 * The centroid rather than the profile, because the centroid is what every
 * number downstream is computed from — a profile lists the dozens of points one
 * ion's peak shape covers, and none of them is the ion. For a profile these are
 * the peaks the picking found in it.
 *
 * The window is the chart's by default: zoom into a cluster and the question
 * becomes what is in *that* cluster, and a table that went on listing every row
 * would have to be searched for the answer the chart is already pointing at. A
 * floor of a hundredth of the base peak leaves the baseline out, and both are a
 * toggle away. Resting on a row lights the peak on the chart, and clicking one
 * frames it there.
 * @param props - Component props.
 * @returns The panel.
 */
export function PeaksPanel(props: PeaksPanelProps) {
  const { highlightMz = null, onHighlight } = props;
  const {
    state,
    visibleSpectra,
    selectedSpectrum,
    mzDecimals,
    autoMzDecimals,
  } = useMassEditorState();
  const actions = useMassActions();
  const command = useMassCommandProps();
  const { domain } = state.view;
  const { showLabels, showCharges } = state.settings;

  const [inWindow, setInWindow] = useState(true);
  const [withFloor, setWithFloor] = useState(true);
  const [sortKey, setSortKey] = useState<PeakSortKey>('mz');
  const { copied, copy } = useCopyToClipboard();

  const peaks = useMemo(
    () =>
      selectedSpectrum === null
        ? []
        : peakTableRows(selectedSpectrum, {
            domain: inWindow ? domain : null,
            threshold: withFloor ? PEAK_TABLE_THRESHOLD : 0,
          }),
    [selectedSpectrum, inWindow, domain, withFloor],
  );

  // Stable across a pointer move, so the memoised rows survive one.
  const onPick = useCallback(
    (mz: number) => actions.setDomain(mzFrame(mz, visibleSpectra, domain)),
    [actions, visibleSpectra, domain],
  );
  const highlight = useCallback(
    (mz: number | null) => onHighlight?.(mz),
    [onHighlight],
  );

  const total = selectedSpectrum?.centroid.x.length ?? 0;

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Peaks">
          <Toolbar.Item
            icon="zoom-to-fit"
            active={inWindow}
            tooltip="Only the peaks the chart is showing"
            aria-label="Only the peaks the chart is showing"
            onClick={() => setInWindow(!inWindow)}
          />
          <Toolbar.Item
            icon="filter"
            active={withFloor}
            tooltip="Leave out the peaks under 1 % of the base peak"
            aria-label="Leave out the peaks under 1 % of the base peak"
            onClick={() => setWithFloor(!withFloor)}
          />
          <Toolbar.Item
            icon="label"
            active={showLabels}
            {...command('toggleLabels')}
          />
          <Toolbar.Item
            icon="numerical"
            active={showCharges}
            {...command('toggleCharges')}
          />
          <MzDecimalsMenu
            setting={state.settings.mzDecimals}
            autoDecimals={autoMzDecimals}
            onChange={(setting) => actions.setSettings({ mzDecimals: setting })}
          />
          <Toolbar.Item
            icon={copied ? 'tick' : 'duplicate'}
            tooltip="Copy the rows as tab-separated text"
            aria-label="Copy the rows as tab-separated text"
            disabled={peaks.length === 0}
            onClick={() => void copy(peakTableToTsv(peaks, mzDecimals))}
          />
        </Toolbar>
        <div
          style={panelToolbarCountStyle}
          title={`${peaks.length} of the ${total} peaks of this spectrum listed`}
        >
          <SelectedTotal count={peaks.length} total={total} />
        </div>
      </div>

      <div style={panelBodyStyle}>
        {selectedSpectrum === null ? (
          <p style={panelEmptyStyle}>
            No spectrum is selected. Click one in the Spectra panel and its
            peaks are listed here.
          </p>
        ) : peaks.length === 0 ? (
          <p style={panelEmptyStyle}>
            No peak stands in the window above the floor. Zoom out, or switch
            the window or the floor off in the toolbar.
          </p>
        ) : (
          <>
            {peaks.length === PEAK_TABLE_LIMIT ? (
              <p style={noteStyle}>
                The {PEAK_TABLE_LIMIT} most intense peaks are listed. Zoom in to
                list the rest.
              </p>
            ) : null}
            <PeakTable
              peaks={peaks}
              mzDecimals={mzDecimals}
              sortKey={sortKey}
              onSort={setSortKey}
              highlightMz={highlightMz}
              onHighlight={highlight}
              onPick={onPick}
            />
          </>
        )}
      </div>
    </div>
  );
}

const noteStyle = { margin: 0, fontSize: 11, opacity: 0.7 } as const;
