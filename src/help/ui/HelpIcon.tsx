import { Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import type { HelpContent } from './HelpBody.tsx';
import { HelpTooltip } from './HelpTooltip.tsx';

/** What {@link HelpIcon} explains, and how big the glyph is. */
export interface HelpIconProps {
  /** The help the glyph reveals. */
  content: HelpContent;
  /**
   * Size of the glyph in pixels, so it sits on the line of the label it
   * follows.
   * @default 13
   */
  size?: number;
  /**
   * Which side the help opens on.
   * @default 'right'
   */
  placement?: 'top' | 'right' | 'bottom' | 'left';
  /**
   * Class the glyph carries, in addition to `help-icon`.
   * @default undefined
   */
  className?: string;
}

/**
 * The small question mark that sits beside a field label.
 *
 * It is reachable by tab, so the explanation is not reserved to whoever is
 * holding a pointer.
 * @param props - See {@link HelpIconProps}.
 * @returns The glyph and its help.
 */
export function HelpIcon(props: HelpIconProps): ReactElement {
  const { content, size = 13, placement = 'right', className } = props;

  return (
    <HelpTooltip content={content} placement={placement}>
      <Icon
        icon="help"
        size={size}
        tabIndex={0}
        aria-label={content.title}
        className={
          className === undefined ? 'help-icon' : `help-icon ${className}`
        }
      />
    </HelpTooltip>
  );
}
