import type { IconName } from '@blueprintjs/core';

import type { LogLevelLabel } from '../core/logGroups.ts';

/**
 * The icon a message of this level is shown with.
 * @param level - The level it was logged at.
 * @returns A Blueprint icon name.
 */
export function logIcon(level: LogLevelLabel): IconName {
  return ICONS[level];
}

const ICONS: Record<LogLevelLabel, IconName> = {
  trace: 'console',
  debug: 'console',
  info: 'info-sign',
  warn: 'warning-sign',
  error: 'error',
  fatal: 'error',
};
