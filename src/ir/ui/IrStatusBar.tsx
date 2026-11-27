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
  const { state, visibleSpectra, selectedSpectrum, assigned, assignments } =
    useIrEditorState();
  const { spectra } = state.data;
  const { error, tool } = state.view;
  const { mode, pickBands, technique } = state.settings;
  const { reverseX, unit } = IR_TECHNIQUE_RULES[technique];
  const text = useIrText(technique);

  const range =
    selectedSpectrum === null
      ? ''
      : formatWavenumberRange(selectedSpectrum.wavenumber, reverseX, unit);

  return (
    <div style={barStyle}>
      <StatusCount open={spectra.length} drawn={visibleSpectra.length} />

      <span style={itemStyle}>{text.yTitle(mode)}</span>

      <StatusName name={selectedSpectrum?.name ?? null} />

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

      <StatusError error={error} />
    </div>
  );
}
