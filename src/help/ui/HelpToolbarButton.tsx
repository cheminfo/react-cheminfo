import type { IconName } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { HelpContent } from './HelpBody.tsx';
import { HelpTooltip } from './HelpTooltip.tsx';

/** What {@link HelpToolbarButton} explains, and what pressing it does. */
export interface HelpToolbarButtonProps {
  /** The help the button reveals on hover. */
  content: HelpContent;
  /**
   * What pressing the button does — usually opening the guide the tooltip
   * summarises. Left out for a button that only explains itself.
   * @default undefined — the button does nothing when pressed
   */
  onClick?: () => void;
  /**
   * Text beside the glyph. Left out for a toolbar that has run out of room.
   * @default undefined — the button is reduced to its glyph
   */
  label?: string;
  /**
   * Glyph of the button.
   * @default 'help'
   */
  icon?: IconName;
  /**
   * Whether the button is the small size a dense toolbar needs.
   * @default false
   */
  small?: boolean;
  /**
   * Class the button carries.
   * @default undefined
   */
  className?: string;
}

/**
 * The help entry of a toolbar: a glyph that explains itself on hover and opens
 * the full guide when pressed.
 *
 * It shows the same body as the glyph beside a field and as any other mention
 * of that help, so a construct is documented in one place.
 * @param props - See {@link HelpToolbarButtonProps}.
 * @returns The toolbar button and its help.
 */
export function HelpToolbarButton(props: HelpToolbarButtonProps): ReactElement {
  const {
    content,
    onClick,
    label,
    icon = 'help',
    small = false,
    className,
  } = props;

  return (
    <HelpTooltip content={content} placement="bottom">
      <Button
        variant="minimal"
        size={small ? 'small' : 'medium'}
        icon={icon}
        text={label}
        aria-label={label ?? content.title}
        className={className}
        onClick={onClick}
      />
    </HelpTooltip>
  );
}
