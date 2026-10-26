import {
  panelBodyStyle,
  panelEmptyStyle,
  panelHeaderCellStyle,
  panelStyle,
  panelTableStyle,
} from '../../panel/core/panelStyles.ts';
import { removeBand } from '../core/handPicking.ts';
import type { IrBand } from '../core/irBand.ts';
import { sameIrBand } from '../core/irBand.ts';
import { shortModeLabel } from '../core/irFormat.ts';
import type { IrSpectrum } from '../core/irSpectrum.ts';
import { IR_TECHNIQUE_RULES } from '../core/irTechnique.ts';

import { BandRow } from './BandRow.tsx';
import { BandsToolbar } from './BandsToolbar.tsx';
import { useIrActions, useIrEditorState } from './irStateContext.ts';

export interface BandsPanelProps {
  /**
   * The band the pointer is resting on, wherever it was hovered.
   * @default null
   */
  highlight?: IrBand | null;
  /**
   * Told which band a row is hovered, so the chart can mark it.
   * @default undefined
   */
  onHighlight?: (band: IrBand | null) => void;
}

/**
 * Every band of the selected spectrum, and everything each one might be.
 *
 * This is the panel the viewer exists for. A trace can be looked at on its own;
 * it is the table beside it that lets it be *read*, and the column that matters
 * is the last one — **every** vibration whose range contains the band, not the
 * best-fitting one. A band at 1715 cm⁻¹ genuinely is a ketone, an aldehyde and a
 * carboxylic acid until something else decides, and a panel that named one would
 * be asserting a structure the spectrum does not determine.
 *
 * Hovering a row marks the band on the chart and hovering the chart lights the
 * row, which is the whole reason the highlight is threaded through the shell
 * rather than held here: the two views are of one thing.
 *
 * The list is the spectrum's own and can be edited: a band is taken away from
 * its row, added by a click on the chart while picking by hand, and the whole
 * list found automatically again. Once edited it is the spectrum's as picked
 * by hand, and the threshold no longer moves it.
 *
 * For a technique the correlation table does not cover — Raman — the column of
 * candidates and the button naming them are left out, and the table is the
 * bands themselves.
 * @param props - Component props.
 * @returns The panel.
 */
export function BandsPanel(props: BandsPanelProps) {
  const { highlight = null, onHighlight } = props;
  const { state, selectedSpectrum, assigned } = useIrEditorState();
  const actions = useIrActions();
  const { mode, pickBands, technique } = state.settings;
  const { assignments } = IR_TECHNIQUE_RULES[technique];
  const empty = emptyMessage(selectedSpectrum, pickBands, assigned.length);

  function remove(band: IrBand): void {
    if (selectedSpectrum === null) return;
    actions.setBands(
      selectedSpectrum.id,
      removeBand(selectedSpectrum.bands ?? [], band.wavenumber),
    );
    onHighlight?.(null);
  }

  return (
    <div style={panelStyle}>
      <BandsToolbar />

      <div style={panelBodyStyle}>
        {empty === null ? (
          <table style={panelTableStyle}>
            <thead>
              <tr>
                <th style={panelHeaderCellStyle}>cm⁻¹</th>
                <th style={panelHeaderCellStyle} />
                <th style={{ ...panelHeaderCellStyle, textAlign: 'right' }}>
                  {shortModeLabel(mode)}
                </th>
                {assignments ? (
                  <th style={panelHeaderCellStyle}>could be</th>
                ) : null}
                <th style={panelHeaderCellStyle} />
              </tr>
            </thead>
            <tbody>
              {assigned.map((entry) => (
                <BandRow
                  key={`${entry.band.spectrumId} ${entry.band.wavenumber}`}
                  entry={entry}
                  mode={mode}
                  assignments={assignments}
                  lit={sameIrBand(entry.band, highlight)}
                  onHighlight={onHighlight}
                  onRemove={remove}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <p style={panelEmptyStyle}>{empty}</p>
        )}
      </div>
    </div>
  );
}

/**
 * What the panel says in place of the table, when it has no band to list.
 * @param spectrum - The selected spectrum, `null` for none.
 * @param picking - Whether the bands are picked at all.
 * @param count - How many bands there are to list.
 * @returns The sentence, or `null` when there is a table to show.
 */
function emptyMessage(
  spectrum: IrSpectrum | null,
  picking: boolean,
  count: number,
): string | null {
  if (spectrum === null) return 'No spectrum is selected.';
  if (!picking) {
    return 'The bands are not being picked. Press the locate button above to find them.';
  }
  if (count > 0) return null;
  return spectrum.bandsByHand
    ? 'No band is picked. Click the chart while picking by hand, or find them automatically again.'
    : 'No band was found above the threshold. Lower it to pick the weaker ones.';
}
