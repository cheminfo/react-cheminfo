/**
 * The three rods of the cartesian frame: one group per axis, each running
 * through the origin to `ROD_LENGTH` of the reach on both sides, thin, and
 * flaring into an arrowhead only at its positive end.
 *
 * The letters beside them are text, which molstar rasterises through a 2D
 * canvas, so they are left to the browser suites.
 */

import type { Mesh } from 'molstar/lib/mol-geo/geometry/mesh/mesh.js';
import { expect, test } from 'vitest';

import { ROD_LENGTH, buildAxisRods } from '../axesGeometry.ts';

const REACH = 10;

test('each axis is one group, the three drawn alike', () => {
  const axes = axesOf(buildAxisRods(REACH));

  expect(axes.map((axis) => axis.group)).toStrictEqual([0, 1, 2]);
  expect(axes[1]?.vertices).toBe(axes[0]?.vertices);
  expect(axes[2]?.vertices).toBe(axes[0]?.vertices);
});

test('each rod runs along its own axis, from minus to plus the rod length', () => {
  const axes = axesOf(buildAxisRods(REACH));

  for (const axis of axes) {
    expect(axis.along[0]).toBeCloseTo(-REACH * ROD_LENGTH, 4);
    expect(axis.along[1]).toBeCloseTo(REACH * ROD_LENGTH, 4);
  }
});

test('a rod is thin, and only its arrowhead flares, at the positive end', () => {
  const axes = axesOf(buildAxisRods(REACH));

  for (const axis of axes) {
    // The rod is 0.006 of the reach in radius, the arrowhead four times that.
    expect(axis.widestBelowZero).toBeCloseTo(0.06, 4);
    expect(axis.widest).toBeCloseTo(0.24, 4);
  }
});

test('the frame scales with the reach', () => {
  const [small] = axesOf(buildAxisRods(1));
  const [large] = axesOf(buildAxisRods(100));

  expect(small?.along[1]).toBeCloseTo(ROD_LENGTH, 5);
  expect(large?.along[1]).toBeCloseTo(100 * ROD_LENGTH, 3);
  expect(large?.widest).toBeCloseTo(2.4, 3);
});

interface AxisExtent {
  group: number;
  vertices: number;
  /** Lowest and highest coordinate along the axis itself. */
  along: [number, number];
  /** Furthest any vertex stands from the axis. */
  widest: number;
  /** Furthest any vertex on the negative half stands from the axis. */
  widestBelowZero: number;
}

/**
 * Measure the mesh group by group: group `i` is read against axis `i`.
 * @param mesh - The rods.
 * @returns One extent per group, in group order.
 */
function axesOf(mesh: Mesh): AxisExtent[] {
  const positions = mesh.vertexBuffer.ref.value;
  const groups = mesh.groupBuffer.ref.value;
  const extents = new Map<number, AxisExtent>();
  for (let vertex = 0; vertex < mesh.vertexCount; vertex++) {
    const group = groups[vertex] ?? -1;
    const point = [
      positions[3 * vertex] ?? 0,
      positions[3 * vertex + 1] ?? 0,
      positions[3 * vertex + 2] ?? 0,
    ];
    const along = point[group] ?? 0;
    let across = 0;
    for (let axis = 0; axis < 3; axis++) {
      if (axis !== group) across = Math.hypot(across, point[axis] ?? 0);
    }
    const extent = extents.get(group) ?? {
      group,
      vertices: 0,
      along: [along, along],
      widest: 0,
      widestBelowZero: 0,
    };
    extent.vertices++;
    extent.along = [
      Math.min(extent.along[0], along),
      Math.max(extent.along[1], along),
    ];
    extent.widest = Math.max(extent.widest, across);
    if (along < 0) {
      extent.widestBelowZero = Math.max(extent.widestBelowZero, across);
    }
    extents.set(group, extent);
  }
  return [...extents.values()].toSorted((a, b) => a.group - b.group);
}
