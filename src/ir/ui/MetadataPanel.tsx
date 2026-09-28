import {
  panelBodyStyle,
  panelCellStyle,
  panelEmptyStyle,
  panelStyle,
  panelTableStyle,
} from '../../panel/core/panelStyles.ts';

import { useIrEditorState } from './irStateContext.ts';

/**
 * What the file said about the selected spectrum's acquisition.
 *
 * Only what it actually said. A field the file left blank is left out rather than
 * shown empty, so every line in the table is a fact — which is what makes the
 * table worth reading at all on a format where instruments write whatever they
 * like.
 *
 * Where the spectrum came from is shown even when the file said nothing: the
 * format and the file name are the two things a reader asks first when a trace
 * looks wrong.
 * @returns The panel.
 */
export function MetadataPanel() {
  const { selectedSpectrum } = useIrEditorState();

  if (selectedSpectrum === null) {
    return (
      <div style={panelStyle}>
        <div style={panelBodyStyle}>
          <p style={panelEmptyStyle}>No spectrum is selected.</p>
        </div>
      </div>
    );
  }

  const { meta, origin, wavenumber } = selectedSpectrum;
  const rows: Array<[string, string]> = [
    ['Format', origin.format],
    ...(origin.fileName === undefined
      ? []
      : ([['File', origin.fileName]] as Array<[string, string]>)),
    ...(origin.blockIndex === undefined
      ? []
      : ([['Block', String(origin.blockIndex)]] as Array<[string, string]>)),
    ...(origin.recorded === undefined
      ? []
      : ([['Recorded as', origin.recorded]] as Array<[string, string]>)),
    ['Points', String(wavenumber.length)],
    ...(meta === null
      ? []
      : meta.fields.map(
          (field) => [field.label, field.value] as [string, string],
        )),
  ];

  return (
    <div style={panelStyle}>
      <div style={panelBodyStyle}>
        {meta?.title === null || meta?.title === undefined ? null : (
          <p style={titleStyle}>{meta.title}</p>
        )}
        <table style={panelTableStyle}>
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label}>
                <th style={labelCellStyle}>{label}</th>
                <td style={{ ...panelCellStyle, whiteSpace: 'normal' }}>
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const titleStyle = { margin: 0, fontWeight: 600 } as const;

const labelCellStyle = {
  ...panelCellStyle,
  textAlign: 'left',
  fontWeight: 400,
  opacity: 0.7,
  width: '40%',
} as const;
