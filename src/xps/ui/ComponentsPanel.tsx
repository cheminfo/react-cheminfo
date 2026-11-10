import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { SelectedTotal, Toolbar } from 'react-science/ui';

import { countLabel } from '../../panel/core/statusBar.ts';
import { FilterInput } from '../../panel/ui/FilterInput.tsx';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import { useFilterBox } from '../../panel/ui/useFilterBox.ts';
import type { ComponentRow } from '../core/componentRows.ts';
import {
  buildComponentRows,
  totalComponentArea,
} from '../core/componentRows.ts';
import { filterComponentRows } from '../core/filterRows.ts';
import { transitionText } from '../core/panelFormat.ts';
import { formatCounts } from '../core/peakFormat.ts';
import type { ComponentSortKey } from '../core/sortRows.ts';
import { sortComponentRows } from '../core/sortRows.ts';
import { findSpectrum } from '../core/spectrumGroups.ts';

import { ComponentTable } from './ComponentTable.tsx';
import {
  panelBodyStyle as bodyStyle,
  panelStyle,
  panelSummaryStyle as summaryStyle,
  panelToolbarCountStyle as countStyle,
  panelToolbarStyle as toolbarStyle,
} from './panelStyles.ts';
import { useXpsEditorState } from './xpsStateContext.ts';

/**
 * The fit the file carries: what somebody decided this envelope is made of.
 *
 * Nothing here is computed. The label, the position, the width, the area, the
 * shape and the sensitivity factor are all CASA's, written into the block
 * comment when the analyst fitted the spectrum — so this panel is a reading of
 * their claim rather than a claim of our own. That is also why an unfitted
 * spectrum shows a sentence and not an empty table: no fit is a different
 * statement from a fit of nothing, and only one of them is worth a table.
 *
 * The commonest way to arrive here and find nothing is to have the survey scan
 * selected. A survey is never fitted — it is acquired to decide *which*
 * transitions to scan narrowly, and the fits live on those narrow scans — so the
 * empty state says so rather than leaving the reader to conclude the file lost
 * its fit.
 * @returns The panel.
 */
export function ComponentsPanel(): ReactNode {
  const { state } = useXpsEditorState();
  const { spectra } = state.data;
  const { selectedId } = state.view;

  const { filter, setFilter, showFilter, toggleFilter } = useFilterBox();
  const [sortKey, setSortKey] = useState<ComponentSortKey>('bindingEnergy');
  const [ascending, setAscending] = useState(true);

  const spectrum = useMemo(
    () => findSpectrum(spectra, selectedId),
    [spectra, selectedId],
  );

  const rows = useMemo(
    () => (spectrum === null ? NO_ROWS : buildComponentRows(spectrum)),
    [spectrum],
  );

  const shown = useMemo(
    () =>
      sortComponentRows(filterComponentRows(rows, filter), sortKey, ascending),
    [rows, filter, sortKey, ascending],
  );

  const areaText = formatCounts(totalComponentArea(rows));

  function sortBy(key: ComponentSortKey): void {
    if (key === sortKey) {
      setAscending(!ascending);
      return;
    }
    setSortKey(key);
    // The area column opens on the largest component, every other on the first.
    setAscending(key !== 'area');
  }

  return (
    <div style={panelStyle}>
      <div style={toolbarStyle}>
        <Toolbar aria-label="Fit">
          <Toolbar.Item
            icon="search"
            active={showFilter}
            disabled={rows.length === 0}
            tooltip="Filter by label, energy, shape or region"
            aria-label="Filter the components"
            onClick={toggleFilter}
          />
        </Toolbar>
        {rows.length === 0 ? null : (
          <div
            style={countStyle}
            title={`${shown.length} of ${countLabel(rows.length, 'component', 'components')}`}
          >
            <SelectedTotal count={shown.length} total={rows.length} />
          </div>
        )}
      </div>

      <div style={bodyStyle}>
        {spectrum === null ? (
          <PanelEmpty>
            Select a spectrum in the list and the peaks its file was fitted with
            appear here.
          </PanelEmpty>
        ) : null}

        {spectrum !== null && rows.length === 0 ? (
          <PanelEmpty>
            {transitionText(spectrum.transition)} carries no fit. A survey scan
            never does — it is acquired to decide which transitions are worth a
            narrow scan, and the fits live on those. Select a narrow scan of one
            core level instead.
          </PanelEmpty>
        ) : null}

        {spectrum !== null && rows.length > 0 ? (
          <>
            {showFilter ? (
              <FilterInput
                autoFocus
                value={filter}
                placeholder="C 1s, GL(30), Shirley"
                onValueChange={setFilter}
              />
            ) : null}

            <div style={summaryStyle}>
              {countLabel(rows.length, 'component', 'components')}, {areaText}{' '}
              of area between them
            </div>

            {shown.length === 0 ? (
              <PanelEmpty>No component matches the filter.</PanelEmpty>
            ) : (
              <ComponentTable
                rows={shown}
                spectrumId={spectrum.id}
                sortKey={sortKey}
                ascending={ascending}
                onSort={sortBy}
              />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

/** The fit of no spectrum, kept stable so the memos survive a re-render. */
const NO_ROWS: readonly ComponentRow[] = [];
