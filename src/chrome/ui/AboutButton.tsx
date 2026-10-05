import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

import { NavLink } from './NavLink.tsx';

/** What the About entry of a header needs. */
export interface AboutButtonProps {
  /**
   * The site's About address, which the entry opens. It is written rather than
   * assumed, because a deployment may sit under a mount path and a translated
   * site under a language prefix.
   */
  href: string;
  /**
   * Whether the About is the page on show, which is what the brand tint is
   * spent on.
   * @default false
   */
  active?: boolean;
  /**
   * What the site does when the entry is picked, for a page that routes in
   * place. A modified click is left to the browser.
   * @default undefined
   */
  onSelect?: () => void;
  /**
   * What the entry reads. In a compact bar it is not written, but it stays what
   * the pointer and a screen reader are told.
   * @default the chrome's own word for it, in the language of the page
   */
  label?: string;
  /**
   * What the pointer is told.
   * @default the chrome's own sentence, in the language of the page
   */
  title?: string;
  /**
   * What the active entry is named by, for a site whose router spells its
   * addresses rather than its tabs.
   * @default 'about'
   */
  id?: string;
  /**
   * Class names added after the component's own.
   * @default undefined
   */
  className?: string;
}

/**
 * The About entry, which leads the utilities on every site of the family: a
 * real address rather than a dialog, so the page is indexed, linkable and
 * printable.
 *
 * The glyph is `info-sign` on every site, and is not a site's to choose. It is
 * what the entry keeps once a narrow bar drops the labels, and the site's own
 * mark already stands at the other end of the same bar — drawn twice, nothing
 * in the row says which one is the site and which one is about it.
 * @param props - Where the About is, whether it is on show, and how the site
 * opens it.
 * @returns The entry.
 */
export function AboutButton(props: AboutButtonProps): ReactElement {
  const {
    href,
    active = false,
    onSelect,
    label,
    title,
    id = 'about',
    className,
  } = props;
  const t = useChromeT();

  return (
    <NavLink
      item={{
        id,
        label: label ?? t('chrome.about'),
        icon: 'info-sign',
        href,
        title: title ?? t('chrome.aboutTitle'),
        onSelect,
      }}
      active={active}
      className={className}
    />
  );
}
