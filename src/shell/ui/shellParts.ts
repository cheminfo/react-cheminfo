import type { ReactNode } from 'react';

import type { AboutContent } from '../../about/core/about.ts';
import type { SiteId } from '../../ecosystem/core/sites.ts';

/**
 * A slot of the bar: an element, or a function handed whether the bar has run
 * out of room, so a site's own entries fold with the shared ones.
 */
export type ShellSlot = ReactNode | ((compact: boolean) => ReactNode);

/** The site's About: the record, and where it is served. */
export interface ShellAbout {
  /** What the site says about itself; its works also feed the Cite button. */
  content: AboutContent;
  /**
   * The About address.
   * @default the router's address of the About tab, or `/about` without one
   */
  href?: string;
  /**
   * Whether the About is the page on show, in which case it is what the main
   * area draws.
   * @default whether the router's tab is the About tab, `false` without one
   */
  active?: boolean;
  /**
   * What the site does when the entry is picked, for a page that routes in
   * place.
   * @default a move to the About tab with a router, the plain link without
   */
  onSelect?: () => void;
  /**
   * What the active entry is named by.
   * @default 'about'
   */
  id?: string;
  /**
   * What the entry reads.
   * @default the chrome's own word for it
   */
  label?: string;
  /**
   * What the pointer is told.
   * @default the chrome's own sentence
   */
  title?: string;
  /**
   * The page itself, for a site whose About carries more than its record — a
   * section of its own, a sign-in, a mark.
   * @default `<AboutPage content={content} />`
   */
  page?: ReactNode;
  /**
   * Whether the site's own router draws the About among pages it keeps
   * mounted: the shell then marks the entry active and leaves the main area
   * to the children, so going to the About and back loses nothing.
   * @default false
   */
  routed?: boolean;
}

/** The strip under the page. */
export interface ShellFooter {
  /**
   * The site the footer sits on, for a shell given a `site` record rather
   * than a `siteId`.
   * @default the shell's `siteId`, and no footer without one
   */
  siteId?: SiteId;
  /**
   * What introduces the family.
   * @default undefined
   */
  heading?: string;
  /**
   * How much of each sibling is written.
   * @default 'grid'
   */
  layout?: 'grid' | 'row';
  /**
   * One line under the family, set as the footer's note.
   * @default undefined
   */
  note?: ReactNode;
  /**
   * Anything else under the family.
   * @default undefined
   */
  children?: ReactNode;
}
