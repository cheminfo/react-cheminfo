import type { Placement } from '@blueprintjs/core';
import { Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { useActionTooltip } from './useActionTooltip.ts';

/** What {@link ActionTooltip} explains, and what it steps aside for. */
export interface ActionTooltipProps {
  /** What the control is for, read on hover. */
  content: string | ReactElement;
  /** The control. */
  children: ReactElement;
  /**
   * Whether what the control opens is on screen. While it is, the tooltip
   * stays shut.
   * @default false
   */
  opened?: boolean;
  /**
   * Which side of the control the tooltip is drawn on.
   * @default 'bottom'
   */
  placement?: Placement;
  /**
   * Class the popover carries, for a card that is not the chrome's own.
   * @default 'help-tooltip'
   */
  popoverClassName?: string;
  /**
   * How long the pointer rests on the control before the card is drawn, in
   * milliseconds.
   * @default 250
   */
  delay?: number;
}

/**
 * A tooltip on a control that opens something — a dialog, a popover, a menu.
 *
 * It is the wrapper form of {@link useActionTooltip}, which is where the whole
 * argument is written; a tooltip whose target cannot take a wrapping element —
 * a menu item, a table cell — uses the hook directly.
 * @param props - See {@link ActionTooltipProps}.
 * @returns The control, with its tooltip.
 */
export function ActionTooltip(props: ActionTooltipProps): ReactElement {
  const { content, children, opened = false } = props;
  const { placement = 'bottom', popoverClassName = 'help-tooltip' } = props;
  const { delay } = props;
  const { isOpen, target } = useActionTooltip(opened, delay);

  return (
    <Tooltip
      content={content}
      placement={placement}
      popoverClassName={popoverClassName}
      isOpen={isOpen}
    >
      {/* The pointer is read here rather than on the control, so the control
          keeps whatever handlers it was given. A box of its own, never
          `display: contents`, which measures as an empty rectangle and leaves
          the card positioned in the corner of the window. */}
      <span style={WRAP_STYLE} {...target}>
        {children}
      </span>
    </Tooltip>
  );
}

const WRAP_STYLE = { display: 'inline-flex' } as const satisfies CSSProperties;
