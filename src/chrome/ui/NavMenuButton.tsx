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
   * Whether the trigger is reduced to its glyph, for a bar that has run out of
   * room. The label is still what the pointer and a screen reader are told.
   * @default false
   */
  compact?: boolean;
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
    compact = false,
    children,
  } = props;

  const holdsActive = holdsId(items, activeId);
  const classes = [
    'nav-link',
    icon === undefined ? null : 'nav-link--icon',
    holdsActive ? 'nav-link--active' : null,
  ]
    .filter((part) => part !== null)
    .join(' ');

  return (
    <PopoverNext
      placement={placement}
      content={
        <Menu className="nav-menu">
          {items.map((item) => (
            <NavMenuEntry key={item.id} item={item} activeId={activeId} />
          ))}
          {children}
        </Menu>
      }
    >
      <button
        type="button"
        className={classes}
        aria-label={label}
        title={compact ? label : undefined}
      >
        {icon === undefined ? (
          label
        ) : (
          <>
            <Icon icon={icon} size={14} />
            {compact ? null : <span className="nav-link__label">{label}</span>}
          </>
        )}
        {compact ? null : <Icon icon="caret-down" size={14} />}
      </button>
    </PopoverNext>
  );
}

/**
 * One line of a header menu, holding a submenu of its own when the entry folds
 * pages — which is how a bar entry that is already a menu reads once the whole
 * bar has folded into one.
 * @param props - The entry and the page on show.
 * @param props.item - The entry.
 * @param props.activeId - The page on show.
 * @returns The line.
 */
function NavMenuEntry(props: {
  item: NavItem;
  activeId: string | undefined;
}): ReactElement {
  const { item, activeId } = props;

  return (
    <MenuItem
      icon={item.icon}
      text={item.label}
      // A real address, so a crawler reaching the menu can follow it and a
      // middle click opens a tab of its own.
      href={item.href}
      target={item.external ? '_blank' : undefined}
      active={
        item.items === undefined
          ? item.id === activeId
          : holdsId(item.items, activeId)
      }
      onClick={(event) => {
        if (item.onSelect === undefined || isModifiedClick(event)) return;
        event.preventDefault();
        item.onSelect();
      }}
    >
      {item.items?.map((child) => (
        <NavMenuEntry key={child.id} item={child} activeId={activeId} />
      ))}
    </MenuItem>
  );
}

/**
 * Whether a run of entries holds the page on show, looking through the ones
 * that are menus of their own.
 * @param items - The entries.
 * @param activeId - The page on show.
 * @returns Whether one of them is it.
 */
function holdsId(
  items: readonly NavItem[],
  activeId: string | undefined,
): boolean {
  for (const item of items) {
    if (item.id === activeId) return true;
    if (item.items !== undefined && holdsId(item.items, activeId)) return true;
  }
  return false;
}
