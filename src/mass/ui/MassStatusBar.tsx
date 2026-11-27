import {
  countLabel,
  statusBarStyle as barStyle,
  statusItemStyle as itemStyle,
  statusMutedStyle as mutedStyle,
} from '../../panel/core/statusBar.ts';
import {
  StatusCount,
  StatusError,
  StatusName,
} from '../../panel/ui/StatusItems.tsx';
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
      <StatusCount
        open={spectra.length}
        drawn={visibleSpectra.length}
        empty="no spectrum open — drop a JCAMP-DX or a text file on the chart"
      />

      <StatusName name={selectedSpectrum?.name ?? null} />

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

      <StatusError error={error} />
    </div>
  );
}
