// @vitest-environment jsdom
/**
 * What pressing SDF or TXT on the molecule export saves: the file it hands the
 * browser, and what it says about the molecules it could not write.
 *
 * The molecules are read a page at a time from a generator the test writes,
 * and the file is read back off the blob the browser was given.
 */

import { afterEach, beforeAll, beforeEach, expect, test } from 'vitest';

import type { ExportProbe } from './moleculeExportProbe.tsx';
import { mountExport, pages, until } from './moleculeExportProbe.tsx';

const BENZENE = 'gFp@DiTt@@@';
const ETHANOL = 'eMHAIh@';
// The idCode of a molecule with no atom, which no file can hold.
const NOTHING = 'd@';

let probe: ExportProbe;

// The writer is imported when somebody first asks for a file, and that first
// import outlasts any wait.
beforeAll(async () => {
  await import('../../core/moleculeFile.ts');
});

beforeEach(() => {
  probe = mountExport();
});

afterEach(() => {
  probe.dispose();
});

test('an SDF holds every molecule of every page, under the name given', async () => {
  probe.render(
    pages(
      [{ idCode: BENZENE, name: 'benzene', fields: { mass: 78.11 } }],
      [{ idCode: ETHANOL, name: 'ethanol', fields: { mass: 46.07 } }],
    ),
    2,
  );

  probe.press('SDF');
  await until(() => expect(probe.files).toHaveLength(1));

  expect(probe.saved().map(({ name, type }) => [name, type])).toStrictEqual([
    ['matches today.sdf', 'chemical/x-mdl-sdfile;charset=utf-8'],
  ]);

  const text = await probe.saved()[0]?.text;

  expect(text?.match(/\$\$\$\$/g)).toHaveLength(2);
  expect(text).toContain('>  <mass>\n78.11');
  expect(text).toContain('>  <name>\nethanol');
  expect(probe.files.map(({ rows, skipped }) => [rows, skipped])).toStrictEqual(
    [[2, 0]],
  );

  await until(() => expect(probe.note()).toBe('Export'));

  expect(probe.alert()).toBeNull();
});

test('a TXT is a line per molecule, with its SMILES', async () => {
  probe.render(pages([{ idCode: BENZENE }, { idCode: ETHANOL }]));

  probe.press('TXT');
  await until(() => expect(probe.saved()).toHaveLength(1));

  expect(probe.saved()[0]?.name).toBe('matches today.txt');
  await expect(probe.saved()[0]?.text).resolves.toBe(
    `smiles\tidCode\nc1ccccc1\t${BENZENE}\nCCO\t${ETHANOL}\n`,
  );
});

test('a molecule that cannot be written is left out, and counted', async () => {
  probe.render(
    pages([{ idCode: NOTHING }, { idCode: ETHANOL }, { idCode: NOTHING }]),
  );

  probe.press('TXT');
  await until(() => expect(probe.files).toHaveLength(1));

  await expect(probe.saved()[0]?.text).resolves.toBe(
    `smiles\tidCode\nCCO\t${ETHANOL}\n`,
  );

  await until(() =>
    expect(probe.alert()).toBe(
      '2 molecules could not be written and were left out.',
    ),
  );
});

test('a single molecule left out is said in the singular', async () => {
  probe.render(pages([{ idCode: NOTHING }, { idCode: BENZENE }]));

  probe.press('SDF');
  await until(() =>
    expect(probe.alert()).toBe(
      '1 molecule could not be written and was left out.',
    ),
  );

  expect(probe.saved()).toHaveLength(1);
});

test('when no molecule can be written, nothing is saved', async () => {
  probe.render(pages([{ idCode: NOTHING }]));

  probe.press('SDF');
  await until(() =>
    expect(probe.alert()).toBe(
      'No molecule could be written, so nothing was saved.',
    ),
  );

  expect(probe.saved()).toStrictEqual([]);
  expect(probe.files).toStrictEqual([]);
});
