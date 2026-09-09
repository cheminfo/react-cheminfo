import type { ChartExtent } from '../../chart/core/chartExtent.ts';
import { chartPadExtent } from '../../chart/core/chartExtent.ts';
import { chartSeriesColor } from '../../chart/core/chartPalette.ts';
import type { MatrixLike } from '../../chart/core/matrix.ts';

import type { ProjectionVariablesView } from './projectionOptions.ts';
import type { ProjectionAxis, ProjectionLoadings } from './projectionResult.ts';
import type { VariableAxis } from './variableAxis.ts';
import { variableCount } from './variableAxis.ts';
import { drawableVariablesView } from './variablesView.ts';

/** One component's line or bars, everything a panel draws. */
export interface LoadingProfile {
  /** Which component, from 0. */
  index: number;
  /** What the panel is titled, e.g. `PC 2`. */
  label: string;
  /** The colour this component carries on every tab. */
  color: string;
  /**
   * Its share of the differences, between 0 and 1, written after the title.
   * @default undefined — nothing is written after the title
   */
  share?: number;
  /** The values the panel draws, one per measurement, in the panel's own order. */
  values: readonly number[];
  /**
   * The second line a panel draws, for a view that has two.
   * @default undefined — the panel draws one line
   */
  secondValues?: readonly number[];
}

/** What the "what differs" tab draws, all of it. */
export interface LoadingProfiles {
  /** How the measurements are laid out, which decides a line or bars. */
  axis: VariableAxis;
  /** Which measurement each drawn slot is, so a tracking event can name it. */
  order: Int32Array;
  /**
   * The average sample, in the measurements' own units and the drawn order —
   * the faint reference line.
   * @default undefined — no reference line is drawn
   */
  mean?: readonly number[];
  /** One panel per component. */
  profiles: readonly LoadingProfile[];
  /** What the values measure, for the vertical axis. */
  valueLabel: string;
  /** Whether every panel shares one vertical scale. */
  sharedScale: boolean;
  /** The scale they share, when they do. */
  domain: ChartExtent;
  /** Which view produced them, for the legend sentence. */
  view: ProjectionVariablesView;
}

/** How {@link loadingProfiles} builds its panels. */
export interface LoadingProfilesOptions {
  /** What loads onto each axis. */
  loadings: ProjectionLoadings;
  /** The axes, for the panel titles and their shares. */
  axes: readonly ProjectionAxis[];
  /** Which view to draw. */
  view: ProjectionVariablesView;
  /** How many components to draw. */
  count: number;
  /** How far along a component the average sample is pushed, in standard deviations. */
  spread: number;
  /** Whether every panel shares one vertical scale. */
  sharedScale: boolean;
  /** The order the measurements are drawn in. */
  order: 'original' | 'strongest';
  /**
   * The one selected sample's scores, for the `sample` view.
   * @default undefined — the `sample` view falls back to `weights`
   */
  sampleScores?: readonly number[];
  /**
   * What that sample is called, for the legend sentence.
   * @default ''
   */
  sampleLabel?: string;
}

/**
 * The panels of the "what differs" tab.
 *
 * A view whose data is not there falls back to `weights` rather than throwing
 * or drawing nothing: `effect` needs the average and the spread, `rescaled`
 * needs the scaling the model applied, and `sample` needs exactly one selected
 * sample.
 * @param options - See {@link LoadingProfilesOptions}.
 * @returns Everything the tab draws.
 */
