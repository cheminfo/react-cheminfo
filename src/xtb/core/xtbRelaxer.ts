import type * as XtbWasm from 'xtb-wasm';

import { errorMessage } from '../../error/core/toError.ts';
import type {
  GeometryRelaxer,
  RelaxableGeometry,
  RelaxedGeometry,
  RelaxerOptions,
} from '../../structure/core/geometryRelaxer.ts';

/**
 * kcal/mol per hartree, CODATA 2018. Every energy a relaxer reports is in
 * kcal/mol, so it can be read against a force-field energy without the reader
 * converting anything.
 */
export const KCAL_PER_MOL_PER_HARTREE = 627.509_474_063_1;

/** How many occjs instances a relaxation may use. */
export interface XtbRelaxerOptions {
  /**
   * Hard cap on the number of GFN2 instances. Each one costs about 100 MB of
   * WebAssembly memory, so a long batch on a small machine is worth capping.
   * @default one per structure, one below the core count
   */
  maxWorkers?: number;
  /**
   * Total molecular charge in units of e, applied to every structure.
   * @default 0
   */
  charge?: number;
  /**
   * Unpaired electrons, applied to every structure. `1` for a doublet radical.
   * @default 0
   */
  unpairedElectrons?: number;
  /**
   * Cycle budget of one optimization.
   * @default 250
   */
  maxCycles?: number;
}

/**
 * GFN2-xTB as a {@link GeometryRelaxer}: the second stage that decides how good
 * a force field's conformers really are.
 *
 * `xtb-wasm` is loaded on the **first call**, never on the import, so a page that
 * offers refinement as an action downloads the 21.5 MB WebAssembly only once a
 * visitor asks for it. The module is cached afterwards, and the worker pool it
 * starts is kept alive between calls.
 *
 * Energies come back in kcal/mol, which is the unit `conformer.energy` is
 * already in.
 * @param options - Instance cap, charge, spin and the cycle budget.
 * @returns A relaxer to hand to `refineConformers`, or to call directly.
 */
export function xtbRelaxer(options: XtbRelaxerOptions = {}): GeometryRelaxer {
  return async (
    geometries: readonly RelaxableGeometry[],
    runOptions: RelaxerOptions = {},
  ): Promise<RelaxedGeometry[]> => {
    const xtb = await loadXtb();
    const settings = {
      charge: options.charge ?? 0,
      unpairedElectrons: options.unpairedElectrons ?? 0,
      ...(options.maxCycles === undefined
        ? {}
        : { maxCycles: options.maxCycles }),
    };
    const requests = geometries.map((geometry) => ({ geometry, settings }));
    const results = isXtbRelaxerAvailable()
      ? await xtb.relaxGeometries(requests, {
          maxWorkers: options.maxWorkers,
          onSettled: runOptions.onSettled,
          signal: runOptions.signal,
        })
      : await relaxHere(xtb, requests, runOptions);
    const relaxed: RelaxedGeometry[] = [];
    for (const result of results) {
      relaxed.push({
        coordinates: result.coordinates,
        energy: result.energy.total * KCAL_PER_MOL_PER_HARTREE,
        dispersionEnergy:
          result.energy.dispersion === null
            ? null
            : result.energy.dispersion * KCAL_PER_MOL_PER_HARTREE,
        cycles: result.cycles,
        converged: result.converged,
        warnings: result.warnings,
      });
    }
    return relaxed;
  };
}

/**
 * Whether this environment has the worker pool the relaxer prefers.
 *
 * Without `Worker` — Node, a prerender pass, a test run — the relaxer still
 * works, one structure at a time on the calling thread, so a site keeps one code
 * path. It is the caller's business only when the difference in speed matters.
 * @returns `true` in a browser, `false` in a plain Node process.
 */
export function isXtbRelaxerAvailable(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Drop the GFN2 worker pool and the memory it holds, about 100 MB per instance.
 * The next relaxation starts a fresh one.
 */
export async function disposeXtbRelaxer(): Promise<void> {
  const loaded = await pending;
  loaded?.disposeOccPool();
}

/**
 * Relax one structure after another on this thread, for want of a pool.
 * @param xtb - The loaded `xtb-wasm` module.
 * @param requests - The structures to relax, with their settings.
 * @param runOptions - Progress and cancellation.
 * @returns One `xtb-wasm` result per request, in request order.
 * @throws {Error} When the run is cancelled, or when occ fails.
 */
async function relaxHere(
  xtb: XtbModule,
  requests: ReadonlyArray<Parameters<XtbModule['relaxGeometryInProcess']>[0]>,
  runOptions: RelaxerOptions,
): Promise<Array<Awaited<ReturnType<XtbModule['relaxGeometryInProcess']>>>> {
  const results = [];
  for (const [index, request] of requests.entries()) {
    if (runOptions.signal?.aborted === true) {
      throw new Error('calculation cancelled');
    }
    /* eslint-disable-next-line no-await-in-loop -- there is one thread: the
       whole point of this path is that the structures run in turn. */
    results.push(await xtb.relaxGeometryInProcess(request));
    runOptions.onSettled?.(index + 1, requests.length);
  }
  return results;
}

type XtbModule = typeof XtbWasm;

let pending: Promise<XtbModule> | null = null;

function loadXtb(): Promise<XtbModule> {
  pending ??= import('xtb-wasm').catch((error: unknown) => {
    // A failed chunk load must not poison every later call of the session.
    pending = null;
    // The reason is in the message, not only in `cause`: what a reader sees is
    // whatever the UI renders, and "could not be loaded" alone names neither a
    // missing install nor a chunk that failed to come down the wire.
    throw new Error(
      `xtb-wasm could not be loaded, so geometries cannot be refined: ${errorMessage(error)}`,
      { cause: error },
    );
  });
  return pending;
}
