import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  panelCellStyle,
  panelTableStyle,
} from '../../panel/core/panelStyles.ts';
import { PanelEmpty } from '../../panel/ui/PanelMessage.tsx';
import { transitionText } from '../core/panelFormat.ts';
import { formatOrbital } from '../core/peakFormat.ts';
import { findSpectrum } from '../core/spectrumGroups.ts';

import { panelBodyStyle as bodyStyle, panelStyle } from './panelStyles.ts';
import { useXpsEditorState } from './xpsStateContext.ts';

/**
 * How the selected spectrum was acquired, as the file stated it.
 *
 * Every row is a fact the file actually wrote: the reader leaves out whatever a
 * VAMAS block left blank — the standard has no way of omitting a record, so an
 * instrument that does not know a number writes `1E37` and one that does not
 * know a string writes `Not specified` — rather than showing it as a dash. A
 * short table therefore means a terse file and not a bug, and the order is the
 * order a method is read in rather than the order the standard writes its
 * records.
 *
 * The block identifier is shown whatever the file said, above the table and
 * separately from it, because it is the one field that is not really metadata:
 * it is what this acquisition *was* — `Survey`, `1: S 2p` — and it is how the
 * row in the spectra list was told apart from the seven others of the same
 * sample.
 * @returns The panel.
 */
export function MetadataPanel(): ReactNode {
  const { state } = useXpsEditorState();
  const { spectra } = state.data;
  const { selectedId } = state.view;

  // The whole viewer re-renders on every drag of the chart, and the spectrum
  // only changes when the selection or the document does.
  const spectrum = useMemo(
    () => findSpectrum(spectra, selectedId),
    [spectra, selectedId],
  );

  if (spectrum === null) {
    return (
      <div style={panelStyle}>
        <div style={bodyStyle}>
          <PanelEmpty>
            No spectrum is selected. Click one in the Spectra panel and what its
            file said about the acquisition appears here.
          </PanelEmpty>
        </div>
      </div>
    );
  }

  const { meta, transition } = spectrum;
  const title = meta?.title ?? null;
  const fields = meta?.fields ?? [];
  const level = formatOrbital(
    transition.element,
    transition.shell,
    transition.angularMomentum,
  );
  const auger =
    transition.augerElement === null
      ? null
      : `${transition.augerElement} ${transition.augerTransition ?? ''}`.trim();

  return (
    <div style={panelStyle}>
      <div style={bodyStyle}>
        {title === null ? null : <div style={titleStyle}>{title}</div>}

        <table style={panelTableStyle}>
          <tbody>
            <tr>
              <th scope="row" style={rowLabelStyle}>
                Block
              </th>
              <td style={rowValueStyle}>{transitionText(transition)}</td>
            </tr>
            {level === '—' ? null : (
              <tr>
                <th scope="row" style={rowLabelStyle}>
                  Core level
                </th>
                <td style={rowValueStyle}>{level}</td>
              </tr>
            )}
            {auger === null ? null : (
              <tr>
                <th scope="row" style={rowLabelStyle}>
                  Auger line
                </th>
                <td style={rowValueStyle}>{auger}</td>
              </tr>
            )}
            {fields.map((field) => (
              <tr key={field.label}>
                <th scope="row" style={rowLabelStyle}>
                  {field.label}
                </th>
                <td style={rowValueStyle}>{field.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {fields.length === 0 ? (
          <PanelEmpty>
            This file said nothing about how the spectrum was acquired — no
            source, no analyser, no dwell time. A two-column paste carries none
            of it, and neither does a JCAMP written as a plain trace.
          </PanelEmpty>
        ) : null}
      </div>
    </div>
  );
}

/** What the file calls the experiment, which is rarely what the list calls it. */
const titleStyle = {
  fontSize: 12,
  fontWeight: 600,
  lineHeight: 1.3,
  wordBreak: 'break-word',
} as const;

/**
 * The label column is as narrow as it can be and the value takes the rest: the
 * labels are short and known, and it is the values a file surprises you with.
 * Both are the family's panel cell, so the table reads like the acquisition
 * table of the infrared and mass viewers.
 */
const rowLabelStyle = {
  ...panelCellStyle,
  width: '1%',
  textAlign: 'left',
  fontWeight: 600,
  verticalAlign: 'top',
  opacity: 0.7,
} as const;

const rowValueStyle = {
  ...panelCellStyle,
  whiteSpace: 'normal',
  verticalAlign: 'top',
  wordBreak: 'break-word',
} as const;
