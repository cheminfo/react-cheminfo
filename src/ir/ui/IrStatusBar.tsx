import { Icon } from '@blueprintjs/core';

import {
  countLabel,
  statusBarStyle as barStyle,
  statusItemStyle as itemStyle,
  statusMutedStyle as mutedStyle,
  statusSpacerStyle as spacerStyle,
} from '../../panel/core/statusBar.ts';
import { countAssigned } from '../core/assignBands.ts';
import { formatWavenumberRange } from '../core/irFormat.ts';
import { boxZoomOnly } from '../core/irMode.ts';
import { IR_TECHNIQUE_RULES } from '../core/irTechnique.ts';

import { useIrEditorState } from './irStateContext.ts';
import { useIrText } from './useIrText.ts';

/**
 * The one line under the chart: what is drawn, what was found, what went wrong.
 *
 * Everything in it is derived, so it is the cheapest place in the viewer to
 * answer "did that work" — how many spectra are drawn of those open, how many
 * bands the picking found and how many the table had something to say about
 * (where the table covers the technique), and the range the selected spectrum
 * covers, in the order its axis is read.
 *
 * The refusal is last and is the only red in the shell, so the eye that has just
 * pressed something and seen nothing happen lands on the reason.
 * @returns The status bar.
 */
export function IrStatusBar() {
  const { state, visibleSpectra, selectedSpectrum, assigned } =
    useIrEditorState();
  const { spectra } = state.data;
  const { error, tool } = state.view;
  const { mode, pickBands, technique } = state.settings;
  const { reverseX, assignments } = IR_TECHNIQUE_RULES[technique];
  const text = useIrText(technique);

  const range =
    selectedSpectrum === null
      ? ''
      : formatWavenumberRange(selectedSpectrum.wavenumber, reverseX);

  return (
    <div style={barStyle}>
      <span style={itemStyle}>
        {spectra.length === 0
          ? 'no spectrum open'
          : `${countLabel(visibleSpectra.length, 'spectrum', 'spectra')} drawn of ${spectra.length}`}
      </span>

      <span style={itemStyle}>{text.yTitle(mode)}</span>

      {selectedSpectrum === null ? null : (
        <span style={nameStyle} title={selectedSpectrum.name}>
          {selectedSpectrum.name}
        </span>
      )}

      {range === '' ? null : <span style={mutedStyle}>{range}</span>}

      {pickBands && assigned.length > 0 ? (
        <span style={itemStyle}>
          {countLabel(assigned.length, 'band', 'bands')}
          {selectedSpectrum?.bandsByHand ? ' picked by hand' : null}
          {assignments ? `, ${countAssigned(assigned)} assigned` : null}
        </span>
      ) : null}

      {tool === 'pick' ? (
        <span style={mutedStyle}>click to add or remove a band</span>
      ) : boxZoomOnly(mode) || tool === 'box' ? (
        <span style={mutedStyle}>square zoom: drag a rectangle</span>
      ) : null}

      <span style={spacerStyle} />

      {error === null ? null : (
        <span style={errorStyle} title={error}>
          <Icon icon="warning-sign" size={12} />
          {error}
        </span>
      )}
    </div>
  );
}

const nameStyle = {
  ...itemStyle,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '32%',
  fontWeight: 600,
} as const;

/** The one red in the shell: a refusal, and nothing else, is written in it. */
const errorStyle = {
  ...itemStyle,
  gap: 4,
  color: '#C0392B',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '60%',
} as const;
