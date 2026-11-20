/**
 * The partial bonds the viewer finds in what molstar reads: the atoms, the
 * frame on screen and the bonds molstar itself drew, without a WebGL canvas.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseXyz } from 'molstar/lib/mol-io/reader/xyz/parser.js';
import { Shape } from 'molstar/lib/mol-model/shape.js';
import { Structure } from 'molstar/lib/mol-model/structure.js';
import { trajectoryFromXyz } from 'molstar/lib/mol-model-formats/structure/xyz.js';
import { Task } from 'molstar/lib/mol-task/index.js';
import { ColorTheme } from 'molstar/lib/mol-theme/color.js';
import { SizeTheme } from 'molstar/lib/mol-theme/size.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';
import { assert, expect, test } from 'vitest';

import { acetoneStructure } from '../../../molstar/core/__tests__/acetone.ts';
import {
  createPartialBondRepresentation,
  partialBondScene,
} from '../partialBondShapes.ts';
import { structureGeometry } from '../structureGeometry.ts';

const DATA = join(import.meta.dirname, '../../core/__tests__/data');

test('the forming bonds of a Diels–Alder transition state, read by molstar', async () => {
  const [structure] = await xyzStructures(fixture('diels-alder-ts.xyz'));
  const scene = partialBondScene(structure as Structure);

  expect(scene.elements.slice(0, 7)).toStrictEqual([
    'C',
    'C',
    'C',
    'C',
    'C',
    'C',
    'H',
  ]);
  expect(described(scene)).toStrictEqual(['0–5 2.270', '3–4 2.270']);
});

test('molstar bonds benzene by itself, and leaves no partial bond', async () => {
  const [structure] = await xyzStructures(fixture('benzene.xyz'));
  const geometry = structureGeometry(structure as Structure);

  // Six C–C and six C–H, each once.
  expect(geometry.bonds).toHaveLength(24);
  expect(partialBondScene(structure as Structure).bonds).toStrictEqual([]);
});

test('every frame is read at its own coordinates', async () => {
  // Cl- leaving CH3Cl, then gone: bonded, partially bonded, then too far.
  const frames = [1.8, 2.32, 2.9].map(
    (distance) =>
      `5\nC-Cl ${distance}\nC 0 0 0\nCl 0 0 ${distance}\nH 1.03 0 -0.36\nH -0.515 0.892 -0.36\nH -0.515 -0.892 -0.36\n`,
  );
  const structures = await xyzStructures(frames.join(''));

  expect(
    structures.map((frame) => described(partialBondScene(frame))),
  ).toStrictEqual([[], ['0–1 2.320'], []]);
});

test('a molfile keeps the bonds it writes, and has no partial bond', async () => {
  const scene = partialBondScene(await acetoneStructure());

  expect(scene.elements).toHaveLength(10);
  expect(scene.bonds).toStrictEqual([]);
});

test('each half of a dash is coloured as its atom, and named after the pair', async () => {
  const [structure] = await xyzStructures(fixture('sn2-ts.xyz'));
  const scene = partialBondScene(structure as Structure);
  const representation = createPartialBondRepresentation({
    colorThemeRegistry: ColorTheme.createRegistry(),
    sizeThemeRegistry: SizeTheme.createRegistry(),
  });

  await representation
    .createOrUpdate({ visuals: ['dashes'], radius: 0.1 }, scene)
    .run();

  expect(representation.renderObjects).toHaveLength(1);
  expect(representation.groupCount).toBe(4);

  const [loci] = representation.getAllLoci();
  assert(loci !== undefined && Shape.isLoci(loci));
  const { shape } = loci;

  expect(Color.toHexStyle(shape.getColor(0, 0))).toBe('#909090');
  expect(Color.toHexStyle(shape.getColor(1, 0))).toBe('#1ff01f');
  expect(shape.getLabel(3, 0)).toBe('C1–Cl3 2.32 Å');
});

function described(scene: ReturnType<typeof partialBondScene>): string[] {
  return scene.bonds.map(
    ({ first, second, distance }) =>
      `${first}–${second} ${distance.toFixed(3)}`,
  );
}

function fixture(name: string): string {
  return new TextDecoder().decode(readFileSync(join(DATA, name)));
}

/**
 * Every frame of an XYZ text, as molstar reads it for the viewer.
 * @param text - The file.
 * @returns One structure per frame.
 */
async function xyzStructures(text: string): Promise<Structure[]> {
  const parsed = await parseXyz(text).run();
  if (parsed.isError) throw new Error(parsed.message);
  const trajectory = await trajectoryFromXyz(parsed.result).run();
  const structures: Structure[] = [];
  for (let frame = 0; frame < trajectory.frameCount; frame++) {
    // eslint-disable-next-line no-await-in-loop -- molstar reads the frames one after another
    const model = await Task.resolveInContext(
      trajectory.getFrameAtIndex(frame),
    );
    structures.push(Structure.ofModel(model));
  }
  return structures;
}
