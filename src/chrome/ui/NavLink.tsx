import { Icon } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';

import type { NavItem } from './navItem.ts';
import { isModifiedClick } from './navItem.ts';

export interface NavLinkProps {
  /** The entry being drawn. */
  item: NavItem;
  /**
   * Whether this is the page on show, which is the one thing in the bar the
   * brand tint is spent on.
   * @default false
   */
  active?: boolean;
  /**
   * Extra class names, for a site reaching one entry of its own bar.
   * `nav-link` is always carried as well.
   * @default undefined
   */
  className?: string;
}

/**
 * One entry of a site header, as a link when it has an address and as a button
 * otherwise. Both carry `nav-link`, so the row reads as one menu rather than as
 * a button dropped among addresses.
 * @param props - The entry, whether it is the page on show, and extra classes.
 * @returns The entry.
 */
export function NavLink(props: NavLinkProps): ReactElement {
  const { item, active = false, className } = props;
  const { href, external = false, onSelect, title } = item;

  const classes = [
    'nav-link',
    active ? 'nav-link--active' : null,
    className ?? null,
  ]
    .filter((part) => part !== null)
    .join(' ');

  if (href === undefined) {
    return (
      <button
        type="button"
        className={classes}
        title={title}
        aria-label={title}
        onClick={onSelect}
      >
        <NavLinkBody item={item} />
      </button>
    );
  }

  return (
    <a
      className={classes}
      href={href}
      title={title}
      aria-label={title}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={(event) => {
        if (onSelect === undefined || external || isModifiedClick(event)) {
          return;
        }
        event.preventDefault();
        onSelect();
      }}
    >
      <NavLinkBody item={item} />
    </a>
  );
}

function NavLinkBody(props: { item: NavItem }): ReactNode {
  const { icon, label, after } = props.item;

  return (
    <>
      {icon === undefined ? null : <Icon icon={icon} size={14} />}
      {label}
      {after}
    </>
  );
}
