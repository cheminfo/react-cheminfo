/**
 * What a cell of the conformer table holds: a name, an energy, or a share with
 * its bar.
 */

import type { CSSProperties, ReactElement } from 'react';

import { formatPercent } from '../../format/core/numbers.ts';
import type { ConformerRow } from '../core/conformerEnergy.ts';
import { relativeEnergyOf, totalEnergyOf } from '../core/conformerEnergy.ts';
import type { ConformerRanking } from '../core/conformerTypes.ts';

import type { ConformerColumn } from './conformerColumns.ts';

/**
 * What one cell of a row shows.
 * @param column - The column the cell is in.
 * @param conformer - The row.
 * @param ranking - Which energies the set is ordered by.
 * @param share - The row's share, from 0 to 1, or `null` without an energy.
 * @param largest - The largest share in the set.
 * @param rowName - What a row is called.
 * @returns The cell's content.
 */
export function cellContent(
  column: ConformerColumn,
  conformer: ConformerRow,
  ranking: ConformerRanking,
  share: number | null,
  largest: number,
  rowName: (id: number) => string,
): ReactElement | string {
  switch (column) {
    case 'id':
      return rowName(conformer.id);
    case 'population':
      return (
        <span style={populationStyle}>
          {shareBar(share, largest)}
          <span>{shareLabel(share)}</span>
        </span>
      );
    case 'relative':
      return energyLabel(relativeEnergyOf(conformer, ranking));
    case 'total':
      return energyLabel(totalEnergyOf(conformer, ranking));
    case 'forceFieldRelative':
      return energyLabel(conformer.relativeEnergy);
    case 'forceFieldRank':
      return conformer.refinement == null
        ? '—'
        : String(conformer.refinement.forceFieldId);
    default:
      return '—';
  }
}

/**
 * The share of a conformer, drawn as a bar.
 *
 * It takes its colour from the row it sits in — `currentColor` — so it is
 * legible on a plain row and on the selected one without a rule per state.
 *
 * It is drawn against the largest share rather than against the whole: the
 * column is narrow, and against the whole a set of twelve near-equal conformers
 * would be twelve bars of three pixels.
 * @param share - The share from 0 to 1, or `null` when there is no energy.
 * @param largest - The largest share in the set, which is the full width.
 * @returns The bar.
 */
function shareBar(share: number | null, largest: number): ReactElement {
  const width =
    share === null || largest <= 0
      ? 0
      : Math.max(0, Math.min(1, share / largest)) * 100;
  return (
    <span style={barTrackStyle} aria-hidden="true">
      <span style={{ ...barFillStyle, width: `${width}%` }} />
    </span>
  );
}

/**
 * The share of molecules in a conformer, as a percentage.
 *
 * A share that rounds to zero is written as `<0.1 %` instead: a conformer the
 * search found and kept is populated by something, and `0 %` says it is not.
 * @param share - The share from 0 to 1, or `null` when there is no energy.
 * @returns The percentage, or a dash when it cannot be worked out.
 */
function shareLabel(share: number | null): string {
  if (share === null) return '—';
  if (share > 0 && share < 0.001) return '<0.1 %';
  return formatPercent(share);
}

/**
 * The energy to two decimals, or a dash when there is none.
 *
 * The unit is in the column header rather than in every cell, so the numbers
 * line up and a row stays readable in a narrow panel.
 * @param energy - kcal/mol, or `null`.
 * @returns The label.
 */
function energyLabel(energy: number | null): string {
  if (energy === null) return '—';
  if (Math.abs(energy) < ENERGY_RESOLUTION) return '0.00';
  return energy > 0 ? `+${energy.toFixed(2)}` : energy.toFixed(2);
}

/**
 * Below this, two force-field energies are the same number to anyone reading
 * them, and the duplicate-minimum test upstream has already decided they are
 * distinct shapes.
 */
const ENERGY_RESOLUTION = 0.005;

const populationStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontVariantNumeric: 'tabular-nums',
} as const satisfies CSSProperties;

/**
 * The track is tinted with `color-mix` rather than `opacity`, which the fill
 * would inherit: an opacity on the track composites its child too, so the bar
 * would be as faint as the groove it sits in.
 */
const barTrackStyle = {
  display: 'block',
  flex: '1 1 auto',
  minWidth: 24,
  height: 5,
  borderRadius: 3,
  backgroundColor: 'color-mix(in srgb, currentColor 22%, transparent)',
  overflow: 'hidden',
} as const satisfies CSSProperties;

const barFillStyle = {
  display: 'block',
  height: '100%',
  borderRadius: 3,
  backgroundColor: 'currentColor',
} as const satisfies CSSProperties;
