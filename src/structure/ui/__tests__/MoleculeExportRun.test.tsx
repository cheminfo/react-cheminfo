// @vitest-environment jsdom
/**
 * The molecule export while it runs: how far it says it has got, and how it
 * stops — when it is cancelled, when the page goes away, and when a page of
 * molecules cannot be read.
 *
 * The molecules are read from a generator the test writes, which hands over
 * one page and then waits, so a run can be held half way.
 */

import { afterEach, beforeAll, beforeEach, expect, test } from 'vitest';

import type { ExportProbe, ExportRead } from './moleculeExportProbe.tsx';
import { mountExport, until } from './moleculeExportProbe.tsx';

const BENZENE = 'gFp@DiTt@@@';
const ETHANOL = 'eMHAIh@';

let probe: ExportProbe;

beforeAll(async () => {
  await import('../../core/moleculeFile.ts');
});

beforeEach(() => {
  probe = mountExport();
});

afterEach(() => {
  probe.dispose();
});

test('a failed read stops the export and says why', async () => {
  probe.render(async function* read() {
    yield [{ idCode: BENZENE }];
    throw new Error('the server went away');
  });

  probe.press('SDF');
  await until(() =>
    expect(probe.alert()).toBe(
      'The export stopped and nothing was saved: the server went away.',
    ),
  );

  expect(probe.saved()).toStrictEqual([]);
  expect(probe.note()).toBe('Export up to 10,000');
});

test('the run says how far it has got, and Cancel stops it without a word', async () => {
  const run = heldRead();
  probe.render(run.read, 3);

  probe.press('SDF');
  await until(() => expect(run.signals).toHaveLength(1));

  expect(probe.note()).toBe('0 of 3');

  probe.press('Cancel');

  expect(run.signals[0]?.aborted).toBe(true);

  run.release();
  await until(() => expect(probe.note()).toBe('Export'));

  expect(probe.saved()).toStrictEqual([]);
  expect(probe.alert()).toBeNull();
});

test('leaving the page stops an export still running', async () => {
  const run = heldRead();
  probe.render(run.read);

  probe.press('SDF');
  await until(() => expect(run.signals).toHaveLength(1));
  probe.leave();

  expect(run.signals[0]?.aborted).toBe(true);
});

/** A read that hands over one page, then waits to be let go on. */
interface HeldRead {
  read: ExportRead;
  signals: AbortSignal[];
  release: () => void;
}

function heldRead(): HeldRead {
  const signals: AbortSignal[] = [];
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  return {
    signals,
    release: () => release?.(),
    read: (signal) => {
      signals.push(signal);
      return (async function* read() {
        yield [{ idCode: BENZENE }];
        await held;
        yield [{ idCode: ETHANOL }];
      })();
    },
  };
}
