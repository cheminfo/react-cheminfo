import { Icon } from '@blueprintjs/core';

import {
  countLabel,
  statusBarStyle as barStyle,
  statusCutStyle as cutStyle,
  statusItemStyle as itemStyle,
  statusMutedStyle as mutedStyle,
  statusSpacerStyle as spacerStyle,
} from '../../panel/core/statusBar.ts';
import {
  formatMzRange,
  resolutionLabel,
  resolvingPowerLabel,
} from '../core/massFormat.ts';
import { resolutionOf } from '../core/resolutionOf.ts';

import { useMassEditorState } from './massStateContext.ts';

/**
 * The one line under the chart: what is drawn, what it resolves, what went
 * wrong.
 *
 * Everything in it is derived, so it is the cheapest place in the viewer to
 * answer "did that work" — how many spectra are drawn of those open, how many
 * peaks the selected one holds and between which masses, and whether it is a
 * high-resolution spectrum, with the resolving power where one was measured.
 *
 * The refusal is last and is the only red in the shell, so the eye that has just
 * dropped something and seen nothing happen lands on the reason.
 * @returns The status bar.
 */
export function MassStatusBar() {
  const { state, visibleSpectra, selectedSpectrum, mzDecimals } =
    useMassEditorState();
  const { spectra } = state.data;
  const { error, tool } = state.view;

  const resolution =
    selectedSpectrum === null ? null : resolutionOf(selectedSpectrum);
  const range =
    selectedSpectrum === null
      ? ''
      : formatMzRange(selectedSpectrum.centroid.x, mzDecimals);

  return (
    <div style={barStyle}>
      <span style={itemStyle}>
        {spectra.length === 0
          ? 'no spectrum open — drop a JCAMP-DX or a text file on the chart'
          : `${countLabel(visibleSpectra.length, 'spectrum', 'spectra')} drawn of ${spectra.length}`}
      </span>

      {selectedSpectrum === null ? null : (
        <span style={nameStyle} title={selectedSpectrum.name}>
          {selectedSpectrum.name}
        </span>
      )}

      {resolution === null ? null : (
        <span style={itemStyle}>
          {resolutionLabel(resolution)}
          {resolution.resolvingPower === null
            ? null
            : ` (${resolvingPowerLabel(resolution.resolvingPower)})`}
        </span>
      )}

      {selectedSpectrum === null ? null : (
        <span style={itemStyle}>
          {countLabel(selectedSpectrum.centroid.x.length, 'peak', 'peaks')}
        </span>
      )}

      {range === '' ? null : <span style={mutedStyle}>m/z {range}</span>}

      {tool === 'box' ? (
        <span style={mutedStyle}>square zoom: drag a rectangle</span>
      ) : null}

      <span style={spacerStyle} />

      {error === null ? null : (
        <span style={errorStyle} title={error}>
          <Icon icon="warning-sign" size={12} />
          <span style={cutStyle}>{error}</span>
        </span>
      )}
    </div>
  );
}

const nameStyle = {
  ...cutStyle,
  maxWidth: '32%',
  fontWeight: 600,
} as const;

/**
 * A refusal, in the family's danger colour and nothing else in it: the
 * glyph, then its words, cut as the bar's other long items are.
 */
const errorStyle = {
  ...itemStyle,
  gap: 4,
  color: 'var(--danger)',
  minWidth: 0,
  maxWidth: '60%',
} as const;
