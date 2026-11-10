/**
 * The clicks that become a measurement, over a real structure — acetone, as
 * molstar reads the molfile the viewer loads — with the plugin's selection
 * history stood in for: atoms are taken in the order they were clicked, a
 * click that picks no single atom is passed over, and nothing is measured
 * without a tool or a structure.
 */

import { EmptyLoci } from 'molstar/lib/mol-model/loci.js';
import type { Structure } from 'molstar/lib/mol-model/structure.js';
import { beforeAll, expect, test } from 'vitest';

import { MeasurementPicker } from '../measurements.ts';

import { acetoneStructure } from './acetone.ts';
import { atom, pair, scenePlugin, single } from './measurementStandIn.ts';

let acetone: Structure;

beforeAll(async () => {
  acetone = await acetoneStructure();
});

test('the atoms clicked while a tool is active become one measurement, in the order they were clicked', () => {
  const { plugin, log, click, picked, history } = scenePlugin();
  const picker = new MeasurementPicker(
    plugin,
    picked.push.bind(picked),
    () => acetone,
  );

  picker.setKind('angle');
  click(single(acetone, 5));
  click(single(acetone, 0));

  expect(picked).toStrictEqual([]);

  click(single(acetone, 1));

  expect(picked).toStrictEqual([
    { kind: 'angle', atoms: [atom(5), atom(0), atom(1)] },
  ]);
  expect(log).toStrictEqual([
    'granularity element',
    'selection mode on',
    'deselect all',
    'deselect all',
  ]);
  expect(history).toHaveLength(3);
});

test('a click on a bond, or on nothing, picks no atom', () => {
  const { plugin, click, picked } = scenePlugin();
  const picker = new MeasurementPicker(
    plugin,
    picked.push.bind(picked),
    () => acetone,
  );

  picker.setKind('distance');
  click(single(acetone, 2));
  click(pair(acetone, 0, 1));
  click(EmptyLoci);

  expect(picked).toStrictEqual([]);

  click(single(acetone, 3));

  expect(picked).toStrictEqual([
    { kind: 'distance', atoms: [atom(2), atom(3)] },
  ]);
});

test('with no tool, or no structure, clicks measure nothing', () => {
  const { plugin, click, picked } = scenePlugin();
  const screen: { structure?: Structure } = {};
  const picker = new MeasurementPicker(
    plugin,
    picked.push.bind(picked),
    () => screen.structure,
  );

  click(single(acetone, 0));
  click(single(acetone, 1));
  picker.setKind('distance');
  click(single(acetone, 2));

  expect(picked).toStrictEqual([]);

  screen.structure = acetone;
  picker.setKind(null);
  click(single(acetone, 3));

  expect(picked).toStrictEqual([]);
});

test('choosing the tool already chosen keeps the atoms picked, and a disposed picker stops listening', () => {
  const { plugin, log, picked, listening } = scenePlugin();
  const picker = new MeasurementPicker(
    plugin,
    picked.push.bind(picked),
    () => acetone,
  );

  picker.setKind('distance');
  picker.setKind('distance');
  picker.setKind(null);

  expect(log).toStrictEqual([
    'granularity element',
    'selection mode on',
    'deselect all',
    'selection mode off',
    'deselect all',
  ]);
  expect(listening()).toBe(true);

  picker.dispose();

  expect(listening()).toBe(false);
});
