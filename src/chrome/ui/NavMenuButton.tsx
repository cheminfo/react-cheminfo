import type { IconName, PopoverNextProps } from '@blueprintjs/core';
import { Icon, Menu, MenuItem, PopoverNext } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import type { NavItem } from './navItem.ts';
import { isModifiedClick } from './navItem.ts';

export interface NavMenuButtonProps {
  /** Text of the trigger, which is also what a screen reader is told. */
  label: string;
  /** The pages the menu holds, in the order it lists them. */
  items: readonly NavItem[];
  /**
   * Which page is on show, named by its `id`. The trigger takes the brand tint
   * when the menu is the one holding it.
   * @default undefined
   */
  activeId?: string;
  /**
   * Glyph before the label.
   * @default undefined
   */
  icon?: IconName;
  /**
   * Side the menu opens on.
   * @default 'bottom-start'
   */
  placement?: PopoverNextProps['placement'];
  /**
   * What the menu adds under the pages — a divider and an action, typically.
   * @default undefined
   */
  children?: ReactNode;
}

/**
 * The pages that do not need a place of their own in the bar, folded into one
 * menu. The trigger is dressed as a `nav-link`, so it reads as one of the
 * entries beside it rather than as a button dropped among them.
 * @param props - The label, the pages, the page on show, and how the menu
 * opens.
 * @returns The trigger and its menu.
 */
export function NavMenuButton(props: NavMenuButtonProps): ReactElement {
  const {
    label,
    items,
    activeId,
    icon,
    placement = 'bottom-start',
    children,
  } = props;

  const holdsActive = items.some((item) => item.id === activeId);

  return (
    <PopoverNext
      placement={placement}
      content={
        <Menu className="nav-menu">
          {items.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              text={item.label}
              // A real address, so a crawler reaching the menu can follow it
              // and a middle click opens a tab of its own.
              href={item.href}
              target={item.external ? '_blank' : undefined}
              active={item.id === activeId}
              onClick={(event) => {
                if (item.onSelect === undefined || isModifiedClick(event)) {
                  return;
                }
                event.preventDefault();
                item.onSelect();
              }}
            />
          ))}
          {children}
        </Menu>
      }
    >
      <button
        type="button"
        className={holdsActive ? 'nav-link nav-link--active' : 'nav-link'}
        aria-label={label}
      >
        {icon === undefined ? null : <Icon icon={icon} size={14} />}
        {label}
        <Icon icon="caret-down" size={14} />
      </button>
    </PopoverNext>
  );
}
