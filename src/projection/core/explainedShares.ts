import { chartSeriesColor } from '../../chart/core/chartPalette.ts';

import type { ProjectionAxis } from './projectionResult.ts';

/** One bar of the "how much each explains" tab. */
export interface ComponentShare {
  /** The number written on the axis, counting from one. */
  number: number;
  /** What it is called, e.g. `PC 3`. */
  label: string;
  /** Its colour, the same one it carries on every other tab. */
  color: string;
  /** Its own share, between 0 and 1. */
  share: number;
  /** Everything up to and including it, between 0 and 1. */
  cumulative: number;
  /**
   * The variance of its scores, for the fine print of a hover card.
   * @default undefined
   */
  eigenvalue?: number;
}

/** Everything the "how much each explains" tab draws. */
export interface ExplainedShares {
  /** One entry per component, largest first. */
  components: readonly ComponentShare[];
  /** The cumulative share the marker aims at; `0` draws no marker. */
  target: number;
  /**
   * The number, counting from one, of the first component reaching the target,
   * or `null` when none of them does.
   */
  reachesTargetAt: number | null;
}

/** How {@link explainedShares} builds its bars. */
export interface ExplainedSharesOptions {
  /**
   * The cumulative share the marker aims at; `0` draws none.
   * @default 0.95
   */
  target?: number;
}

/**
 * The bars of the "how much each explains" tab.
 *
 * The running total is accumulated here rather than read from the model, so a
 * result from any method reaches the tab the same way, and so the last value
 * is a real 1 rather than the 1.0000000000000002 a floating-point sum returns.
 * @param axes - The axes, in order; every one must carry a share.
 * @param options - See {@link ExplainedSharesOptions}.
 * @returns The bars.
 */
export function explainedShares(
  axes: readonly ProjectionAxis[],
  options: ExplainedSharesOptions = {},
): ExplainedShares {
  const { target = DEFAULT_TARGET } = options;
  const aim = Number.isFinite(target) ? Math.min(1, Math.max(0, target)) : 0;

  const components: ComponentShare[] = [];
  let running = 0;
  for (let index = 0; index < axes.length; index++) {
    const axis = axes[index];
    if (axis === undefined) continue;
    // An axis that publishes no share stands at zero rather than stopping the
    // tab: the tab is only offered when every axis has one, so this is the
    // shape a caller reaches by asking for it anyway.
    const share = Number.isFinite(axis.share)
      ? Math.max(0, axis.share ?? 0)
      : 0;
    running += share;
    components.push({
      number: index + 1,
      label: axis.name,
      color: chartSeriesColor(index, 'component'),
      share,
      cumulative: running,
      eigenvalue: axis.eigenvalue,
    });
  }

  const last = components.at(-1);
  if (last !== undefined && Math.abs(running - 1) < ROUNDING) {
    last.cumulative = 1;
  }

  let reachesTargetAt: number | null = null;
  if (aim > 0) {
    for (const component of components) {
      if (component.cumulative >= aim) {
        reachesTargetAt = component.number;
        break;
      }
    }
  }
  return { components, target: aim, reachesTargetAt };
}

const DEFAULT_TARGET = 0.95;

/** How far off 1 a whole model's shares may land and still be a whole model. */
const ROUNDING = 1e-9;
