import { useMemo, useState } from 'react';
import { MF } from 'react-mf';
import { Toolbar } from 'react-science/ui';

import {
  labelStyle,
  panelBodyStyle,
  panelEmptyStyle,
  panelStyle,
  panelToolbarStyle,
} from '../../panel/core/panelStyles.ts';
import type { MassSpectrum } from '../core/massSpectrum.ts';
import {
  spectrumMetaRows,
  spectrumResolutionRows,
} from '../core/massSummary.ts';

import { useMassEditorState } from './massStateContext.ts';

/**
 * The acquisition panel of the viewer, about whichever spectrum is selected.
 * @returns The panel.
 */
export function MetadataPanel() {
  const { selectedSpectrum, mzDecimals } = useMassEditorState();
  return <MassMetadata spectrum={selectedSpectrum} mzDecimals={mzDecimals} />;
}

export interface MassMetadataProps {
  /** The spectrum the panel is about, `null` when none is selected. */
  spectrum: MassSpectrum | null;
  /**
   * How many decimals its masses are written with.
   * @default 4
   */
  mzDecimals?: number;
}

/**
 * How a spectrum was acquired, as the file stated it, and what the viewer
 * found out about it — for any viewer, whatever state it keeps the spectrum in.
 *
 * Every row the file wrote is a fact it actually wrote: the reader leaves out
 * whatever was blank rather than showing it as a dash, so a short table means a
 * terse file and not a bug. The order is the reader's — source, instrument,
 * analyser, ionization, polarity, energy, and on down to who ran it — because
 * that is the order a method is read in. A file that wrote nothing gets the
 * facts true of every spectrum instead, a pasted one included: which file and
 * format it came from, how many peaks it holds and between which masses.
 *
 * Under either comes whether it is a high-resolution measurement, with how that
 * was decided, since a verdict read off the decimals of a peak table is a
 * weaker claim than one measured on the widths of its peaks.
 * @param props - Component props.
 * @returns The panel.
 */
export function MassMetadata(props: MassMetadataProps) {
  const { spectrum: selectedSpectrum, mzDecimals } = props;
  const [showConditions, setShowConditions] = useState(false);

  const meta = selectedSpectrum?.meta ?? null;
  const conditions = meta?.conditions ?? null;
  const title = meta?.title ?? null;
  const molecularFormula = meta?.molecularFormula ?? null;

  // The whole viewer re-renders on every drag of the chart, and the rows only
  // change when the selected spectrum does.
  const rows = useMemo(
    () =>
      selectedSpectrum === null
        ? []
        : [
            ...spectrumMetaRows(selectedSpectrum, mzDecimals),
            ...spectrumResolutionRows(selectedSpectrum),
          ],
    [selectedSpectrum, mzDecimals],
  );

  return (
    <div style={panelStyle}>
      <div style={panelToolbarStyle}>
        <Toolbar aria-label="Acquisition">
          <Toolbar.Item
            icon="align-left"
            active={showConditions}
            disabled={conditions === null}
            tooltip={
              conditions === null
                ? 'This file carried no scan description of its own'
                : "Show the instrument's own scan description, as it was written"
            }
            aria-label="Show the scan description"
            onClick={() => setShowConditions(!showConditions)}
          />
        </Toolbar>
      </div>

      <div style={panelBodyStyle}>
        {selectedSpectrum === null ? (
          <p style={panelEmptyStyle}>
            No spectrum is selected. Click one in the Spectra panel and what its
            file said about the acquisition appears here.
          </p>
        ) : (
          <>
            {title === null ? null : <div style={titleStyle}>{title}</div>}
            {meta === null ? (
              <p style={panelEmptyStyle}>
                This file carried no acquisition metadata, so this is what the
                viewer knows about it.
              </p>
            ) : null}
            <table style={tableStyle}>
              <tbody>
                {molecularFormula === null ? null : (
                  <tr>
                    <th scope="row" style={rowLabelStyle}>
                      Formula
                    </th>
                    <td style={rowValueStyle}>
                      {/* Never the raw string: `C8H10N4O2` is only a formula
                          once its digits are subscripts. */}
                      <MF mf={molecularFormula} />
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" style={rowLabelStyle}>
                      {row.label}
                    </th>
                    <td style={rowValueStyle}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {conditions === null || !showConditions ? null : (
              <div>
                <div style={labelStyle}>Scan description</div>
                <pre style={conditionsStyle}>{conditions}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** What the file calls the spectrum, which is rarely what the list calls it. */
const titleStyle = {
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.3,
  wordBreak: 'break-word',
} as const;

const tableStyle = {
  width: '100%',
  fontSize: 12,
  borderCollapse: 'collapse',
} as const;

/**
 * The label column is as narrow as it can be and the value takes the rest: the
 * labels are short and known, and it is the values a file surprises you with.
 */
const rowLabelStyle = {
  width: '1%',
  padding: '2px 8px 2px 0',
  textAlign: 'left',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  verticalAlign: 'top',
  opacity: 0.7,
} as const;

const rowValueStyle = {
  padding: '2px 0',
  verticalAlign: 'top',
  wordBreak: 'break-word',
} as const;

/**
 * Kept verbatim, wrapping rather than scrolling sideways: a Thermo scan filter
 * is one long line that says more about the acquisition than the structured
 * records do, and half of it off the edge of a panel is half a method.
 */
const conditionsStyle = {
  margin: 0,
  padding: 6,
  borderRadius: 3,
  background: 'rgba(17, 20, 24, 0.06)',
  fontFamily: 'monospace',
  fontSize: 11,
  lineHeight: 1.35,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  userSelect: 'all',
} as const;
