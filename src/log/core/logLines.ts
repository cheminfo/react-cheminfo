import type { LogGroupOptions, LogLine } from './logGroups.ts';
import { groupLogEntries } from './logGroups.ts';

/**
 * Log entries as plain data, to keep with a result, save in a file or post
 * across a worker: a logged error becomes its message, and nothing else of a
 * fifo-logger entry — its id, time and logger uuids — is kept.
 * @param lines - What a logger collected.
 * @returns The same messages, as plain objects in the same order.
 */
export function plainLogLines(lines: readonly LogLine[]): LogLine[] {
  const plain: LogLine[] = [];
  for (const line of lines) {
    plain.push({
      levelLabel: line.levelLabel,
      message: line.error?.message ?? line.message,
      ...(line.meta === undefined ? {} : { meta: line.meta }),
    });
  }
  return plain;
}

/**
 * The messages as sentences, for an answer that carries text rather than a
 * page: an MCP tool, a host's reply, a status line. Each message comes once,
 * the worst first, prefixed by where it comes from and led by its title.
 * @param lines - What one or more loggers collected.
 * @param options - See {@link LogGroupOptions}.
 * @returns One sentence per distinct message.
 */
export function logMessages(
  lines: readonly LogLine[],
  options: LogGroupOptions = {},
): string[] {
  const messages: string[] = [];
  for (const group of groupLogEntries(lines, options)) {
    const text =
      group.title === undefined ? group.text : `${group.title}. ${group.text}`;
    messages.push(
      group.source === undefined ? text : `${group.source}: ${text}`,
    );
  }
  return messages;
}
