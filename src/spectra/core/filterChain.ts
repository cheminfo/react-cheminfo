import type {
  MatrixFilter,
  SpectrumFilter,
  SpectrumFilterName,
} from './settings.ts';

/**
 * A step of either stage, as far as its options go: a chain step and a matrix
 * step both have this shape, so one reader and one writer serve both.
 */
export interface FilterStep {
  /**
   * The step's name.
   * @default undefined — a matrix step may carry none, and is then skipped
   */
  name?: string;
  /**
   * The step's options, whatever shape they turn out to be.
   * @default undefined — upstream's defaults apply
   */
  options?: unknown;
}

/** What a step's options are, before any one filter's shape is assumed. */
type OptionsRecord = Record<string, unknown>;

/**
 * The peak-picking `calibrateX` tunes for itself.
 *
 * Upstream reads these off the whole `gsd` object, so the moment the settings
 * carry a `gsd` at all — even an empty one — every value here is replaced by
 * ml-gsd's own, which pick peaks a four-hundredth as tall. The editor therefore
 * writes them out in full rather than ever emitting a partial one.
 */
const CALIBRATE_PEAK_PICKING = {
  maxCriteria: true,
  minMaxRatio: 0.1,
  realTopDetection: true,
  smoothY: true,
  sgOptions: { windowSize: 7, polynomial: 3 },
};

/**
 * A new chain step, carrying only the options upstream cannot default safely.
 * @param name - Which step to add.
 * @returns The step.
 */
export function defaultFilter(name: SpectrumFilterName): SpectrumFilter {
  if (name === 'calibrateX') {
    return { name, options: { gsd: { ...CALIBRATE_PEAK_PICKING } } };
  }
  // TypeScript matches an object literal against a discriminated union of at
  // most 25 members, and the chain has more. Every step's options are optional
  // upstream, so a bare name is a whole step of whichever filter it names.
  return { name } as SpectrumFilter;
}

/**
 * The chain with one more step at the end.
 * @param chain - The steps, in the order they run.
 * @param name - Which step to add.
 * @returns A new chain.
 */
export function addFilter(
  chain: readonly SpectrumFilter[],
  name: SpectrumFilterName,
): SpectrumFilter[] {
  return [...chain, defaultFilter(name)];
}

/**
 * The chain without the step at that position.
 * @param chain - The steps, in the order they run.
 * @param index - Which step to drop.
 * @returns A new chain.
 */
export function removeFilter(
  chain: readonly SpectrumFilter[],
  index: number,
): SpectrumFilter[] {
  if (index < 0 || index >= chain.length) return [...chain];
  return chain.toSpliced(index, 1);
}

/**
 * The chain with the step at that position repeated just after it.
 * @param chain - The steps, in the order they run.
 * @param index - Which step to repeat.
 * @returns A new chain.
 */
export function duplicateFilter(
  chain: readonly SpectrumFilter[],
  index: number,
): SpectrumFilter[] {
  const step = chain[index];
  if (step === undefined) return [...chain];
  return chain.toSpliced(index + 1, 0, structuredClone(step));
}

/**
 * The chain with one step moved.
 *
 * Order is the whole meaning of a chain — scaling before a baseline correction
 * measures an offset that is about to change — so moving a step is a first-class
 * edit rather than something to be done by deleting and adding again.
 * @param chain - The steps, in the order they run.
 * @param index - Which step to move.
 * @param offset - How far, negative towards the start.
 * @returns A new chain, unchanged when the move would fall off either end.
 */
export function moveFilter(
  chain: readonly SpectrumFilter[],
  index: number,
  offset: number,
): SpectrumFilter[] {
  const target = index + offset;
  if (index < 0 || index >= chain.length) return [...chain];
  if (target < 0 || target >= chain.length) return [...chain];
  return reorder(chain, index, target);
}

/**
 * A list with one entry moved to another position.
 * @param list - What to reorder.
 * @param index - Which entry to move.
 * @param target - Where it lands.
 * @returns A new list, the same entries when there is nothing at `index`.
 */
