import { useMemo } from 'react';

import type { ScreenPoints } from '../core/screenPoints.ts';

import type { ScatterGroup } from './scatterFigureProps.ts';
import {
  SCATTER_GROUP_LABEL_SIZE,
  SCATTER_LABEL_SIZE,
} from './scatterLabelBoxes.ts';
import type { PlacedScatterLabel } from './scatterLabelPlacement.ts';
import { placeScatterLabels } from './scatterLabelPlacement.ts';
import { scatterGroupLabels, scatterPointLabels } from './scatterLabels.ts';

/** What {@link useScatterLabels} places. */
interface ScatterLabelsOptions {
  /** What each point is called, or nothing when no point is named. */
  pointLabels: ReadonlyArray<string | undefined> | undefined;
  /** Whether each group's name is written over its own crowd. */
  showGroupLabels: boolean;
  /** The groups, whose names a crowd is written with. */
  groups: readonly ScatterGroup[] | undefined;
  /** Which group each point belongs to. */
  groupOf: ArrayLike<number> | undefined;
  /** The colour of each group, which its words take. */
  colors: readonly string[];
  /** Radius of a dot, which a word stands clear of. */
  radius: number;
  /** The rectangle every word has to stay inside. */
  bounds: { x: number; y: number; width: number; height: number };
}

/** The words a scatter figure writes, already seated. */
export interface ScatterLabels {
  /** Each named point's own name, or nothing when no point is named. */
  named: readonly PlacedScatterLabel[] | undefined;
  /** Each group's name, or nothing when group names are off. */
  crowds: readonly PlacedScatterLabel[] | undefined;
}

/**
 * The names a scatter figure writes, placed so that no two overlap.
 *
 * Both figures place their words the same way from the same screen positions,
 * so a name moves with its dot on the map and in the turning cloud alike. The
 * placing runs only when the positions or the words change, never on a hover.
 * @param points - Where every point sits, in the figure's pixels.
 * @param options - See {@link ScatterLabelsOptions}.
 * @returns The seated words. See {@link ScatterLabels}.
 */
export function useScatterLabels(
  points: ScreenPoints,
  options: ScatterLabelsOptions,
): ScatterLabels {
  const { pointLabels, showGroupLabels, groups, groupOf } = options;
  const { colors, radius, bounds } = options;

  const named = useMemo(
    () =>
      pointLabels === undefined
        ? undefined
        : placeScatterLabels(
            scatterPointLabels(points, pointLabels, { groupOf, colors }),
            { fontSize: SCATTER_LABEL_SIZE, radius, bounds },
          ),
    [points, pointLabels, groupOf, colors, radius, bounds],
  );
  const crowds = useMemo(
    () =>
      showGroupLabels && groups !== undefined
        ? placeScatterLabels(
            scatterGroupLabels(
              points,
              groups.map((group) => group.label),
              { groupOf, colors },
            ),
            {
              fontSize: SCATTER_GROUP_LABEL_SIZE,
              bold: true,
              centered: true,
              radius,
              bounds,
            },
          )
        : undefined,
    [points, showGroupLabels, groups, groupOf, colors, radius, bounds],
  );
  return { named, crowds };
}
