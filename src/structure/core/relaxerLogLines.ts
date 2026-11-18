import type { LogEntry } from 'fifo-logger';

import type { LogLine } from '../../log/core/logGroups.ts';

/**
 * What a relaxer logged about a batch, as lines a conformer set keeps: an
 * entry about one structure is labelled with that structure's source, an entry
 * about a structure that was dropped is dropped with it, and an entry naming no
 * structure is about the whole batch — or, in a batch of one, about its only
 * structure.
 * @param entries - What the relaxer logged, each entry about one structure
 * carrying `structure`, its index in the batch.
 * @param sources - The label of each structure, `null` for one that was
 * dropped.
 * @returns Plain lines, in the order they were logged.
 */
export function relaxerLogLines(
  entries: readonly LogEntry[],
  sources: ReadonlyArray<string | null>,
): LogLine[] {
  const lines: LogLine[] = [];
  for (const entry of entries) {
    const { structure, ...meta } = entry.meta ?? {};
    const index =
      typeof structure === 'number'
        ? structure
        : sources.length === 1
          ? 0
          : null;
    const source = index === null ? undefined : sources[index];
    if (source === null) continue;
    lines.push({
      levelLabel: entry.levelLabel,
      message: entry.error?.message ?? entry.message,
      meta: source === undefined ? meta : { ...meta, source },
    });
  }
  return lines;
}
