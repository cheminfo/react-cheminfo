/** A level a log entry carries, as fifo-logger and pino label it. */
export type LogLevelLabel =
  'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

/** How a message reads on the page, in Blueprint's intents. */
export type LogIntent = 'danger' | 'warning' | 'primary' | 'none';

/**
 * One logged message, as the page reads it. A fifo-logger `LogEntry` is one;
 * so is a plain object a site writes for a caveat that is always true, or one
 * read back from a saved file.
 *
 * Two keys of `meta` are shown: a string `title` heads the message, and a
 * string `source` — a file, a line, the third conformer — labels where it
 * comes from, so the message itself never has to name it.
 */
export interface LogLine {
  /** The level it was logged at; `silent` entries are never shown. */
  levelLabel: LogLevelLabel | 'silent';
  /** The message. */
  message: string;
  /**
   * What was logged with it.
   * @default undefined
   */
  meta?: Record<string, unknown>;
  /**
   * The error that was logged, whose own message is shown.
   * @default undefined
   */
  error?: Error;
}

/** One message as the page shows it: every entry that said it, once. */
export interface LogGroup {
  /** The same for the same level, source, title and text. */
  key: string;
  /** The level it was logged at. */
  level: LogLevelLabel;
  /**
   * Where it comes from, from a string `source` in the meta.
   * @default undefined
   */
  source?: string;
  /**
   * A heading for the message, from a string `title` in the meta.
   * @default undefined
   */
  title?: string;
  /** The message, or the logged error's own message. */
  text: string;
  /** How many entries said it. */
  count: number;
}

/** Which entries {@link groupLogEntries} keeps. */
export interface LogGroupOptions {
  /**
   * The least serious level shown. Debug and trace are for a developer, so
   * they stay out of the page unless asked for.
   * @default 'info'
   */
  minLevel?: LogLevelLabel;
}

/**
 * The messages a page shows for some log entries: the same message said twice
 * once, with its count, and the most serious first. Within one level the
 * messages keep the order they were first said in, which is the order the
 * work happened in.
 *
 * Entries from several loggers can be passed together, so what a run reported
 * and what a model always says about its results read as one list.
 * @param lines - What one or more loggers collected.
 * @param options - See {@link LogGroupOptions}.
 * @returns The messages to show, worst first.
 */
export function groupLogEntries(
  lines: readonly LogLine[],
  options: LogGroupOptions = {},
): LogGroup[] {
  const minimum = SEVERITY[options.minLevel ?? 'info'];
  const groups = new Map<string, LogGroup>();
  for (const line of lines) {
    const level = line.levelLabel;
    if (level === 'silent' || SEVERITY[level] < minimum) continue;
    const source = metaString(line, 'source');
    const title = metaString(line, 'title');
    const text = line.error?.message ?? line.message;
    const key = [level, source ?? '', title ?? '', text].join('\u0000');
    const group = groups.get(key);
    if (group === undefined) {
      groups.set(key, {
        key,
        level,
        ...(source === undefined ? {} : { source }),
        ...(title === undefined ? {} : { title }),
        text,
        count: 1,
      });
    } else {
      group.count++;
    }
  }
  return [...groups.values()].toSorted(
    (first, second) => SEVERITY[second.level] - SEVERITY[first.level],
  );
}

/**
 * The most serious level among some messages: the one a single indicator
 * standing for all of them is drawn in.
 * @param groups - Messages from {@link groupLogEntries}.
 * @returns The worst level, or `null` when there is no message.
 */
export function worstLogLevel(
  groups: readonly LogGroup[],
): LogLevelLabel | null {
  let worst: LogLevelLabel | null = null;
  for (const group of groups) {
    if (worst === null || SEVERITY[group.level] > SEVERITY[worst]) {
      worst = group.level;
    }
  }
  return worst;
}

/**
 * The intent a message of this level is drawn in: an error in red, a warning
 * in amber, context in the primary blue.
 * @param level - The level it was logged at.
 * @returns A Blueprint intent.
 */
export function logIntent(level: LogLevelLabel): LogIntent {
  return INTENTS[level];
}

const SEVERITY: Record<LogLevelLabel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

const INTENTS: Record<LogLevelLabel, LogIntent> = {
  trace: 'none',
  debug: 'none',
  info: 'primary',
  warn: 'warning',
  error: 'danger',
  fatal: 'danger',
};

function metaString(line: LogLine, key: string): string | undefined {
  const value = line.meta?.[key];
  return typeof value === 'string' && value !== '' ? value : undefined;
}
