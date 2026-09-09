/**
 * What the "what differs" panels draw, worked out before React sees it: the
 * series, the slot names, and the line reported as the pointer crosses a
 * measurement. The readout is the part a caller integrates against, so it
 * should be readable, and testable, without a renderer. What the tab *says*
 * about the panels lives beside this, in `projectionVariablesWords.ts`.
 */

import type { ChartSeries } from '../../chart/ui/TrackedLineChart.tsx';
import type { ChartStickSeries } from '../../chart/ui/TrackedStickChart.tsx';
import type {
  LoadingProfile,
  LoadingProfiles,
} from '../core/loadingProfiles.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import { variableDecimals, variableLabel } from '../core/variableAxis.ts';

/** Where the pointer is on the "what differs" tab, and what stands under it. */
export interface ProjectionVariableTrack {
  /** Which original measurement, from 0. */
  index: number;
  /** What it is called — a name, or a value written out with its unit. */
  label: string;
  /**
   * Its position on a number line, e.g. 1650 for a wavenumber.
   * @default undefined — the measurements are named and have no position
   */
  position?: number;
  /** Every drawn component and its value there, in the order the panels are in. */
  series: ReadonlyArray<{
    /** Which component, from 0. */
    axis: number;
    /** What it is called, e.g. `PC 2`. */
    name: string;
    /** The colour it carries on every tab. */
    color: string;
    /** Its value at this measurement, in whatever the current view draws. */
    value: number;
  }>;
  /** The line the tab writes, e.g. `1650 cm⁻¹ · PC 2 weight +0.081`. */
  readout: string;
}

/**
 * What the pointer is over, with its readout already written.
 *
 * The sign is written as a real minus sign and never dropped, because a weight
 * of −0.63 and one of +0.63 are the two opposite ends of the same component
 * and a readout that shows them alike is worse than no readout.
 * @param built - The panels as they were built.
 * @param slot - Which drawn slot the pointer entered.
 * @param panel - Which panel it entered, since that names the component.
 * @param format - How a number is written.
 * @returns The track.
 */
export function variableTrack(
  built: LoadingProfiles,
  slot: number,
  panel: number,
  format: (value: number) => string,
): ProjectionVariableTrack {
  const measurement = built.order[slot] ?? slot;
  const label = variableLabel(built.axis, measurement);
  const series: ProjectionVariableTrack['series'] = built.profiles.map(
    (profile) => ({
      axis: profile.index,
      name: profile.label,
      color: profile.color,
      value: profile.values[slot] ?? Number.NaN,
    }),
  );
  const here = built.profiles[panel];
  const value = here?.values[slot] ?? Number.NaN;
  const unit =
    built.valueLabel === '' ? '' : `${built.valueLabel.toLowerCase()} `;
  return {
    index: measurement,
    label,
    position:
      built.axis.kind === 'named' ? undefined : built.axis.values[measurement],
    series,
    readout: `${label} · ${here?.label ?? ''} ${unit}${signed(value, format)}`,
  };
}

/**
 * One panel's series: the faint average behind, then the component, then the
 * component's other end where the view draws two.
 * @param built - The panels as they were built.
 * @param profile - The component this panel is for.
 * @param bars - Whether it is drawn as bars from the zero line.
 * @param average - Whether the average sample is drawn behind it.
 * @param copy - The words the tab writes.
 * @returns The series, in drawing order.
 */
export function panelSeries(
  built: LoadingProfiles,
  profile: LoadingProfile,
  bars: boolean,
  average: boolean,
  copy: ProjectionCopy,
): ChartSeries[] {
  const series: ChartSeries[] = [];
  if (average && built.mean !== undefined) {
    series.push({
      id: 'average',
      label: copy.help.showAverage.title,
      values: built.mean,
      color: 'var(--text-faint)',
      muted: true,
    });
  }
  series.push({
    id: `component-${profile.index}`,
    label: profile.label,
    values: profile.values,
    color: profile.color,
    kind: bars ? 'bar' : 'line',
  });
  if (profile.secondValues !== undefined) {
    series.push({
      id: `component-${profile.index}-other`,
      label: profile.label,
      values: profile.secondValues,
      color: profile.color,
    });
  }
  return series;
}

/**
 * One panel's sticks, for measurements picked off a spectrum rather than
 * sampled across one.
 *
 * The views part company from the line chart's here. A loading is a stick from
 * the zero rule, up for the masses that make a score high and down for the
 * ones that make it low, which is the drawing the panel exists for. The
 * "effect" view cannot be two stick sets — they stand at the same masses, so
 * the shorter one is hidden inside the taller and the reader sees one wrong
 * spectrum — so it is one stick per peak spanning the two ends instead. That
 * loses nothing: the two ends are symmetric about the average and share one
 * colour on a line chart too, so what was being said was always the reach and
 * never the direction.
 * @param built - The panels as they were built.
 * @param profile - The component this panel is for.
 * @param average - Whether the average sample is drawn behind it.
 * @param copy - The words the tab writes.
 * @returns The series, in drawing order.
 */
export function panelSticks(
  built: LoadingProfiles,
  profile: LoadingProfile,
  average: boolean,
  copy: ProjectionCopy,
): ChartStickSeries[] {
  const series: ChartStickSeries[] = [];
  if (average && built.mean !== undefined) {
    series.push({
      id: 'average',
      label: copy.help.showAverage.title,
      values: built.mean,
      color: 'var(--text-faint)',
      muted: true,
    });
  }
  series.push({
    id: `component-${profile.index}`,
    label: profile.label,
    values: profile.values,
    from: profile.secondValues,
    color: profile.color,
  });
  return series;
}

/**
 * What each drawn slot is called, in the panels' own order.
 * @param built - The panels as they were built, or nothing at all.
 * @returns One name per slot.
 */
export function namesOfSlots(built: LoadingProfiles | null): string[] {
  return slotLabels(built, undefined);
}

/**
 * What the axis writes under the slots it labels, in the panels' own order.
 *
 * A number line is written to the axis's own precision here — `879 cm⁻¹`
 * under a tick — while the readout goes on naming the one slot the pointer is
 * over in the values the caller handed in.
 * @param built - The panels as they were built, or nothing at all.
 * @returns One label per slot.
 */
export function ticksOfSlots(built: LoadingProfiles | null): string[] {
  if (built === null) return [];
  return slotLabels(built, variableDecimals(built.axis));
}

/**
 * Three decimals with the trailing zeros dropped — what a readout writes when
 * the caller does not say otherwise.
 * @param value - The number.
 * @returns It, written out.
 */
export function writeValue(value: number): string {
  if (!Number.isFinite(value)) return '';
  return String(Math.round(value * DECIMALS) / DECIMALS);
}

function slotLabels(
  built: LoadingProfiles | null,
  decimals: number | undefined,
): string[] {
  if (built === null) return [];
  const labels = new Array<string>(built.order.length);
  for (let slot = 0; slot < built.order.length; slot++) {
    labels[slot] = variableLabel(
      built.axis,
      built.order[slot] ?? slot,
      decimals,
    );
  }
  return labels;
}

function signed(value: number, format: (value: number) => string): string {
  const sign = value < 0 ? '−' : '+';
  return `${sign}${format(Math.abs(value))}`;
}

const DECIMALS = 1000;
