import type { SeriesRouter } from '../../router/core/seriesRouter.ts';
import type { TabRouter } from '../../router/core/tabRouterTypes.ts';
import { useTabRoute } from '../../router/ui/useTabRoute.ts';
import type { ShareParamCodec } from '../../share/core/params.ts';
import type { SplitRange } from '../../split/core/split.ts';
import { SPLIT_PARAM } from '../../split/core/split.ts';
import type { AttemptStore } from '../core/attempts.ts';
import type { PickSeededOptions } from '../core/seed.ts';
import { parseSeed } from '../core/seed.ts';

import type { ExerciseSeriesProps } from './ExerciseSeries.tsx';

/** How a series is bound to the site's address and storage. */
export interface RoutedSeriesOptions<
  Tab extends string,
  SeriesTab extends Tab,
> {
  /** The site's practice router. */
  series: Pick<SeriesRouter<Tab, SeriesTab>, 'writeSeries' | 'writeSplit'> & {
    router: TabRouter<Tab>;
  };
  /** The page the series belongs to, whose address carries it. */
  tab: SeriesTab;
  /**
   * The parameter the series is named in.
   * @default 'seed'
   */
  seriesParam?: string;
  /** How this page's row reads its share, and where it opens. */
  split: {
    codec: ShareParamCodec<number | null>;
    opening: number;
    range: SplitRange;
  };
  /** The width under which the row is stacked. */
  stackBelow: number;
  /** Where the attempts are kept. */
  store: AttemptStore;
  /**
   * How the questions are drawn from the seed.
   * @default the series' own picking
   */
  pick?: PickSeededOptions;
  /** How many questions the visitor asked for. */
  count: number;
  /** Ask for another number of questions. */
  onCount: (count: number) => void;
}

/** The props of `<ExerciseSeries>` the address and the store decide. */
export type RoutedSeriesProps = Pick<
  ExerciseSeriesProps<unknown>,
  | 'store'
  | 'pick'
  | 'seed'
  | 'onSeed'
  | 'count'
  | 'onCount'
  | 'split'
  | 'onSplit'
  | 'defaultSplit'
  | 'splitRange'
  | 'stackBelow'
>;

/**
 * Bind a graded series to the site's address: the seed and the share of the
 * row are read from the address and written back into it, the length is the
 * visitor's preference, and the attempts are kept in the site's store.
 * @param options - The router, the page, its row and its store.
 * @returns The props to spread on `<ExerciseSeries>`.
 */
export function useRoutedSeries<Tab extends string, SeriesTab extends Tab>(
  options: RoutedSeriesOptions<Tab, SeriesTab>,
): RoutedSeriesProps {
  const { series, tab, split, seriesParam = 'seed' } = options;
  const { store, pick, count, onCount, stackBelow } = options;
  const route = useTabRoute(series.router);
  return {
    store,
    ...(pick ? { pick } : {}),
    seed: parseSeed(route.params[seriesParam]),
    onSeed: (seed, history) => {
      series.writeSeries(tab, seed, history);
    },
    count,
    onCount,
    split: split.codec.parse(route.params[SPLIT_PARAM] ?? null),
    onSplit: (share) => {
      series.writeSplit(tab, share);
    },
    defaultSplit: split.opening,
    splitRange: split.range,
    stackBelow,
  };
}