export function loadingProfiles(
  options: LoadingProfilesOptions,
): LoadingProfiles {
  const {
    loadings,
    axes,
    count,
    spread,
    sharedScale,
    order,
    view: wanted,
    sampleScores,
  } = options;
  const {
    weights,
    variables,
    mean,
    scales,
    spread: axisSpread,
    valueLabel = '',
  } = loadings;
  const width = variableCount(variables);
  const panels = Number.isFinite(count) ? Math.floor(count) : axes.length;
  const drawn = Math.max(0, Math.min(panels, weights.rows, axes.length));
  // An empty selection rather than an unknown one: the panels always know
  // what is selected, and nothing selected is nothing to rebuild.
  const view = drawableVariablesView(wanted, loadings, sampleScores ?? []);
  // A number line cannot be reordered: a peak stands at its own position, so
  // sorting the slots by strength would move every stick to a mass it was not
  // measured at. The choice is only meaningful where the slots are a list.
  const sortable = variables.kind === 'named' ? order : 'original';
  const slots = slotOrder(sortable, weights, width, drawn);

  // A panel in the measurements' own units starts from the average sample and
  // walks away from it; one drawing weights starts from nothing at all.
  const inUnits = view === 'effect' || view === 'sample';
  const running = view === 'sample' ? new Float64Array(width) : null;
  const profiles: LoadingProfile[] = [];
  let low = Number.POSITIVE_INFINITY;
  let high = Number.NEGATIVE_INFINITY;

  for (let index = 0; index < drawn; index++) {
    const values = new Array<number>(width);
    const second = view === 'effect' ? new Array<number>(width) : null;
    const reach = spread * (axisSpread?.[index] ?? 0);
    const score = sampleScores?.[index] ?? 0;
    for (let slot = 0; slot < width; slot++) {
      const measurement = slots[slot] ?? slot;
      const weight = weights.get(index, measurement);
      const scale = scales?.[measurement] ?? 1;
      const base = mean?.[measurement] ?? 0;
      let value = weight;
      if (view === 'rescaled') {
        value = weight * scale;
      } else if (second !== null) {
        const step = reach * weight * scale;
        value = base + step;
        second[slot] = base - step;
        if (base - step < low) low = base - step;
        if (base - step > high) high = base - step;
      } else if (running !== null) {
        const total = (running[slot] ?? 0) + score * weight * scale;
        running[slot] = total;
        value = base + total;
      }
      values[slot] = value;
      if (value < low) low = value;
      if (value > high) high = value;
    }
    const axis = axes[index];
    profiles.push({
      index,
      label: axis?.name ?? `Component ${index + 1}`,
      color: chartSeriesColor(index, 'component'),
      share: axis?.share,
      values,
      secondValues: second ?? undefined,
    });
  }

  let reference: number[] | undefined;
  if (inUnits && mean !== undefined) {
    reference = new Array<number>(width);
    for (let slot = 0; slot < width; slot++) {
      const value = mean[slots[slot] ?? slot] ?? 0;
      reference[slot] = value;
      if (value < low) low = value;
      if (value > high) high = value;
    }
  }

  const padded = chartPadExtent({ min: low, max: high });
  return {
    axis: variables,
    order: slots,
    mean: reference,
    profiles,
    // Weights are a share of a direction, not a quantity anybody measured.
    valueLabel: view === 'weights' ? 'Weight' : valueLabel,
    sharedScale,
    // Bars are read from the zero line, so the line has to be on the panel; a
    // spectrum sitting on a baseline would be squashed into its top third by
    // the same rule, so it is only applied where a value means a weight.
    domain: inUnits
      ? padded
      : { min: Math.min(padded.min, 0), max: Math.max(padded.max, 0) },
    view,
  };
}

function slotOrder(
  order: 'original' | 'strongest',
  weights: MatrixLike,
  width: number,
  drawn: number,
): Int32Array {
  const slots = new Int32Array(width);
  for (let index = 0; index < width; index++) slots[index] = index;
  if (order === 'original' || drawn === 0) return slots;

  // Every panel takes the order the strongest component puts the measurements
  // in. Sorting each panel to its own component would move a measurement from
  // slot to slot down the stack, and the stack is read down a column.
  const strength = new Float64Array(width);
  for (let index = 0; index < width; index++) {
    strength[index] = Math.abs(weights.get(0, index));
  }
  return slots.toSorted(
    (left, right) => (strength[right] ?? 0) - (strength[left] ?? 0),
  );
}
