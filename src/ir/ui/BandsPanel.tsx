import { Icon } from '@blueprintjs/core';
import { useMemo } from 'react';
import { Button, Toolbar } from 'react-science/ui';

import {
  panelBodyStyle,
  panelCellStyle,
  panelEmptyStyle,
  panelHeaderCellStyle,
  panelNumberCellStyle,
  panelStyle,
  panelTableStyle,
  panelToolbarStyle,
} from '../../panel/core/panelStyles.ts';
import type { AssignedBand } from '../core/assignBands.ts';
import type { IrBand } from '../core/irBand.ts';
import { sameIrBand } from '../core/irBand.ts';
import { formatIrValue, formatWavenumber } from '../core/irFormat.ts';

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
 * @param props - Component props.
 * @returns The panel.
 */
export function BandsPanel(props: BandsPanelProps) {
  const { highlight = null, onHighlight } = props;
  const { state, selectedSpectrum, assigned } = useIrEditorState();
  const actions = useIrActions();
  const { mode, pickBands, showAssignments, picking } = state.settings;

  const rows = useMemo(() => assigned, [assigned]);

  const tsv = useMemo(() => bandsToTsv(rows, mode), [rows, mode]);

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
                  {mode === 'absorbance' ? 'A' : '%T'}
                </th>
                <th style={panelHeaderCellStyle}>could be</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((entry) => (
                <BandRow
                  key={`${entry.band.spectrumId} ${entry.band.wavenumber}`}
                  entry={entry}
                  mode={mode}
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

interface BandRowProps {
  /** The band and everything it might be. */
  entry: AssignedBand;
  /** Which value axis is being read. */
  mode: 'absorbance' | 'transmittance';
  /** Whether the pointer is on this band, here or on the chart. */
  lit: boolean;
  /** Told when the pointer arrives on this row, and when it leaves. */
  onHighlight?: (band: IrBand | null) => void;
}

/**
 * One band: where it is, how strong, and every vibration it could be.
 *
 * The candidates are written as one line rather than a list, so a strong band
 * with four of them stays one row of the table and the wavenumbers keep reading
 * down the column. The `title` carries them again with each one's note, which is
 * where the reason to prefer one lives.
 * @param props - Component props.
 * @returns The row.
 */
function BandRow(props: BandRowProps) {
  const { entry, mode, lit, onHighlight } = props;
  const { band, candidates } = entry;

  const value = mode === 'absorbance' ? band.absorbance : band.transmittance;
  const detail = candidates
    .map((candidate) =>
      candidate.note === undefined
        ? `${candidate.group} ${candidate.vibration}`
        : `${candidate.group} ${candidate.vibration} — ${candidate.note}`,
    )
    .join('\n');

  return (
    <tr
      style={lit ? litRowStyle : undefined}
      onPointerEnter={() => onHighlight?.(band)}
      onPointerLeave={() => onHighlight?.(null)}
    >
      <td style={panelNumberCellStyle}>{formatWavenumber(band.wavenumber)}</td>
      <td style={panelCellStyle} title={STRENGTH_TITLES[band.strength]}>
        {band.strength}
      </td>
      <td style={panelNumberCellStyle}>{formatIrValue(value, mode)}</td>
      <td style={panelCellStyle} title={detail}>
        {candidates.length === 0 ? (
          <span style={{ opacity: 0.5 }}>—</span>
        ) : (
          <span style={{ whiteSpace: 'normal' }}>
            {candidates[0]?.group} {candidates[0]?.vibration}
            {candidates.length > 1 ? (
              <span style={{ opacity: 0.6 }}>
                {' '}
                <Icon icon="more" size={10} /> {candidates.length - 1} more
              </span>
            ) : null}
          </span>
        )}
      </td>
    </tr>
  );
}

/** What each strength letter means, for the column that shows only the letter. */
const STRENGTH_TITLES = {
  w: 'weak, relative to this spectrum',
  m: 'medium, relative to this spectrum',
  S: 'strong, relative to this spectrum',
} as const;

/**
 * The table as text, for pasting into a notebook.
 *
 * Tab separated with every candidate on the row, because the reason to copy a
 * band table is to put it beside a structure and argue about it — and the
 * argument is over the candidates rather than over the wavenumbers.
 * @param rows - The bands, as they are shown.
 * @param mode - Which value axis is being read.
 * @returns The table, one line per band, with a heading.
 */
function bandsToTsv(
  rows: readonly AssignedBand[],
  mode: 'absorbance' | 'transmittance',
): string {
  const heading = ['wavenumber', 'strength', mode, 'could be'].join('\t');
  const lines = rows.map((entry) =>
    [
      formatWavenumber(entry.band.wavenumber),
      entry.band.strength,
      formatIrValue(
        mode === 'absorbance'
          ? entry.band.absorbance
          : entry.band.transmittance,
        mode,
      ),
      entry.candidates
        .map((candidate) => `${candidate.group} ${candidate.vibration}`)
        .join('; '),
    ].join('\t'),
  );
  return [heading, ...lines].join('\n');
}

const litRowStyle = { background: '#fff3e0' } as const;

const thresholdStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  fontSize: 11,
} as const;
