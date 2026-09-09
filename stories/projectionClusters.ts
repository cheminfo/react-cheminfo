/**
 * The same iris flowers grouped by what a clustering made of them rather than
 * by what they are.
 *
 * It is here, beside the rest of the fixtures, because a clustering is the
 * plainest proof that the viewer is not a principal-component tool: it hands
 * over coordinates, groups and three centres, publishes no share and no
 * weights, and gets back the same map with the same lasso and the same cards.
 *
 * The run is Lloyd's algorithm written out below rather than a dependency,
 * and it is seeded from three named flowers rather than from chance —
 * `Math.random` would move every dot between two visits of the same page, and
 * a demonstration that will not sit still is one a reader stops trusting.
 */

import type {
  ProjectionMarker,
  ProjectionResult,
  ProjectionSamples,
} from '../src/projection/core/index.ts';
import { embeddingResult } from '../src/projection/core/index.ts';

import { IRIS_PC1, IRIS_PC2, IRIS_SAMPLES } from './projectionFixtures.ts';

/** What each cluster is called, in the order they are coloured. */
const CLUSTER_NAMES: readonly string[] = [
  'Cluster 1',
  'Cluster 2',
  'Cluster 3',
];

/** Passes the algorithm is allowed before it is called settled. */
const MOST_PASSES = 40;

/**
 * The rows the starting centres are taken from: the first flower of each
 * species, which is a choice a reader can check rather than a seed they have
 * to take on trust.
 */
const SEED_ROWS: readonly number[] = [0, 50, 100];

/** Which cluster each flower fell in, as an index from 0. */
const CLUSTER_OF = lloyd(IRIS_PC1, IRIS_PC2, SEED_ROWS);

/**
 * Who the rows are once the clustering has named them.
 *
 * The first cluster comes out as the fifty setosa exactly; the other two cut
 * versicolor and virginica in a place neither species agrees with, which is
 * the honest result and a more useful demonstration than a tidy one.
 */
export const CLUSTER_SAMPLES: ProjectionSamples = {
  ids: IRIS_SAMPLES.ids,
  groups: Array.from(CLUSTER_OF, (cluster) => clusterName(cluster)),
  groupOrder: CLUSTER_NAMES,
  groupLabel: 'Cluster',
  fields: IRIS_SAMPLES.fields,
};

/** The clustering as the viewer reads it: coordinates, and a centre per cluster. */
export const CLUSTER_RESULT: ProjectionResult = embeddingResult(
  {
    rows: IRIS_PC1.length,
    columns: 2,
    get: (row: number, column: number) =>
      (column === 0 ? IRIS_PC1[row] : IRIS_PC2[row]) ?? Number.NaN,
  },
  { method: 'Clusters', names: ['PC1', 'PC2'], markers: clusterCentres() },
);

function clusterName(cluster: number): string {
  return CLUSTER_NAMES[cluster] ?? '';
}

/**
 * Lloyd's algorithm: put every sample with its nearest centre, move each
 * centre onto its samples, and stop when nothing moved.
 * @param x - Every sample's first coordinate.
 * @param y - Its second.
 * @param seeds - The rows the starting centres are taken from, one per cluster.
 * @returns Which cluster each sample fell in. On this data it settles in eight
 * passes.
 */
function lloyd(
  x: Float64Array,
  y: Float64Array,
  seeds: readonly number[],
): Int32Array {
  const centres = new Float64Array(seeds.length * 2);
  for (let cluster = 0; cluster < seeds.length; cluster++) {
    const row = seeds[cluster] ?? 0;
    centres[cluster * 2] = x[row] ?? 0;
    centres[cluster * 2 + 1] = y[row] ?? 0;
  }

  const assigned = new Int32Array(x.length).fill(-1);
  for (let pass = 0; pass < MOST_PASSES; pass++) {
    if (!assign(x, y, centres, assigned)) break;
    recentre(x, y, centres, assigned, seeds.length);
  }
  return assigned;
}

function assign(
  x: Float64Array,
  y: Float64Array,
  centres: Float64Array,
  assigned: Int32Array,
): boolean {
  let moved = false;
  for (let row = 0; row < assigned.length; row++) {
    let nearest = 0;
    let best = Number.POSITIVE_INFINITY;
    for (let cluster = 0; cluster * 2 < centres.length; cluster++) {
      const dx = (x[row] ?? 0) - (centres[cluster * 2] ?? 0);
      const dy = (y[row] ?? 0) - (centres[cluster * 2 + 1] ?? 0);
      const distance = dx * dx + dy * dy;
      if (distance < best) {
        best = distance;
        nearest = cluster;
      }
    }
    if (assigned[row] !== nearest) {
      assigned[row] = nearest;
      moved = true;
    }
  }
  return moved;
}

function recentre(
  x: Float64Array,
  y: Float64Array,
  centres: Float64Array,
  assigned: Int32Array,
  clusters: number,
): void {
  const { totals, counts } = clusterTotals(x, y, assigned, clusters);
  for (let cluster = 0; cluster < clusters; cluster++) {
    const count = counts[cluster] ?? 0;
    if (count === 0) continue;
    centres[cluster * 2] = (totals[cluster * 2] ?? 0) / count;
    centres[cluster * 2 + 1] = (totals[cluster * 2 + 1] ?? 0) / count;
  }
}

function clusterCentres(): readonly ProjectionMarker[] {
  const clusters = CLUSTER_NAMES.length;
  const { totals, counts } = clusterTotals(
    IRIS_PC1,
    IRIS_PC2,
    CLUSTER_OF,
    clusters,
  );

  const markers: ProjectionMarker[] = [];
  for (let cluster = 0; cluster < clusters; cluster++) {
    const count = Math.max(1, counts[cluster] ?? 0);
    markers.push({
      label: `Centre of ${clusterName(cluster).toLowerCase()}`,
      position: [
        (totals[cluster * 2] ?? 0) / count,
        (totals[cluster * 2 + 1] ?? 0) / count,
      ],
      group: cluster,
      shape: 'cross',
    });
  }
  return markers;
}

function clusterTotals(
  x: Float64Array,
  y: Float64Array,
  assigned: Int32Array,
  clusters: number,
): { totals: Float64Array; counts: Int32Array } {
  const totals = new Float64Array(clusters * 2);
  const counts = new Int32Array(clusters);
  for (let row = 0; row < assigned.length; row++) {
    const cluster = assigned[row] ?? 0;
    totals[cluster * 2] = (totals[cluster * 2] ?? 0) + (x[row] ?? 0);
    totals[cluster * 2 + 1] = (totals[cluster * 2 + 1] ?? 0) + (y[row] ?? 0);
    counts[cluster] = (counts[cluster] ?? 0) + 1;
  }
  return { totals, counts };
}
