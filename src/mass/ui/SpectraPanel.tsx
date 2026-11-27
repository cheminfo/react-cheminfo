import { SelectedTotal, Toolbar } from 'react-science/ui';

import {
  panelEmptyStyle,
  panelStyle,
  panelToolbarCountStyle,
  panelToolbarStyle,
} from '../../panel/core/panelStyles.ts';
import { SpectrumList } from '../../panel/ui/SpectrumList.tsx';
import { downloadMassSpectra } from '../core/downloadSpectra.ts';
import { massCommandLabel } from '../core/massCommands.ts';

import { SpectrumRow } from './SpectrumRow.tsx';
import { useMassCommand } from './massCommandContext.tsx';
import { useMassActions, useMassEditorState } from './massStateContext.ts';

/**
 * What is loaded: one row per spectrum, in the order the files gave them.
 *
 * The list is the viewer's selection as well as its legend. Whichever row is
 * selected is the spectrum the acquisition table describes, the peak table holds
 * and the chart writes its labels on, so a row is not a checkbox with a colour
 * beside it — it is the control that decides what the other panels are about.
 * That is also why the arrow keys walk it: a GC/MS export gives a page per scan,
 * and finding the interesting one means stepping down them watching the chart.
 *
 * What acts on the list rather than on one row — opening more, drawing every
 * trace again, handing the whole list over as a file, closing every one — is a
 * toolbar under the header, where a panel's own actions belong.
 * @returns The panel.
 */
export function SpectraPanel() {
  const { state, visibleSpectra } = useMassEditorState();
  const actions = useMassActions();
  const run = useMassCommand();
  const { spectra } = state.data;
  const { selectedId } = state.view;

  const allDrawn = spectra.every(
    (spectrum) => spectrum.showProfile || spectrum.showCentroid,
  );

  return (
    <div style={panelStyle}>
      <div className="no-print" style={panelToolbarStyle}>
        <Toolbar aria-label="Spectra">
          <Toolbar.Item
            icon="folder-open"
            tooltip={massCommandLabel('openFiles')}
            aria-label={massCommandLabel('openFiles')}
            onClick={() => run('openFiles')}
          />
          <Toolbar.Item
            icon="trash"
            intent="danger"
            tooltip="Close every spectrum"
            aria-label="Close every spectrum"
            disabled={spectra.length === 0}
            onClick={actions.clear}
          />
          <Toolbar.Item
            icon="eye-open"
            tooltip="Draw every spectrum again, each as the trace it was read as"
            aria-label="Draw every spectrum again"
            disabled={spectra.length === 0 || allDrawn}
            onClick={() => {
              for (const spectrum of spectra) {
                if (spectrum.showProfile || spectrum.showCentroid) continue;
                actions.setSpectrumVisibility(spectrum.id, {
                  showProfile: spectrum.profile !== null,
                  showCentroid: spectrum.profile === null,
                });
              }
            }}
          />
          <Toolbar.Item
            icon="download"
            tooltip="Download every spectrum as one JCAMP-DX file"
            aria-label="Download every spectrum"
            disabled={spectra.length === 0}
            onClick={() => downloadMassSpectra(spectra)}
          />
        </Toolbar>
        <div
          style={panelToolbarCountStyle}
          title={`${visibleSpectra.length} of ${spectra.length} spectra drawn`}
        >
          <SelectedTotal count={visibleSpectra.length} total={spectra.length} />
        </div>
      </div>

      <SpectrumList
        spectra={spectra}
        selectedId={selectedId}
        onSelect={actions.selectSpectrum}
        label="Open spectra"
        empty={
          <p style={panelEmptyStyle}>
            No spectrum is open. Drop a JCAMP-DX file, or two columns of m/z and
            intensity, on the chart.
          </p>
        }
      >
        {(spectrum) => (
          <SpectrumRow
            key={spectrum.id}
            spectrum={spectrum}
            isSelected={spectrum.id === selectedId}
          />
        )}
      </SpectrumList>
    </div>
  );
}

/**
 * The rows, flush against one another: a gap between every pair reads as a
 * stack of cards rather than as one list to run an eye down.
 */
