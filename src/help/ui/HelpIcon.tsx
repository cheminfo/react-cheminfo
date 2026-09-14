import type { IconName } from '@blueprintjs/core';
import { Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import type { HelpContent } from './HelpBody.tsx';
import { HelpTooltip } from './HelpTooltip.tsx';
import { helpName } from './helpName.ts';

/** What {@link HelpIcon} explains, and how the glyph looks. */
export interface HelpIconProps {
  /**
   * The help the glyph reveals. A site with free-form help passes only a
   * `body`.
   */
  content: HelpContent;
  /**
   * What a screen reader calls the glyph.
   * @default the help's title, or `'Help'` when it has none
   */
  label?: string;
  /**
   * Glyph drawn, for a site that marks help with another sign.
   * @default 'help'
   */
  icon?: IconName;
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
  const {
    content,
    label = helpName(content),
    icon = 'help',
    size = 13,
    placement = 'right',
    className,
  } = props;

  return (
    <HelpTooltip content={content} placement={placement}>
      <Icon
        icon={icon}
        size={size}
        tabIndex={0}
        aria-label={label}
        className={joinClassNames('help-icon', className)}
      />
    </HelpTooltip>
  );
}
