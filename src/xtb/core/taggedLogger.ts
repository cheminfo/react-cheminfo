import type { LightLogger } from 'cheminfo-types';

/**
 * A logger that adds some fields to every entry before passing it on — what
 * xtb-wasm's pool does for the structures of a batch, done here for the ones
 * relaxed in turn on this thread.
 * @param logger - Where the entries go.
 * @param context - The fields every entry gains, e.g. `{ structure: 2 }`.
 * @returns The tagging logger.
 */
export function taggedLogger(
  logger: LightLogger,
  context: Record<string, unknown>,
): LightLogger {
  function forward(level: Level) {
    return (value: unknown, message?: string): void => {
      if (value instanceof Error) {
        logger[level](context, message ?? value.message);
      } else if (typeof value === 'object' && value !== null) {
        logger[level]({ ...context, ...value }, message ?? '');
      } else {
        logger[level](context, message ?? String(value));
      }
    };
  }
  return {
    trace: forward('trace'),
    debug: forward('debug'),
    info: forward('info'),
    warn: forward('warn'),
    error: forward('error'),
  };
}

type Level = 'trace' | 'debug' | 'info' | 'warn' | 'error';
