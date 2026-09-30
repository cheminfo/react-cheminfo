import { Menu, MenuDivider, MenuItem, PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

import { NavLink } from './NavLink.tsx';
import type { NavItem } from './navItem.ts';
import { isModifiedClick } from './navItem.ts';

/** Who the site is answering to. */
export interface AccountIdentity {
  /** What the person is called on screen. */
  name: string;
  /**
   * What tells the account apart under that name — the address it is held at,
   * the handle it was opened with.
   * @default undefined
   */
  detail?: string;
  /**
   * The letters the mark is drawn with.
   * @default the first letter of each of the first two words of `name`
   */
  initials?: string;
}

export interface AccountButtonProps {
  /** Who is signed in, or `null` when nobody is. */
  identity: AccountIdentity | null;
  /**
   * Whether the site has not heard back yet. Neither state is drawn until it
   * has: a bar that offers to sign in and then turns into a name has told the
   * visitor something false, and it is the state they act on first.
   * @default false
   */
  loading?: boolean;
  /**
   * The address signing in happens at, for a site with a page of its own for
   * it. Writing it keeps the entry a real link, so a middle click opens a tab.
   * @default undefined
   */
  signInHref?: string;
  /**
   * What the site does when the invitation is picked — route to that page, or
   * open a credentials dialog for a site that has no page.
   * @default undefined
   */
  onSignIn?: () => void;
  /**
   * What the site does when Sign out is picked.
   * @default undefined
   */
  onSignOut?: () => void;
  /**
   * What the invitation reads, for a site whose accounts are for one kind of
   * person — "Teacher sign in". Two words: it is written out in the bar rather
   * than folded into a glyph.
   * @default the chrome's own word for it, in the language of the page
   */
  signInLabel?: string;
  /**
   * The account's own pages, listed above Sign out — a profile, a settings
   * page.
   * @default undefined
   */
  items?: readonly NavItem[];
}

/**
 * The one utility of the bar that says who the site is answering to: an
 * invitation when nobody is signed in, and the account's mark when somebody is.
 *
 * The two states are told apart by whether an identity is on screen, never by
 * the direction of an arrow. Blueprint's `log-in` and `log-out` are the same
 * arrow either side of the same door, and at 14 px among four other monochrome
 * glyphs nobody reads which side it is on — a site drawing one reports the
 * visitor as signed in while they are signed out. So the invitation is the
 * words `Sign in`, which no mark can be mistaken for, and being signed in is
 * the person's own initials.
 * @param props - Who is signed in, what signing in and out do, and the pages
 * the account's menu lists.
 * @returns The entry, or nothing while the site is still asking.
 */
export function AccountButton(props: AccountButtonProps): ReactElement | null {
  const {
    identity,
    loading = false,
    signInHref,
    onSignIn,
    onSignOut,
    signInLabel,
    items = [],
  } = props;
  const t = useChromeT();

  if (loading) {
    // The width of the mark, so the bar does not jump when the answer lands.
    return <span className="account-button__pending" aria-hidden="true" />;
  }

  if (identity === null) {
    return (
      <NavLink
        className="account-button account-button--out"
        item={{
          id: 'account',
          label: signInLabel ?? t('account.signIn'),
          href: signInHref,
          onSelect: onSignIn,
        }}
      />
    );
  }

  const { name, detail, initials = initialsOf(name) } = identity;

  return (
    <PopoverNext
      placement="bottom-end"
      content={
        <Menu className="nav-menu account-menu">
          <li className="account-menu__identity">
            <span className="account-menu__name">{name}</span>
            {detail === undefined ? null : (
              <span className="account-menu__detail">{detail}</span>
            )}
          </li>
          <MenuDivider />
          {items.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              text={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              onClick={(event) => {
                if (item.onSelect === undefined || isModifiedClick(event)) {
                  return;
                }
                event.preventDefault();
                item.onSelect();
              }}
            />
          ))}
          {items.length === 0 ? null : <MenuDivider />}
          <MenuItem
            icon="log-out"
            text={t('account.signOut')}
            onClick={onSignOut}
          />
        </Menu>
      }
    >
      <button
        type="button"
        className="nav-link nav-link--icon account-button account-button--in"
        title={t('account.signedInAs', { name })}
        aria-label={t('account.signedInAs', { name })}
      >
        <span className="account-mark">{initials}</span>
      </button>
    </PopoverNext>
  );
}

/**
 * The letters a name is marked with: the first of each of its first two words,
 * or the first two letters of a name written as one word.
 * @param name - What the person is called.
 * @returns One or two letters, in capitals.
 */
function initialsOf(name: string): string {
  const [first, second] = name.split(/\s+/).filter((word) => word !== '');
  if (first === undefined) return '?';
  if (second === undefined) return firstWordInitials(first);
  return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}

// A single word is usually a handle or an address, where the two letters say
// more than one does — but never the part after the `@`, which every account
// on the same domain would share.
function firstWordInitials(word: string): string {
  const [local = ''] = word.split('@');
  return (local === '' ? word : local).slice(0, 2).toUpperCase();
}
