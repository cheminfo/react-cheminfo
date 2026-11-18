import type { PopoverNextProps } from '@blueprintjs/core';
import { Button, PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { LogLevelLabel, LogLine } from '../core/logGroups.ts';
import {
  groupLogEntries,
  logIntent,
  worstLogLevel,
} from '../core/logGroups.ts';

import { LogGroupList } from './LogCallouts.tsx';
import { logIcon } from './logIcon.ts';

/** Props of {@link LogBadge}. */
export interface LogBadgeProps {
  /** What one or more loggers collected, in the order they logged it. */
  entries: readonly LogLine[];
  /**
   * The least serious level shown.
   * @default 'info'
   */
  minLevel?: LogLevelLabel;
  /**
   * How many messages the popover shows before the rest are counted instead.
   * @default every message
   */
  limit?: number;
  /**
   * Which side the messages open on.
   * @default 'bottom-start'
   */
  placement?: PopoverNextProps['placement'];
  /**
   * Class names added to the button.
   * @default undefined
   */
  className?: string;
}

/**
 * One small button standing for every message a logger collected about what
 * sits beside it, drawn in the colour of the most serious and counting them,
 * which opens them all as callouts on hover. The messages stay one pointer
 * away from the chart or the result they qualify instead of pushing it down
 * the page.
 * @param props - See {@link LogBadgeProps}.
 * @returns The button, or nothing when there is no message to show.
 */
export function LogBadge(props: LogBadgeProps): ReactElement | null {
  const {
    entries,
    minLevel,
    limit,
    placement = 'bottom-start',
    className,
  } = props;
  const t = useChromeT();
  const groups = groupLogEntries(entries, { minLevel });
  const worst = worstLogLevel(groups);
  if (worst === null) return null;

  return (
    <PopoverNext
      interactionKind="hover"
      hoverOpenDelay={150}
      placement={placement}
      popoverClassName="log-badge__popover"
      content={<LogGroupList groups={groups} limit={limit} />}
    >
      <Button
        variant="minimal"
        size="small"
        intent={logIntent(worst)}
        icon={logIcon(worst)}
        className={joinClassNames('log-badge', 'no-print', className)}
        aria-label={
          groups.length === 1
            ? t('log.badge.one')
            : t('log.badge.other', { count: groups.length })
        }
      >
        {groups.length > 1 ? groups.length : undefined}
      </Button>
    </PopoverNext>
  );
}
