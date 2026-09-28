import type { IconName } from '@blueprintjs/core';
import { Callout } from '@blueprintjs/core';
import type { ReactNode } from 'react';

import { panelEmptyStyle } from '../core/panelStyles.ts';

/** What a panel says when it cannot show what it is for. */
export type PanelMessageIntent = 'none' | 'warning' | 'danger';

export interface PanelMessageProps {
  /**
   * How much is in the way: `danger` for something the editor refused,
   * `warning` for something it could only do in part, `none` for a remark.
   * @default 'warning'
   */
  intent?: PanelMessageIntent;
  /**
   * The icon, when the one the intent carries is not the one meant — a lookup
   * that found nothing is a search that came back empty, not a warning.
   * @default the icon of the intent
   */
  icon?: IconName;
  /** What to say, in the terms the drawing is in. */
  children: ReactNode;
}

/**
 * Why a panel is showing this instead of what it is for.
 *
 * A refusal, a limitation and a remark are told apart by colour rather than by
 * wording, and they are told apart the same way in every panel — which is what
 * this is for: eight places said the same thing in three spellings before.
 * @param props - Component props.
 * @returns The callout.
 */
export function PanelMessage(props: PanelMessageProps) {
  const { intent = 'warning', icon = INTENT_ICONS[intent], children } = props;

  return (
    <Callout intent={intent} compact icon={icon}>
      {children}
    </Callout>
  );
}

export interface PanelEmptyProps {
  /** What there is instead of the list, in a few words. */
  children: ReactNode;
}

/**
 * The quiet line a panel shows in place of a list it has nothing to fill.
 * @param props - Component props.
 * @returns The line.
 */
export function PanelEmpty(props: PanelEmptyProps) {
  return <div style={panelEmptyStyle}>{props.children}</div>;
}

const INTENT_ICONS: Record<PanelMessageIntent, IconName> = {
  none: 'info-sign',
  warning: 'warning-sign',
  danger: 'error',
};
