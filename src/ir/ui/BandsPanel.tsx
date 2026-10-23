import { useMemo } from 'react';
import { Button, Toolbar } from 'react-science/ui';

import {
  panelBodyStyle,
  panelEmptyStyle,
  panelHeaderCellStyle,
  panelStyle,
  panelTableStyle,
  panelToolbarStyle,
} from '../../panel/core/panelStyles.ts';
import type { IrBand } from '../core/irBand.ts';
import { sameIrBand } from '../core/irBand.ts';
import { shortModeLabel } from '../core/irFormat.ts';
import { IR_TECHNIQUE_RULES } from '../core/irTechnique.ts';

import { BandRow } from './BandRow.tsx';
import { bandsToTsv } from './bandsTsv.ts';
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
  const { mode, pickBands, showAssignments, picking, technique } =
    state.settings;
  const { assignments } = IR_TECHNIQUE_RULES[technique];

  const rows = useMemo(() => assigned, [assigned]);

  const tsv = useMemo(
    () => bandsToTsv(rows, mode, assignments),
    [rows, mode, assignments],
  );

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Band actions">
          <Toolbar.Item
            icon="locate"
            active={pickBands}
            tooltip={pickBands ? 'Stop picking bands' : 'Pick the bands'}
            aria-label="Pick the bands"
            onClick={() => actions.setSettings({ pickBands: !pickBands })}
          />
          {assignments ? (
            <Toolbar.Item
              icon="label"
              active={showAssignments}
              tooltip="Name the assignments on the chart"
              aria-label="Name the assignments on the chart"
              disabled={!pickBands}
              onClick={() =>
                actions.setSettings({ showAssignments: !showAssignments })
              }
            />
          ) : null}
        </Toolbar>

        {/* The threshold is the one picking setting worth reaching for while
            reading: everything else about a band follows from the spectrum, and
            this is what decides whether a shoulder is a band at all. */}
        <label style={thresholdStyle}>
          <span style={{ opacity: 0.7 }}>threshold</span>
          <input
            type="range"
            min={0.005}
            max={0.3}
            step={0.005}
            value={picking.minRelativeHeight ?? 0.02}
            disabled={!pickBands}
            aria-label="How tall a band must be to be picked"
            onChange={(event) =>
              actions.setSettings({
                picking: { minRelativeHeight: event.target.valueAsNumber },
              })
            }
          />
        </label>

        <span style={{ flex: 1 }} />

        <Button
          variant="minimal"
          icon="clipboard"
          disabled={rows.length === 0}
          tooltipProps={{ content: 'Copy the table' }}
          aria-label="Copy the table"
          onClick={() => void navigator.clipboard?.writeText(tsv)}
        />
      </div>

      <div style={panelBodyStyle}>
        {selectedSpectrum === null ? (
          <p style={panelEmptyStyle}>No spectrum is selected.</p>
        ) : !pickBands ? (
          <p style={panelEmptyStyle}>
            The bands are not being picked. Press the locate button above to
            find them.
          </p>
        ) : rows.length === 0 ? (
          <p style={panelEmptyStyle}>
            No band was found above the threshold. Lower it to pick the weaker
            ones.
          </p>
        ) : (
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
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <BandRow
                  key={`${entry.band.spectrumId} ${entry.band.wavenumber}`}
                  entry={entry}
                  mode={mode}
                  assignments={assignments}
                  lit={sameIrBand(entry.band, highlight)}
                  onHighlight={onHighlight}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thresholdStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
} as const;
