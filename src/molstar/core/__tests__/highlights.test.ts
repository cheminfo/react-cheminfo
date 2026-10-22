/**
 * Which atoms and bonds a highlight paints, read the way molstar's own visuals
 * read an overpaint — so the C–H ×6 rule is checked against the very code that
 * would otherwise tint a C–C bond, without a WebGL canvas.
 */

import { Interval } from 'molstar/lib/mol-data/int.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import { Unit } from 'molstar/lib/mol-model/structure.js';
import { eachIntraBond } from 'molstar/lib/mol-repr/structure/visual/util/bond.js';
import { eachElement } from 'molstar/lib/mol-repr/structure/visual/util/element.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';
import { assert, expect, test } from 'vitest';

import type { Molecule3DHighlight } from '../../../molecule3d/core/highlight.ts';
import type { AtomReference } from '../../../molecule3d/core/measurement.ts';
import { highlightOverpaint } from '../highlights.ts';

import { acetoneStructure } from './acetone.ts';

const ACCENT = Color.fromHexStyle('#0d9488');

/** The "C–H ×6" row of acetone: every bond to a hydrogen, a path each. */
const SIX_C_H: Molecule3DHighlight[] = [
  [0, 4],
  [0, 5],
  [0, 6],
  [3, 7],
  [3, 8],
  [3, 9],
].map(path);

test('six C–H paths paint their eight atoms and exactly their six bonds', async () => {
  const painted = paintedParts(await acetoneStructure(), SIX_C_H);

  expect(painted).toStrictEqual({
    atoms: [0, 3, 4, 5, 6, 7, 8, 9],
    halfBonds: [
      '0→4',
      '0→5',
      '0→6',
      '3→7',
      '3→8',
      '3→9',
      '4→0',
      '5→0',
      '6→0',
      '7→3',
      '8→3',
      '9→3',
    ],
  });
});

test('an angle paints its two bonds, and the C=O beside them stays as it was', async () => {
  const painted = paintedParts(await acetoneStructure(), [path([0, 1, 3])]);

  expect(painted).toStrictEqual({
    atoms: [0, 1, 3],
    halfBonds: ['0→1', '1→0', '1→3', '3→1'],
  });
});

test('a bond between atoms of two different rows is not painted', async () => {
  // C1 and C2 are bonded, and both are highlighted, by different paths.
  const painted = paintedParts(await acetoneStructure(), [
    path([0, 4]),
    path([1, 2]),
  ]);

  expect(painted).toStrictEqual({
    atoms: [0, 1, 2, 4],
    halfBonds: ['0→4', '1→2', '2→1', '4→0'],
  });
});

test('a pair the structure does not bond paints its two atoms alone', async () => {
  const painted = paintedParts(await acetoneStructure(), [path([4, 7])]);

  expect(painted).toStrictEqual({ atoms: [4, 7], halfBonds: [] });
});

test('atoms the structure lacks are skipped, never thrown', async () => {
  const structure = await acetoneStructure();

  const painted = paintedParts(structure, [
    path([0, 10]),
    { atoms: [{ unit: 3, element: 0 }] },
  ]);

  expect(painted).toStrictEqual({ atoms: [0], halfBonds: [] });

  const nothing = highlightOverpaint(
    structure,
    [{ atoms: [{ unit: 0, element: 10 }] }],
    ACCENT,
  );

  expect(nothing.layers).toStrictEqual([]);
});

test('the layers paint the atoms, clear what leaves them, then paint the bonds', async () => {
  const overpaint = highlightOverpaint(
    await acetoneStructure(),
    SIX_C_H,
    ACCENT,
  );

  expect(
    overpaint.layers.map(({ loci, color, clear }) => [loci.kind, color, clear]),
  ).toStrictEqual([
    ['element-loci', ACCENT, false],
    ['bond-loci', ACCENT, true],
    ['bond-loci', ACCENT, false],
  ]);
  // Not `element-loci`, or molstar would remap the bond layers as atoms.
  expect(overpaint.kind).toBe('bond-loci');
});

test('nothing highlighted is no overpaint at all', async () => {
  expect(
    highlightOverpaint(await acetoneStructure(), [], ACCENT).layers,
  ).toStrictEqual([]);
});

interface PaintedParts {
  /** The atoms left painted, by their index in the unit. */
  atoms: number[];
  /** The half-bonds left painted, as `from→to`. */
  halfBonds: string[];
}

/**
 * Apply an overpaint the way molstar's ball-and-stick visuals do — every
 * layer in turn, painting or clearing what its loci reaches — and say what is
 * left painted.
 * @param structure - The structure the highlights name atoms of.
 * @param highlights - The paths.
 * @returns The atoms and the half-bonds painted once every layer is applied.
 */
function paintedParts(
  structure: Structure,
  highlights: readonly Molecule3DHighlight[],
): PaintedParts {
  const group = structure.unitSymmetryGroups[0];
  const unit = group?.units[0];
  assert(group !== undefined && unit !== undefined && Unit.isAtomic(unit));
  const structureGroup = { structure, group };
  const atoms = new Set<number>();
  const halfBonds = new Set<number>();
  const overpaint = highlightOverpaint(structure, highlights, ACCENT);
  for (const { loci, clear } of overpaint.layers) {
    eachElement(loci, structureGroup, apply(atoms, clear));
    eachIntraBond(loci, structureGroup, apply(halfBonds, clear), false);
  }
  const { a, b } = unit.bonds;
  const named: string[] = [];
  for (const edge of halfBonds) named.push(`${a[edge]}→${b[edge]}`);
  return {
    atoms: [...atoms].toSorted((first, second) => first - second),
    halfBonds: named.toSorted(),
  };
}

function apply(
  painted: Set<number>,
  clear: boolean,
): (interval: Interval) => boolean {
  return (interval) => {
    const end = Interval.end(interval);
    for (let index = Interval.start(interval); index < end; index++) {
      if (clear) painted.delete(index);
      else painted.add(index);
    }
    return true;
  };
}

function path(elements: number[]): Molecule3DHighlight {
  const atoms: AtomReference[] = [];
  for (const element of elements) atoms.push({ unit: 0, element });
  return { atoms };
}
