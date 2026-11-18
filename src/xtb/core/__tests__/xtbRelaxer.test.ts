import type { LightLogger } from 'cheminfo-types';
import { FifoLogger } from 'fifo-logger';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { RelaxableGeometry } from '../../../structure/core/geometryRelaxer.ts';

const relaxGeometries = vi.fn();
const relaxGeometryInProcess = vi.fn();
const disposeOccPool = vi.fn();

vi.mock('xtb-wasm', () => ({
  relaxGeometries,
  relaxGeometryInProcess,
  disposeOccPool,
}));

const {
  KCAL_PER_MOL_PER_HARTREE,
  disposeXtbRelaxer,
  isXtbRelaxerAvailable,
  xtbRelaxer,
} = await import('../xtbRelaxer.ts');

/** Water, and one hartree-scale energy breakdown to hand back for it. */
const water: RelaxableGeometry = {
  elements: ['O', 'H', 'H'],
  coordinates: new Float64Array([
    0, 0, 0.117, 0, 0.757, -0.469, 0, -0.757, -0.469,
  ]),
};

beforeEach(() => {
  relaxGeometries.mockReset();
  relaxGeometryInProcess.mockReset();
  disposeOccPool.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * Pretend to be a browser. There is no `Worker` under vitest, so the pool path
 * is unreachable without this — which is itself the subject of one of the tests
 * below.
 */
function withWorkers(): void {
  vi.stubGlobal(
    'Worker',
    class {
      postMessage(): void {
        throw new Error('the pool is mocked; nothing should be posted');
      }
    },
  );
}

test('hartrees become kcal/mol, which is the unit a force-field energy is already in', async () => {
  withWorkers();
  relaxGeometries.mockResolvedValue([
    {
      coordinates: water.coordinates,
      energy: { total: -5.07, scc: -5.1, repulsion: 0.03, dispersion: -0.0001 },
      cycles: 7,
      converged: true,
      elapsedMs: 5,
    },
  ]);

  const [result] = await xtbRelaxer()([water]);

  expect(KCAL_PER_MOL_PER_HARTREE).toBe(627.509_474_063_1);
  expect(result?.energy).toBeCloseTo(-5.07 * 627.509_474_063_1, 9);
  expect(result?.energy).toBeCloseTo(-3181.473, 3);
  expect(result?.dispersionEnergy).toBeCloseTo(-0.062_750_947, 8);
  expect(result?.cycles).toBe(7);
  expect(result?.converged).toBe(true);
});

test('a method with no dispersion term keeps its null rather than reporting zero', async () => {
  withWorkers();
  relaxGeometries.mockResolvedValue([
    {
      coordinates: water.coordinates,
      energy: { total: -5, scc: null, repulsion: null, dispersion: null },
      cycles: 1,
      converged: true,
      elapsedMs: 1,
    },
  ]);

  const [result] = await xtbRelaxer()([water]);

  expect(result?.dispersionEnergy).toBeNull();
});

test('charge, spin, the cycle budget and the instance cap reach xtb-wasm', async () => {
  withWorkers();
  relaxGeometries.mockResolvedValue([]);
  const controller = new AbortController();
  const onSettled = vi.fn();

  await xtbRelaxer({
    charge: -1,
    unpairedElectrons: 1,
    maxCycles: 40,
    maxWorkers: 2,
  })([water], { onSettled, signal: controller.signal });

  expect(relaxGeometries.mock.calls[0]?.[0]).toStrictEqual([
    {
      geometry: water,
      settings: { charge: -1, unpairedElectrons: 1, maxCycles: 40 },
    },
  ]);
  expect(relaxGeometries.mock.calls[0]?.[1]).toStrictEqual({
    maxWorkers: 2,
    onSettled,
    signal: controller.signal,
    logger: undefined,
  });

  // With nothing chosen, the cycle budget is left to xtb-wasm's own default.
  await xtbRelaxer()([water]);

  expect(relaxGeometries.mock.calls[1]?.[0]).toStrictEqual([
    { geometry: water, settings: { charge: 0, unpairedElectrons: 0 } },
  ]);
});

test("the caller's logger reaches the pool, which tags each structure", async () => {
  withWorkers();
  relaxGeometries.mockResolvedValue([]);
  const logger = new FifoLogger();

  await xtbRelaxer()([water, water], { logger });

  expect(relaxGeometries.mock.calls[0]?.[1]?.logger).toBe(logger);
});

test('on this thread each structure logs under its own index', async () => {
  let call = 0;
  relaxGeometryInProcess.mockImplementation(
    async (request: unknown, options: { logger: LightLogger }) => {
      if (call++ === 1) {
        options.logger.warn('The geometry did not converge.');
        options.logger.info({ cycles: 250 }, 'The cycle budget ran out.');
        options.logger.error(new Error('The SCF wobbled.'));
      }
      return {
        coordinates: (request as { geometry: RelaxableGeometry }).geometry
          .coordinates,
        energy: { total: -1, scc: null, repulsion: null, dispersion: null },
        cycles: 2,
        converged: call !== 2,
        elapsedMs: 1,
      };
    },
  );
  const logger = new FifoLogger();

  await xtbRelaxer()([water, water], { logger });

  expect(
    logger
      .getLogs()
      .map((entry) => [entry.levelLabel, entry.message, entry.meta]),
  ).toStrictEqual([
    ['warn', 'The geometry did not converge.', { structure: 1 }],
    ['info', 'The cycle budget ran out.', { structure: 1, cycles: 250 }],
    ['error', 'The SCF wobbled.', { structure: 1 }],
  ]);
});

test('without a logger nothing is tagged, and nothing fails', async () => {
  relaxGeometryInProcess.mockImplementation(
    async (request: unknown, options: { logger?: LightLogger }) => ({
      coordinates: (request as { geometry: RelaxableGeometry }).geometry
        .coordinates,
      energy: { total: -1, scc: null, repulsion: null, dispersion: null },
      cycles: 2,
      converged: options.logger === undefined,
      elapsedMs: 1,
    }),
  );

  const results = await xtbRelaxer()([water]);

  expect(results[0]?.converged).toBe(true);
});

test('without Worker the structures run in turn on this thread', async () => {
  // vitest runs in Node, so there is no Worker: this is the fallback path.
  expect(isXtbRelaxerAvailable()).toBe(false);

  relaxGeometryInProcess.mockImplementation(async (request: unknown) => ({
    coordinates: (request as { geometry: RelaxableGeometry }).geometry
      .coordinates,
    energy: { total: -1, scc: null, repulsion: null, dispersion: null },
    cycles: 2,
    converged: true,
    elapsedMs: 1,
  }));
  const onSettled = vi.fn();

  const results = await xtbRelaxer()([water, water], { onSettled });

  expect(relaxGeometries).not.toHaveBeenCalled();
  expect(relaxGeometryInProcess).toHaveBeenCalledTimes(2);
  expect(results).toHaveLength(2);
  expect(results[0]?.energy).toBeCloseTo(-627.509_474, 6);
  expect(onSettled.mock.calls).toStrictEqual([
    [1, 2],
    [2, 2],
  ]);
});

test('an abort before the next structure gives the run up', async () => {
  const controller = new AbortController();
  relaxGeometryInProcess.mockImplementation(async (request: unknown) => {
    controller.abort();
    return {
      coordinates: (request as { geometry: RelaxableGeometry }).geometry
        .coordinates,
      energy: { total: -1, scc: null, repulsion: null, dispersion: null },
      cycles: 1,
      converged: true,
      elapsedMs: 1,
    };
  });

  await expect(
    xtbRelaxer()([water, water], { signal: controller.signal }),
  ).rejects.toThrow('calculation cancelled');
  expect(relaxGeometryInProcess).toHaveBeenCalledOnce();
});

test('disposing the relaxer drops the pool', async () => {
  withWorkers();
  relaxGeometries.mockResolvedValue([]);
  await xtbRelaxer()([water]);
  await disposeXtbRelaxer();

  expect(disposeOccPool).toHaveBeenCalledOnce();
});
