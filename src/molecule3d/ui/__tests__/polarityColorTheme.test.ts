/**
 * The polarity colour theme read atom by atom over structures molstar parsed
 * from molfiles, the way the viewer loads them: a formal charge decides first,
 * then nitrogen and oxygen are the negative end and a hydrogen on either the
 * positive one.
 */

import { OrderedSet } from 'molstar/lib/mol-data/int.js';
import { parseMol } from 'molstar/lib/mol-io/reader/mol/parser.js';
import { NullLocation } from 'molstar/lib/mol-model/location.js';
import {
  Structure,
  StructureElement,
} from 'molstar/lib/mol-model/structure.js';
import { trajectoryFromMol } from 'molstar/lib/mol-model-formats/structure/mol.js';
import { Task } from 'molstar/lib/mol-task/index.js';
import type { ColorTheme } from 'molstar/lib/mol-theme/color.js';
import { Color } from 'molstar/lib/mol-util/color/color.js';
import { assert, expect, test } from 'vitest';

import { SURFACE_CHARGE_COLORS } from '../../core/settings.ts';
import {
  POLARITY_COLOR_THEME,
  polarityColorThemeProvider,
  registerPolarityTheme,
} from '../polarityColorTheme.ts';

const SIGN_OF_COLOR = new Map([
  [Color.fromHexStyle(SURFACE_CHARGE_COLORS.positive), '+'],
  [Color.fromHexStyle(SURFACE_CHARGE_COLORS.negative), '-'],
  [Color.fromHexStyle(SURFACE_CHARGE_COLORS.neutral), '0'],
]);

/** Methanol: C1, O2, the three hydrogens of C1, then the hydrogen of O2. */
const METHANOL = molfile(
  'methanol',
  [
    ['C', 0, 0, 0],
    ['O', 1.4, 0, 0],
    ['H', -0.4, 1, 0],
    ['H', -0.4, -0.5, 0.9],
    ['H', -0.4, -0.5, -0.9],
    ['H', 1.7, 0.9, 0],
  ],
  [
    [1, 2, 1],
    [1, 3, 1],
    [1, 4, 1],
    [1, 5, 1],
    [2, 6, 1],
  ],
);

/**
 * Glycine as a zwitterion: N1⁺, C2, the carboxyl C3 with O4 and O5⁻, the three
 * hydrogens of N1, then the two of C2.
 */
const GLYCINE = molfile(
  'glycine',
  [
    ['N', 0, 0, 0],
    ['C', 1.5, 0, 0],
    ['C', 2.1, 1.4, 0],
    ['O', 1.4, 2.4, 0],
    ['O', 3.4, 1.4, 0],
    ['H', -0.3, -1, 0],
    ['H', -0.3, 0.5, 0.8],
    ['H', -0.3, 0.5, -0.8],
    ['H', 1.8, -0.5, 0.9],
    ['H', 1.8, -0.5, -0.9],
  ],
  [
    [1, 2, 1],
    [2, 3, 1],
    [3, 4, 2],
    [3, 5, 1],
    [1, 6, 1],
    [1, 7, 1],
    [1, 8, 1],
    [2, 9, 1],
    [2, 10, 1],
  ],
  'M  CHG  2   1   1   5  -1',
);

test('oxygen is the negative end of methanol and the hydrogen on it the positive one', async () => {
  const structure = await structureOf(METHANOL);

  expect(signs(theme(structure), structure)).toBe('0-000+');
});

test('a formal charge decides before the element does', async () => {
  const structure = await structureOf(GLYCINE);

  expect(signs(theme(structure), structure)).toBe('+00--+++00');
});

test('a theme made without a structure paints every atom grey', async () => {
  const structure = await structureOf(METHANOL);

  expect(signs(theme(undefined), structure)).toBe('000000');
});

test('anything that is not an atom is grey', () => {
  const color = theme(undefined).color(NullLocation, false);

  expect(SIGN_OF_COLOR.get(color)).toBe('0');
});

test('the theme colours by atom, smoothly, and says what its colours mean', async () => {
  const made = theme(await structureOf(METHANOL));

  expect({
    granularity: made.granularity,
    preferSmoothing: made.preferSmoothing,
    description: made.description,
  }).toStrictEqual({
    granularity: 'group',
    preferSmoothing: true,
    description: 'Positive end in red, negative end in blue, the rest in grey.',
  });
});

test('the theme applies only where there is a structure', async () => {
  const structure = await structureOf(METHANOL);

  expect(polarityColorThemeProvider.isApplicable({ structure })).toBe(true);
  expect(polarityColorThemeProvider.isApplicable({})).toBe(false);
});

test('registering the theme twice adds it once', () => {
  const added: string[] = [];
  const registry = {
    has: (provider: { name: string }) => added.includes(provider.name),
    add: (provider: { name: string }) => {
      added.push(provider.name);
    },
  } as unknown as ColorTheme.Registry;

  registerPolarityTheme(registry);
  registerPolarityTheme(registry);

  expect(added).toStrictEqual([POLARITY_COLOR_THEME]);
});

function theme(structure: Structure | undefined) {
  const made = polarityColorThemeProvider.factory(
    { structure },
    polarityColorThemeProvider.defaultValues,
  );
  assert('color' in made, 'the theme colours by location');
  return made;
}

/**
 * The sign the theme paints each atom, in file order.
 * @param made - The theme.
 * @param structure - The atoms to read it at.
 * @returns One character per atom: `+`, `-` or `0`.
 */
function signs(made: ReturnType<typeof theme>, structure: Structure): string {
  let text = '';
  for (const unit of structure.units) {
    const { elements } = unit;
    for (let index = 0; index < OrderedSet.size(elements); index++) {
      const location = StructureElement.Location.create(
        structure,
        unit,
        OrderedSet.getAt(elements, index),
      );
      text += SIGN_OF_COLOR.get(made.color(location, false)) ?? '?';
    }
  }
  return text;
}

async function structureOf(text: string): Promise<Structure> {
  const parsed = await parseMol(text).run();
  if (parsed.isError) throw new Error(parsed.message);
  const trajectory = await trajectoryFromMol(parsed.result).run();
  const model = await Task.resolveInContext(trajectory.getFrameAtIndex(0));
  return Structure.ofModel(model);
}

/**
 * A V2000 molfile.
 * @param name - Its title line.
 * @param atoms - Element and coordinates of each atom.
 * @param bonds - Each bond as first atom, second atom and order, from 1.
 * @param properties - Property lines written before `M  END`.
 * @returns The molfile.
 */
function molfile(
  name: string,
  atoms: Array<[string, number, number, number]>,
  bonds: Array<[number, number, number]>,
  properties = '',
): string {
  const lines = [
    name,
    '  test',
    '',
    `${count(atoms.length)}${count(bonds.length)}  0  0  0  0  0  0  0  0999 V2000`,
  ];
  for (const [symbol, x, y, z] of atoms) {
    lines.push(
      `${coordinate(x)}${coordinate(y)}${coordinate(z)} ${symbol.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`,
    );
  }
  for (const [first, second, order] of bonds) {
    lines.push(`${count(first)}${count(second)}${count(order)}  0  0  0  0`);
  }
  if (properties !== '') lines.push(properties);
  lines.push('M  END', '');
  return lines.join('\n');
}

function count(value: number): string {
  return String(value).padStart(3);
}

function coordinate(value: number): string {
  return value.toFixed(4).padStart(10);
}