export function reorder<T>(
  list: readonly T[],
  index: number,
  target: number,
): T[] {
  const moved = [...list];
  const [entry] = moved.splice(index, 1);
  if (entry !== undefined) moved.splice(target, 0, entry);
  return moved;
}

/**
 * What one option of a step is set to.
 * @param filter - The step, of the chain or of the matrix stage.
 * @param key - Where the value sits, dotted for a nested one.
 * @returns The value, or undefined when the step leaves it to upstream.
 */
export function readFilterOption(filter: FilterStep, key: string): unknown {
  let current: unknown = filter.options;
  for (const segment of key.split('.')) {
    if (typeof current !== 'object' || current === null) return undefined;
    current = (current as OptionsRecord)[segment];
  }
  return current;
}

/**
 * The step with one option set, or dropped when the value is undefined.
 *
 * Dropping rather than writing `undefined` is what lets a cleared field mean
 * "whatever upstream does", which is the only way a reader can get back to the
 * default once they have typed over it. Options that are not an object are
 * thrown away rather than read, so a written step is always one the processor
 * can take.
 * @param filter - The step.
 * @param key - Where the value sits, dotted for a nested one.
 * @param value - What to set it to, or undefined to clear it.
 * @returns A new step.
 */
export function setFilterOption(
  filter: SpectrumFilter,
  key: string,
  value: unknown,
): SpectrumFilter;
export function setFilterOption(
  filter: MatrixFilter,
  key: string,
  value: unknown,
): MatrixFilter;
export function setFilterOption(
  filter: FilterStep,
  key: string,
  value: unknown,
): FilterStep {
  const written = writePath(filterOptions(filter), key.split('.'), value);
  if (Object.keys(written).length === 0) return { name: filter.name };
  return { name: filter.name, options: written };
}

/**
 * One option of a step as a number box can show it.
 *
 * Anything that is not a number — a bound pasted in as text, a `null` — reads
 * as nothing, so the box shows its placeholder rather than junk.
 * @param filter - The step, of the chain or of the matrix stage.
 * @param key - Where the value sits, dotted for a nested one.
 * @returns The number, or undefined when the step holds none there.
 */
export function readNumberOption(
  filter: FilterStep,
  key: string,
): number | undefined {
  const value = readFilterOption(filter, key);
  return typeof value === 'number' ? value : undefined;
}

/**
 * The step's options as a plain record, for a form that walks the catalog.
 * @param filter - The step, of the chain or of the matrix stage.
 * @returns Its options, empty when it carries none.
 */
export function filterOptions(
  filter: FilterStep,
): Readonly<Record<string, unknown>> {
  const { options } = filter;
  if (typeof options !== 'object' || options === null) return {};
  // An interface carries no index signature, so a form that walks the catalog
  // has to read it as the record the catalog's keys describe.
  return options as OptionsRecord;
}

/**
 * A copy of the record with one path written, creating what it passes through.
 * @param record - What to copy.
 * @param path - The remaining segments.
 * @param value - What to set, or undefined to drop the key.
 * @returns A new record.
 */
function writePath(
  record: Readonly<OptionsRecord>,
  path: readonly string[],
  value: unknown,
): OptionsRecord {
  const [head, ...rest] = path;
  if (head === undefined) return { ...record };

  if (rest.length === 0 && value === undefined) {
    const kept: OptionsRecord = {};
    for (const [name, held] of Object.entries(record)) {
      if (name !== head) kept[name] = held;
    }
    return kept;
  }

  const next: OptionsRecord = { ...record };
  if (rest.length === 0) {
    next[head] = value;
    return next;
  }
  const child = next[head];
  const childRecord =
    typeof child === 'object' && child !== null ? (child as OptionsRecord) : {};
  const written = writePath(childRecord, rest, value);
  // An emptied nested object is not the same as an absent one: upstream reads a
  // present `gsd` as "options were given" and drops its own tuned defaults.
  if (Object.keys(written).length === 0) {
    return writePath(record, [head], undefined);
  }
  next[head] = written;
  return next;
}
