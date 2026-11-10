import { Icon } from '@blueprintjs/core';

import {
  countLabel,
  statusBarStyle as barStyle,
  statusItemStyle as itemStyle,
  statusMutedStyle as mutedStyle,
  statusSpacerStyle as spacerStyle,
} from '../../panel/core/statusBar.ts';
import {
  axisTitle,
  axisTrace,
  chartEnergyAxis,
  isAxisReversed,
} from '../core/energyAxis.ts';
import { formatEnergy } from '../core/peakFormat.ts';
import { countVisible, findSpectrum } from '../core/spectrumGroups.ts';
import type { XpsSpectrum } from '../core/xpsSpectrum.ts';
import type { EnergyAxis } from '../core/xpsState.ts';

import { useXpsEditorState } from './xpsStateContext.ts';

export interface XpsStatusBarProps {
  /**
   * Whether a file is being read.
   * @default false
   */
  isReading?: boolean;
}

/**
 * The one line under the chart: what is drawn, what was found, what went wrong.
 *
 * Laid out as the infrared and mass viewers lay theirs, from the same parts:
 * how many spectra are drawn of those open, the axis they are read on, the
 * selected spectrum, the range it covers in the order its axis is read, and how
 * many peaks it carries. Everything in it is derived, so it is the cheapest
 * place in the viewer to answer "did that work".
 *
 * The refusal is last and is the only red in the shell. A file that could not
 * be read fails where it was dropped, a window that runs backwards fails in the
 * reducer, and a user who has just been refused looks in one place; two places
 * to look is one place to miss it.
 * @param props - Component props.
 * @returns The status bar.
 */
export function XpsStatusBar(props: XpsStatusBarProps) {
  const { isReading = false } = props;
  const { state } = useXpsEditorState();
  const { spectra } = state.data;
  const { error, selectedId } = state.view;

  const axis = chartEnergyAxis(spectra, state.settings);
  const selected = findSpectrum(spectra, selectedId);
  const range = selected === null ? '' : energyRange(selected, axis);
  const peaks = selected?.peaks.length ?? 0;

  return (
    <div style={barStyle}>
      <span style={itemStyle}>
        {spectra.length === 0
          ? 'no spectrum open'
          : `${countLabel(countVisible(spectra), 'spectrum', 'spectra')} drawn of ${spectra.length}`}
      </span>

      <span style={itemStyle}>{axisTitle(axis)}</span>

      {selected === null ? null : (
        <span style={nameStyle} title={selected.name}>
          {selected.name}
        </span>
      )}

      {range === '' ? null : <span style={mutedStyle}>{range}</span>}

      {peaks > 0 ? (
        <span style={itemStyle}>{countLabel(peaks, 'peak', 'peaks')}</span>
      ) : null}

      {isReading ? <span style={mutedStyle}>reading…</span> : null}

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

/**
 * The energies a spectrum spans on the axis the chart draws, written in the
 * order that axis is read: high to low for binding energy, low to high for
 * kinetic.
 * @param spectrum - The spectrum.
 * @param axis - The axis the chart draws.
 * @returns The range, or `''` for a spectrum holding no point.
 */
function energyRange(spectrum: XpsSpectrum, axis: EnergyAxis): string {
  const { x } = axisTrace(spectrum, axis);
  const first = x[0];
  const last = x.at(-1);
  if (first === undefined || last === undefined) return '';
  const low = Math.min(first, last);
  const high = Math.max(first, last);
  const [from, to] = isAxisReversed(axis) ? [high, low] : [low, high];
  return `${formatEnergy(from)}–${formatEnergy(to)} eV`;
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
