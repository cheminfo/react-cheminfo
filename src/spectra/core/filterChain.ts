import type { SpectrumFilter, SpectrumFilterName } from './settings.ts';

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
  return { name };
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
  return chain.filter((_, position) => position !== index);
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
  return [
    ...chain.slice(0, index + 1),
    structuredClone(step),
    ...chain.slice(index + 1),
  ];
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
  const step = chain[index];
  if (step === undefined || target < 0 || target >= chain.length) {
    return [...chain];
  }
  const moved = [...chain];
  moved.splice(index, 1);
  moved.splice(target, 0, step);
  return moved;
}

/**
 * What one option of a step is set to.
 * @param filter - The step.
 * @param key - Where the value sits, dotted for a nested one.
 * @returns The value, or undefined when the step leaves it to upstream.
 */
export function readFilterOption(filter: SpectrumFilter, key: string): unknown {
  let current: unknown = 'options' in filter ? filter.options : undefined;
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
 * default once they have typed over it.
 * @param filter - The step.
 * @param key - Where the value sits, dotted for a nested one.
 * @param value - What to set it to, or undefined to clear it.
 * @returns A new step.
 */
export function setFilterOption(
  filter: SpectrumFilter,
  key: string,
  value: unknown,
): SpectrumFilter {
  const written = writePath(filterOptions(filter), key.split('.'), value);
  if (Object.keys(written).length === 0) return { name: filter.name };
  return { name: filter.name, options: written };
}

/**
 * The step's options as a plain record, for a form that walks the catalog.
 * @param filter - The step.
 * @returns Its options, empty when it carries none.
 */
export function filterOptions(filter: SpectrumFilter): Readonly<OptionsRecord> {
  const options = 'options' in filter ? filter.options : undefined;
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
