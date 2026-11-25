import type { ReactElement, ReactNode } from 'react';

import type { NavItem } from '../../chrome/ui/navItem.ts';
import type { CitedWork } from '../../citation/core/works.ts';
import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';
import type { TabRouter } from '../../router/core/tabRouter.ts';
import type { ShareParamCodecs } from '../../share/core/index.ts';

import type { ShareControlProps } from './ShareControl.tsx';
import type { ShellAbout, ShellFooter, ShellSlot } from './shellParts.ts';

/** What `SiteShell` needs. */
export interface SiteShellProps<
  Codecs extends ShareParamCodecs = Record<string, never>,
  Tab extends string = string,
> {
  /**
   * The site, named. One of `site` and `siteId` is required.
   * @default undefined
   */
  siteId?: SiteId;
  /**
   * The site, passed rather than named, for one outside the family's registry.
   * @default undefined
   */
  site?: SiteRecord;
  /**
   * The site's own mark, for a site the shared glyphs do not hold.
   * @default the family's mark for the site
   */
  mark?: ReactNode;
  /**
   * Edge of the mark, in pixels.
   * @default 28
   */
  markSize?: number;
  /**
   * The site's router. With it the shell follows the address itself: the
   * page on show is the tab it names, and the About tab is served as the About
   * page.
   * @default undefined — the page says which entry is active
   */
  router?: TabRouter<Tab>;
  /**
   * The tab the About is served at.
   * @default 'about'
   */
  aboutTab?: Tab;
  /** The pages, in the order the bar lists them; About is not one of them. */
  nav: readonly NavItem[];
  /**
   * Which of the pages is on show.
   * @default the router's tab, or none without a router
   */
  activeId?: string;
  /**
   * Where the brand leads.
   * @default '/'
   */
  homeHref?: string;
  /**
   * What the site does when the brand is picked.
   * @default undefined
   */
  onHome?: () => void;
  /**
   * Draws one page the site's own way.
   * @default undefined
   */
  renderNavItem?: (item: NavItem, isActive: boolean) => ReactNode;
  /**
   * The part a link hides the pages with; the bar then lists none.
   * @default 'tabs'
   */
  navPart?: string;
  /**
   * How wide the bar, the page and the footer run, all three alike.
   * @default 'page'
   */
  width?: 'page' | 'full';
  /**
   * Whether the page is framed in another site: no bar, no footer, and the
   * frame as the margin.
   * @default false
   */
  embedded?: boolean;
  /**
   * The parts the link switches off, provided to every `PagePart` below.
   * @default undefined — no provider; the page brings its own
   */
  hidden?: readonly string[];
  /**
   * The About entry and page; `false` leaves both out.
   * @default false
   */
  about?: ShellAbout | false;
  /**
   * The works the Cite button offers; `false` leaves it out.
   * @default the About's works, and no button when it has none
   */
  cite?: readonly CitedWork[] | false;
  /**
   * Whether the Tools menu of the family is in the bar.
   * @default true
   */
  ecosystem?: boolean;
  /**
   * Entries before About — the help of a tool whose keys nobody guesses.
   * @default undefined
   */
  actionsBeforeAbout?: ShellSlot;
  /**
   * Entries between About and Cite — an API link, a version.
   * @default undefined
   */
  actionsAfterAbout?: ShellSlot;
  /**
   * Entries between Cite and Tools — a feedback form, a specification.
   * @default undefined
   */
  actionsAfterCite?: ShellSlot;
  /**
   * Entries after Tools — a unit picker, an admin action.
   * @default undefined
   */
  actions?: ShellSlot;
  /**
   * The language switcher, after the site's own entries.
   * @default undefined
   */
  language?: ShellSlot;
  /**
   * Who is signed in, at the right end.
   * @default undefined
   */
  account?: ReactNode;
  /**
   * The Share entry: what `ShareControl` is given, the shell passing it the
   * site and the compact state, or a control of the site's own.
   * @default undefined — no Share entry
   */
  share?: ShareControlProps<Codecs> | ReactElement;
  /**
   * The contact form of the Contact entry, or `false` to leave it out.
   * @default the family's form
   */
  contact?: string | false;
  /**
   * What sits between the bar and the page — a tagline, a banner — dropped
   * with the bar when the page is framed.
   * @default undefined
   */
  belowHeader?: ReactNode;
  /**
   * Classes the main area carries beside the shell's own.
   * @default undefined
   */
  mainClassName?: string;
  /**
   * The page fills the window and never scrolls itself: a workbench whose
   * panels each scroll inside it.
   * @default false — the page scrolls
   */
  fillWindow?: boolean;
  /**
   * `data-testid` of the main area.
   * @default undefined
   */
  mainTestId?: string;
  /**
   * The element the page is drawn in: `div` for a page that brings its own
   * `<main>` — an embedded Swagger UI — so the document keeps one landmark.
   * @default 'main'
   */
  mainElement?: 'main' | 'div';
  /**
   * The strip under the page, or `false` for none on this page.
   * @default the family's links alone
   */
  footer?: ShellFooter | false;
  /** The page the address names. */
  children: ReactNode;
}
