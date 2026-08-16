import type { IconName, PopoverNextProps } from '@blueprintjs/core';
import { PopoverNext } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { Button } from 'react-science/ui';

const HOLDER_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
};

/** What every button of a site header takes, whatever its menu holds. */
export interface HeaderButtonProps {
  /**
   * Whether the button is reduced to its icon — no text, no caret — for a
   * header that has run out of room. The icon still opens the same menu.
   * @default false
   */
  compact?: boolean;
  /**
   * Side the menu opens on.
   * @default 'bottom-end'
   */
  placement?: PopoverNextProps['placement'];
}

export interface MenuButtonProps extends HeaderButtonProps {
  /** Class the holder carries, so a site can reach the button from its bar. */
  className: string;
  /** Glyph of the button. */
  icon: IconName;
  /** Text of the button, and what the pointer and a screen reader are told. */
  label: string;
  /** What the button opens. */
  menu: ReactElement;
}

/**
 * One entry of a site header: a button opening a menu, in the shape every such
 * button of the package takes, so two of them differ only in glyph and menu.
 * @param props - The glyph, the label, the menu, and how it opens.
 * @returns The button and its menu.
 */
export function MenuButton(props: MenuButtonProps): ReactElement {
  const {
    className,
    icon,
    label,
    menu,
    compact = false,
    placement = 'bottom-end',
  } = props;

  return (
    <span className={className} style={HOLDER_STYLE}>
      <PopoverNext placement={placement} content={menu}>
        <Button
          variant="minimal"
          icon={icon}
          endIcon={compact ? undefined : 'caret-down'}
          text={compact ? undefined : label}
          aria-label={label}
          title={compact ? label : undefined}
        />
      </PopoverNext>
    </span>
  );
}
