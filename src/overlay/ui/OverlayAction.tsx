import type { IconName, Intent } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { Button } from 'react-science/ui';

import type { OverlayControlProps } from './OverlayRow.tsx';
import { OverlayRow } from './OverlayRow.tsx';
import { useOverlaySurface } from './overlaySurface.ts';

/** What {@link OverlayAction} needs. */
export interface OverlayActionProps extends Omit<
  OverlayControlProps,
  'label' | 'hideLabel'
> {
  /** What the button reads: a verb and its object, `Zoom to selection`. */
  text: string;
  /** Called when it is pressed. */
  onClick: () => void;
  /**
   * A glyph before the text. Never instead of it: an icon-only control in a
   * floating card is a control nobody presses.
   * @default undefined
   */
  icon?: IconName;
  /**
   * What the button means, which is not whether it is pressed.
   * @default 'none'
   */
  intent?: Intent;
  /**
   * Whether what it started is still running. A busy button ignores a press
   * but keeps the focus, so the card around it keeps its keys: a disabled one
   * drops the focus to the page, and Escape no longer closes the card.
   * @default false
   */
  busy?: boolean;
}

/**
 * The one control here that does something rather than changing something.
 *
 * It carries no caption of its own because its words already are one — a verb
 * and its object — and a caption in front of a button that reads `Zoom to
 * selection` says the same thing twice in a card that has room for neither.
 * @param props - See {@link OverlayActionProps}.
 * @returns The button, with its help.
 */
export function OverlayAction(props: OverlayActionProps): ReactElement {
  const {
    text,
    onClick,
    icon,
    intent = 'none',
    help,
    disabled = false,
    busy = false,
    testId,
  } = props;
  const { metrics } = useOverlaySurface();

  return (
    <OverlayRow label={text} help={help} hideLabel disabled={disabled}>
      <Button
        variant="minimal"
        size={metrics.blueprintSize}
        intent={intent}
        icon={icon}
        text={text}
        disabled={disabled}
        aria-disabled={busy || undefined}
        data-testid={testId}
        onClick={busy ? undefined : onClick}
      />
    </OverlayRow>
  );
}
