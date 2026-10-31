/**
 * The prediction pool, handed to a page.
 *
 * The only React in the domain. Results arrive one at a time and are kept in a
 * map the page reads by row key, so a table draws every row immediately and
 * fills each one in as its worker answers — nothing waits for the set.
 *
 * The two maps are created once and mutated, and a counter beside them changes
 * to say so. Building a new map per answer would copy a growing map once per
 * molecule, which on a set of two thousand costs more than the predictions do.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { WorkerLike } from '../../worker/core/messages.ts';
import type {
  PredictionInput,
  PredictionPool,
  PredictionProgress,
} from '../core/poolTypes.ts';
import { createPredictionPool } from '../core/predictionPool.ts';
import type { ResourceSource } from '../core/predictors.ts';
import type { OsirisProperties, RiskDetail, RiskType } from '../core/types.ts';

/** What a page gives the hook. */
export interface UsePredictionsOptions {
  /**
   * The molecules to predict. One already answered is never asked for again,
   * so a page may pass its whole set on every render — though memoising it
   * saves the filtering pass.
   */
  molecules: readonly PredictionInput[];
  /**
   * The keys of the rows the reader can see, most wanted first. They are
   * answered before the rest.
   * @default undefined — the reading order is kept
   */
  visibleKeys?: readonly string[];
  /**
   * Whether to predict at all. Off while a file is still being read, so the
   * pool is not asked for half a set.
   * @default true
   */
  enabled?: boolean;
  /**
   * Where the workers register OpenChemLib's resources from: the absolute URL
   * of the site's own `openchemlib-resources.json`, resolved on the main thread
   * — a worker has no `document` to read the deployment's mount path off, and
   * a relative address would resolve against its hashed chunk.
   */
  resources: ResourceSource;
  /**
   * Makes one prediction worker: a module worker of the site's own, serving
   * `runPredictionJob` for the requests `isPredictRequest` accepts. It may be
   * a new function on every render — it is read only when a worker is made.
   */
  createWorker: () => WorkerLike;
  /**
   * How many workers to run.
   * @default one fewer than the machine's cores, clamped to 1 to 8
   */
  size?: number;
}

/** What the hook gives a page back. */
export interface UsePredictionsResult {
  /** What each answered row was predicted to be, by row key. */
  results: ReadonlyMap<string, OsirisProperties>;
  /** Why each refused row was refused, by row key. */
  failures: ReadonlyMap<string, string>;
  /** How far the pool has got. */
  progress: PredictionProgress;
  /** Why no prediction can be made at all, or `null`. */
  error: string | null;
  /** Drop everything still queued. */
  cancel: () => void;
  /**
   * Why one risk came back as it did.
   * @param idCode - The molecule, coordinates included or not.
   * @param risk - Which of the four risks to explain.
   * @returns The findings, with the matched atoms and bonds of every fragment.
   */
  riskDetail: (idCode: string, risk: RiskType) => Promise<RiskDetail>;
}

const IDLE: PredictionProgress = {
  done: 0,
  total: 0,
  pending: 0,
  running: false,
};

interface Answered {
  results: Map<string, OsirisProperties>;
  failures: Map<string, string>;
}

interface PoolView {
  progress: PredictionProgress;
  error: string | null;
  answers: number;
}

/**
 * Predict a set of molecules on a pool of workers, streaming the answers back.
 * @param options - See {@link UsePredictionsOptions}.
 * @returns The answers so far, the progress, and the controls.
 */
export function usePredictions(
  options: UsePredictionsOptions,
): UsePredictionsResult {
  const { molecules, visibleKeys, enabled = true, size } = options;
  const { resources, createWorker } = options;
  // Read when the pool and its workers are made rather than listed as a
  // dependency: a factory written inline is a new function on every render,
  // and the progress the pool reports causes one.
  const source = useRef({ resources, createWorker });
  useEffect(() => {
    source.current = { resources, createWorker };
  }, [resources, createWorker]);

  const [answered] = useState<Answered>(() => ({
    results: new Map(),
    failures: new Map(),
  }));
  const [view, setView] = useState<PoolView>({
    progress: IDLE,
    error: null,
    answers: 0,
  });
  const pool = useRef<PredictionPool | null>(null);

  const open = useCallback((): PredictionPool => {
    pool.current ??= createPredictionPool({
      resources: source.current.resources,
      createWorker: () => source.current.createWorker(),
      ...(size === undefined ? {} : { size }),
      onResult(outcome) {
        if (outcome.ok) answered.results.set(outcome.key, outcome.properties);
        else answered.failures.set(outcome.key, outcome.message);
        setView((previous) => ({ ...previous, answers: previous.answers + 1 }));
      },
      onProgress(progress) {
        setView((previous) => ({ ...previous, progress }));
      },
      onUnavailable(message) {
        setView((previous) => ({ ...previous, error: message }));
      },
    });
    return pool.current;
  }, [answered, size]);

  const unavailable = view.error;
  useEffect(() => {
    if (!enabled || unavailable !== null) return;
    const waiting: PredictionInput[] = [];
    for (const molecule of molecules) {
      if (answered.results.has(molecule.key)) continue;
      if (answered.failures.has(molecule.key)) continue;
      waiting.push(molecule);
    }
    if (waiting.length > 0) open().submit(waiting);
  }, [answered, molecules, enabled, open, unavailable]);

  useEffect(() => {
    if (visibleKeys !== undefined) pool.current?.prioritize(visibleKeys);
  }, [visibleKeys]);

  useEffect(
    () => () => {
      pool.current?.terminate();
      pool.current = null;
    },
    [],
  );

  const cancel = useCallback(() => {
    pool.current?.cancel();
  }, []);

  const riskDetail = useCallback(
    (idCode: string, risk: RiskType) => open().riskDetail(idCode, risk),
    [open],
  );

  return {
    results: answered.results,
    failures: answered.failures,
    progress: view.progress,
    error: view.error,
    cancel,
    riskDetail,
  };
}
