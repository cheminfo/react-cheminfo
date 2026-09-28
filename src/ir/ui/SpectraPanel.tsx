import { Toolbar } from 'react-science/ui';

import {
  panelBodyStyle,
  panelEmptyStyle,
  panelStyle,
  panelToolbarStyle,
} from '../../panel/core/panelStyles.ts';
import {
  downloadIrSpectra,
  downloadIrSpectrum,
} from '../core/downloadSpectra.ts';

import { SpectrumRow } from './SpectrumRow.tsx';
import { useIrActions, useIrEditorState } from './irStateContext.ts';

/**
 * The spectra that are open: which is drawn, which the panels are about, and
 * what each is called.
 *
 * One row per spectrum, and the row is the selection: the panels and the picking
 * are about one spectrum at a time, so which one that is has to be visible and
 * one click away. Drawing is separate from selecting — a reference can be kept on
 * the chart while the bands of the sample are read — which is why the eye and the
 * row are two different targets.
 *
 * What acts on the list rather than on one row — drawing them all again, handing
 * the whole list over as a file, closing the selected one, closing every one — is
 * a toolbar under the header, where a panel's own actions belong. Closing the
 * selected spectrum is offered there as well as on its row because the row's
 * cross is a small target in a list of twenty, and the selected spectrum is the
 * one being worked on.
 * @returns The panel.
 */
export function SpectraPanel() {
  const { state } = useIrEditorState();
  const actions = useIrActions();
  const { spectra } = state.data;
  const { selectedId } = state.view;
  const { mode } = state.settings;

  const selected = spectra.find((spectrum) => spectrum.id === selectedId);
  const allDrawn = spectra.every((spectrum) => spectrum.visible);

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Spectra">
          <Toolbar.Item
            icon="trash"
            intent="danger"
            tooltip="Close every spectrum"
            aria-label="Close every spectrum"
            disabled={spectra.length === 0}
            onClick={actions.clear}
          />
          <Toolbar.Item
            icon="cross"
            intent="danger"
            tooltip="Close the selected spectrum"
            aria-label="Close the selected spectrum"
            disabled={selected === undefined}
            onClick={() => {
              if (selected !== undefined) actions.removeSpectrum(selected.id);
            }}
          />
          <Toolbar.Item
            icon="eye-open"
            tooltip="Draw every spectrum again"
            aria-label="Draw every spectrum again"
            disabled={spectra.length === 0 || allDrawn}
            onClick={() => {
              for (const spectrum of spectra) {
                actions.setSpectrumVisible(spectrum.id, true);
              }
            }}
          />
          <Toolbar.Item
            icon="download"
            tooltip="Download every spectrum as one JCAMP-DX file"
            aria-label="Download every spectrum"
            disabled={spectra.length === 0}
            onClick={() => downloadIrSpectra(spectra, mode)}
          />
        </Toolbar>
      </div>

      <div style={panelBodyStyle}>
        {spectra.length === 0 ? (
          <p style={panelEmptyStyle}>
            No spectrum is open. Open one of the examples, or drop a JCAMP-DX
            file on the chart.
          </p>
        ) : (
          spectra.map((spectrum) => (
            <SpectrumRow
              key={spectrum.id}
              spectrum={spectrum}
              selected={spectrum.id === selectedId}
              onSelect={() => actions.selectSpectrum(spectrum.id)}
              onToggle={() =>
                actions.setSpectrumVisible(spectrum.id, !spectrum.visible)
              }
              onColor={(color) => actions.setSpectrumColor(spectrum.id, color)}
              onDownload={() => downloadIrSpectrum(spectrum, mode)}
              onRemove={() => actions.removeSpectrum(spectrum.id)}
              onRename={(name) => actions.renameSpectrum(spectrum.id, name)}
            />
          ))
        )}
      </div>
    </div>
  );
}
