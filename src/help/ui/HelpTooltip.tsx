import type { TooltipProps } from '@blueprintjs/core';
import { Tooltip } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import type { HelpContent } from './HelpBody.tsx';
import { HelpBody } from './HelpBody.tsx';

/** What {@link HelpTooltip} wraps, and what it says about it. */
export interface HelpTooltipProps {
  /** The help shown when the pointer rests on the target. */
  content: HelpContent;
  /** What the help is about. */
  children: ReactNode;
  /**
   * Which side the tooltip opens on.
   * @default 'top'
   */
  placement?: TooltipProps['placement'];
  /**
   * How wide the body is allowed to be, in pixels.
   * @default 280
   */
  width?: number;
  /**
   * Class the tooltip popover carries, in addition to `help-tooltip`.
   * @default undefined
   */
  popoverClassName?: string;
}

/**
 * A piece of help attached to whatever it explains.
 *
 * The delay before it opens is long enough that sweeping the pointer across a
 * row of controls opens nothing, and help carrying a link stays open long
 * enough for the pointer to reach the link.
 * @param props - See {@link HelpTooltipProps}.
 * @returns The target, with its help.
 */
export function HelpTooltip(props: HelpTooltipProps): ReactElement {
  const {
    content,
    children,
    placement = 'top',
    width,
    popoverClassName,
  } = props;
  const hasLink = content.link !== undefined;

  return (
    <Tooltip
      content={<HelpBody content={content} width={width} />}
      placement={placement}
      hoverOpenDelay={HOVER_OPEN_DELAY}
      hoverCloseDelay={hasLink ? HOVER_CLOSE_DELAY : 0}
      interactionKind={hasLink ? 'hover' : 'hover-target'}
      targetTagName="span"
      popoverClassName={
        popoverClassName === undefined
          ? 'help-tooltip'
          : `help-tooltip ${popoverClassName}`
      }
    >
      {children}
    </Tooltip>
  );
}

// Long enough that sweeping the pointer across a row of controls opens nothing.
const HOVER_OPEN_DELAY = 250;
// Help carrying a link has to outlive the pointer leaving its target.
const HOVER_CLOSE_DELAY = 300;
