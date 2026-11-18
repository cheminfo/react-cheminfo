import { Callout } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { InlineText } from '../../pedagogy/ui/InlineText.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { LogGroup, LogLevelLabel, LogLine } from '../core/logGroups.ts';
import { groupLogEntries, logIntent } from '../core/logGroups.ts';

import { logIcon } from './logIcon.ts';

/** Props of {@link LogCallouts}. */
export interface LogCalloutsProps {
  /** What one or more loggers collected, in the order they logged it. */
  entries: readonly LogLine[];
  /**
   * The least serious level shown.
   * @default 'info'
   */
  minLevel?: LogLevelLabel;
  /**
   * How many messages are shown before the rest are counted instead.
   * @default every message
   */
  limit?: number;
  /**
   * Class names added to the list.
   * @default undefined
   */
  className?: string;
}

/**
 * What a logger collected, as callouts in the page: one per distinct message,
 * the most serious first, each in the colour and with the icon of its level.
 *
 * A message is authored prose — `` `code` ``, `{{CO2}}`, `**strong**`. A string
 * `title` in its meta heads it and a string `source` labels where it comes
 * from. A message said several times is shown once, with how many times.
 * @param props - See {@link LogCalloutsProps}.
 * @returns The callouts, or nothing when there is no message to show.
 */
export function LogCallouts(props: LogCalloutsProps): ReactElement | null {
  const { entries, minLevel, limit, className } = props;
  const groups = groupLogEntries(entries, { minLevel });
  if (groups.length === 0) return null;
  return <LogGroupList groups={groups} limit={limit} className={className} />;
}

/** Props of {@link LogGroupList}. */
export interface LogGroupListProps {
  /** The messages, as {@link groupLogEntries} ordered them. */
  groups: readonly LogGroup[];
  /**
   * How many messages are shown before the rest are counted instead.
   * @default every message
   */
  limit?: number;
  /**
   * Class names added to the list.
   * @default undefined
   */
  className?: string;
}

/**
 * Messages already grouped, as callouts.
 * @param props - See {@link LogGroupListProps}.
 * @returns The callouts.
 */
export function LogGroupList(props: LogGroupListProps): ReactElement {
  const { groups, limit = groups.length, className } = props;
  const t = useChromeT();
  const hidden = Math.max(0, groups.length - limit);
  return (
    <div className={joinClassNames('log-callouts', className)}>
      {groups.slice(0, limit).map((group) => (
        <Callout
          key={group.key}
          compact
          intent={logIntent(group.level)}
          icon={logIcon(group.level)}
          title={group.title}
        >
          {group.source !== undefined && (
            <span className="log-callouts__source">{group.source}</span>
          )}
          <InlineText text={group.text} />
          {group.count > 1 && (
            <span className="log-callouts__count">×{group.count}</span>
          )}
        </Callout>
      ))}
      {hidden > 0 && (
        <span className="log-callouts__more">
          {hidden === 1
            ? t('log.more.one')
            : t('log.more.other', { count: hidden })}
        </span>
      )}
    </div>
  );
}
