import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { SelectedTotal, Toolbar } from 'react-science/ui';

import { useCopyToClipboard } from '../../clipboard/ui/useCopyToClipboard.ts';
import { countLabel } from '../../panel/core/statusBar.ts';
import { FilterInput } from '../../panel/ui/FilterInput.tsx';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import { useFilterBox } from '../../panel/ui/useFilterBox.ts';
import { isUsableSourceEnergy } from '../core/energy.ts';
import { filterPeakRows } from '../core/filterRows.ts';
import type { PeakRow } from '../core/peakRows.ts';
import { buildPeakRows, peakRowsToTsv } from '../core/peakRows.ts';
import type { PeakSortKey } from '../core/sortRows.ts';
import { sortPeakRows } from '../core/sortRows.ts';
import { findSpectrum } from '../core/spectrumGroups.ts';

import { PeakDetectionControls } from './PeakDetectionControls.tsx';
import { PeakTable } from './PeakTable.tsx';
import {
  panelBodyStyle as bodyStyle,
  panelStyle,
  panelToolbarCountStyle as countStyle,
  panelToolbarStyle as toolbarStyle,
} from './panelStyles.ts';
import { useXpsEditorState } from './xpsStateContext.ts';

/**
 * What is actually in the selected spectrum, peak by peak.
 *
 * The rows are the peaks the spectrum carries — the same array the chart writes
 * its labels from — so the table and the chart can never disagree about which
 * maxima exist. Changing the detection therefore changes both at once, which is
 * why the controls for it are here rather than in a settings dialog: the number
 * being chosen is judged against this table and that chart, and nowhere else.
 *
 * Each row also carries what the published levels say the peak could be, looked
 * up through the tolerance the Elements panel sets. It is a suggestion and never
 * a determination — Ru 3d and C 1s sit two eV apart — so the row says how many
 * other levels reached the same peak beside the name of the closest.
 *
 * Resting on a row lights the peak on the chart, which is how a row read here is
 * found there without hunting for it.
 * @returns The panel.
 */
export function PeaksPanel(): ReactNode {
  const { state } = useXpsEditorState();
  const { spectra } = state.data;
  const { selectedId } = state.view;
  const { referenceTolerance } = state.settings;

  const { filter, setFilter, showFilter, toggleFilter } = useFilterBox();
  const [showDetection, setShowDetection] = useState(false);
  const [sortKey, setSortKey] = useState<PeakSortKey>('bindingEnergy');
  const [ascending, setAscending] = useState(true);
  const { copied, copy } = useCopyToClipboard();

  const spectrum = useMemo(
    () => findSpectrum(spectra, selectedId),
    [spectra, selectedId],
  );

  const rows = useMemo(
    () =>
      spectrum === null
        ? NO_ROWS
        : buildPeakRows(spectrum, { tolerance: referenceTolerance }),
    [spectrum, referenceTolerance],
  );

  const shown = useMemo(
    () => sortPeakRows(filterPeakRows(rows, filter), sortKey, ascending),
    [rows, filter, sortKey, ascending],
  );

  function sortBy(key: PeakSortKey): void {
    if (key === sortKey) {
      setAscending(!ascending);
      return;
    }
    setSortKey(key);
    // Each column opens on the end it was clicked for: the strongest and the
    // broadest peaks, but the lowest binding energies.
    setAscending(key !== 'intensity' && key !== 'width');
  }

  return (
    <div style={panelStyle}>
      <div style={toolbarStyle}>
        <Toolbar aria-label="Peaks">
          <Toolbar.Item
            icon="search"
            active={showFilter}
            disabled={spectrum === null}
            tooltip="Filter by energy, element or level"
            aria-label="Filter the peaks"
            onClick={toggleFilter}
          />
          <Toolbar.Item
            icon="cog"
            active={showDetection}
            disabled={spectrum === null}
            tooltip="Find the maxima again, harder or less hard"
            aria-label="Run the peak detection again"
            onClick={() => setShowDetection(!showDetection)}
          />
          <Toolbar.Item
            icon={copied ? 'tick' : 'duplicate'}
            intent={copied ? 'success' : 'none'}
            disabled={shown.length === 0}
            tooltip={copied ? 'Copied' : 'Copy these peaks as a table'}
            aria-label="Copy these peaks as a table"
            onClick={() => void copy(peakRowsToTsv(shown))}
          />
        </Toolbar>
        {spectrum === null ? null : (
          <div
            style={countStyle}
            title={`${shown.length} of ${countLabel(rows.length, 'peak', 'peaks')}`}
          >
            <SelectedTotal count={shown.length} total={rows.length} />
          </div>
        )}
      </div>

      <div style={bodyStyle}>
        {spectrum === null ? (
          <PanelEmpty>
            Select a spectrum in the list to read its peaks.
          </PanelEmpty>
        ) : (
          <>
            {showDetection ? (
              <PeakDetectionControls spectrum={spectrum} />
            ) : null}

            {showFilter ? (
              <FilterInput
                autoFocus
                value={filter}
                placeholder="284.6, Mo, 3d"
                onValueChange={setFilter}
              />
            ) : null}

            {shown.length === 0 ? (
              <PanelEmpty>
                {rows.length === 0
                  ? 'No maximum was found in this spectrum. Lower the smallest-peak ratio or the noise floor and detect again.'
                  : 'No peak matches the filter.'}
              </PanelEmpty>
            ) : (
              <PeakTable
                rows={shown}
                spectrumId={spectrum.id}
                showKinetic={isUsableSourceEnergy(spectrum.sourceEnergy)}
                sortKey={sortKey}
                ascending={ascending}
                onSort={sortBy}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** What the table shows while no spectrum is selected, kept stable for the memo. */
const NO_ROWS: readonly PeakRow[] = [];
