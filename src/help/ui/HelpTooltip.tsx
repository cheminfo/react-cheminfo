import type { TooltipProps } from '@blueprintjs/core';
import { Tooltip } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import type { HelpContent } from './HelpBody.tsx';
import { HelpBody } from './HelpBody.tsx';
import { HELP_OPEN_DELAY } from './helpDelay.ts';
import { useHelpCards } from './useHelpCards.ts';

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
  /**
   * Class names added to the root element.
   * @default undefined
   */
  className?: string;
}

/**
 * A piece of help attached to whatever it explains.
 *
 * The delay before it opens is long enough that sweeping the pointer across a
 * row of controls opens nothing, help carrying a link stays open long enough
 * for the pointer to reach the link, and it opens only for a pointer that
 * moved over its target or a keyboard's focus, as every help card does
 * (`useHelpCards`).
 * @param props - See {@link HelpTooltipProps}.
 * @returns The target, with its help.
 */
export function HelpTooltip(props: HelpTooltipProps): ReactElement {
  const {
    className,
    content,
    children,
    placement = 'top',
    width,
    popoverClassName,
  } = props;
  const hasLink = content.link !== undefined;
  const { isOpen, onInteraction } = useHelpCards()('help');

  return (
    <Tooltip
      isOpen={isOpen}
      onInteraction={onInteraction}
      className={className}
      content={<HelpBody content={content} width={width} />}
      placement={placement}
      hoverOpenDelay={HELP_OPEN_DELAY}
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

// Help carrying a link has to outlive the pointer leaving its target.
const HOVER_CLOSE_DELAY = 300;
