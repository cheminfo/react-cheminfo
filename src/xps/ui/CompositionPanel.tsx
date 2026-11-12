import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Toolbar } from 'react-science/ui';

import { countLabel } from '../../panel/core/statusBar.ts';
import { PanelEmpty, PanelMessage } from '../../panel/ui/PanelMessage.tsx';
import {
  assumedWarning,
  buildCompositionRows,
} from '../core/compositionRows.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';
import { isFitted } from '../core/xpsSpectrum.ts';

import { CompositionTable } from './CompositionTable.tsx';
import {
  panelBodyStyle as bodyStyle,
  panelStyle,
  panelSummaryStyle as summaryStyle,
  panelToolbarStyle as toolbarStyle,
} from './panelStyles.ts';
import { useXpsEditorState } from './xpsStateContext.ts';

/**
 * What the fits on the chart add up to.
 *
 * A composition is over several spectra and never over one: carbon is quantified
 * from the C 1s scan, oxygen from the O 1s, and each of them is a separate block
 * of the file. So this panel — alone among the seven — is not about the selected
 * spectrum. It is about what is *drawn*, which is the reader's own statement of
 * which scans belong to one surface: a file holding six samples would otherwise
 * be quantified as though all six were one, and the number that came out would
 * be a confident average of six different materials.
 *
 * Grouping by element is the composition as it is usually quoted. Ungrouped
 * answers the other question — how much of this carbon is carbonate — which is
 * what the fit was made to decide in the first place.
 * @returns The panel.
 */
export function CompositionPanel(): ReactNode {
  const { state } = useXpsEditorState();
  const { spectra } = state.data;

  const [groupByElement, setGroupByElement] = useState(true);
  const [everything, setEverything] = useState(false);

  const quantified = useMemo(
    () => (everything ? spectra : drawnSpectra(spectra)),
    [spectra, everything],
  );

  const rows = useMemo(
    () => buildCompositionRows(quantified, { groupByElement }),
    [quantified, groupByElement],
  );

  const fitted = useMemo(() => countFitted(quantified), [quantified]);
  const warning = assumedWarning(rows);

  return (
    <div style={panelStyle}>
      <div style={toolbarStyle}>
        <Toolbar aria-label="Composition">
          <Toolbar.Item
            icon="group-objects"
            active={groupByElement}
            tooltip="Add the components of one element together"
            aria-label="Group the composition by element"
            onClick={() => setGroupByElement(!groupByElement)}
          />
          <Toolbar.Item
            icon="layers"
            active={everything}
            tooltip="Quantify every spectrum that is open, drawn or not"
            aria-label="Quantify every spectrum that is open"
            onClick={() => setEverything(!everything)}
          />
        </Toolbar>
      </div>

      <div style={bodyStyle}>
        {rows.length === 0 ? (
          <PanelEmpty>
            Nothing here carries a fit, so there is no composition to compute —
            which is a different answer from a composition of zero. Load a file
            fitted in CasaXPS, or select the narrow scans rather than the
            survey.
          </PanelEmpty>
        ) : (
          <>
            <div style={summaryStyle}>
              {countLabel(rows.length, 'line', 'lines')} from{' '}
              {countLabel(fitted, 'fitted spectrum', 'fitted spectra')}
              {everything ? ' that are open' : ' on the chart'}
            </div>

            {warning === null ? null : <PanelMessage>{warning}</PanelMessage>}

            <CompositionTable rows={rows} />
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The spectra that are on the chart.
 * @param spectra - Everything that is open.
 * @returns The drawn ones, in the order they were loaded.
 */
function drawnSpectra(spectra: readonly XpsSpectrum[]): XpsSpectrum[] {
  const drawn: XpsSpectrum[] = [];
  for (const spectrum of spectra) {
    if (spectrum.visible) drawn.push(spectrum);
  }
  return drawn;
}

/**
 * How many of the spectra carry a fit at all.
 *
 * Said above the table because it is what makes the percentages readable: three
 * lines from one fitted spectrum is the decomposition of a single transition,
 * and the same three lines from three fitted spectra is a surface composition.
 * @param spectra - The spectra being quantified.
 * @returns How many were fitted.
 */
function countFitted(spectra: readonly XpsSpectrum[]): number {
  let fitted = 0;
  for (const spectrum of spectra) {
    if (isFitted(spectrum)) fitted++;
  }
  return fitted;
}
