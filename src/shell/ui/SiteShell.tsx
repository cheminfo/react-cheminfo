import type { ReactElement, ReactNode } from 'react';

import type { AboutContent } from '../../about/core/about.ts';
import type { NavItem } from '../../chrome/ui/navItem.ts';
import type { CitedWork } from '../../citation/core/works.ts';
import type { SiteId, SiteRecord } from '../../ecosystem/core/sites.ts';
import { writeRoute } from '../../router/core/history.ts';
import type { TabRouter } from '../../router/core/tabRouter.ts';
import { useTabRoute } from '../../router/ui/useTabRoute.ts';
import type { ShareParamCodecs } from '../../share/core/index.ts';

import type { ShareControlProps } from './ShareControl.tsx';
import { ShellFrame } from './ShellFrame.tsx';

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

/** What {@link SiteShell} needs. */
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
   * `data-testid` of the main area.
   * @default undefined
   */
  mainTestId?: string;
  /**
   * The strip under the page, or `false` for none on this page.
   * @default the family's links alone
   */
  footer?: ShellFooter | false;
  /** The page the address names. */
  children: ReactNode;
}

/**
 * The chrome every site of the family carries, around its page: the theme,
 * the bar with About · Cite · Tools · Contact · Share at its right, the page,
 * and the footer linking every sibling. A framed page gets the page alone.
 *
 * Everything the bar holds is the shared components, in the family's order; a
 * site fills the slots between them and never re-orders them. With a router,
 * the shell also follows the address: it marks the tab on show and serves the
 * About tab as the shared About page.
 * @param props - See {@link SiteShellProps}.
 * @returns The page in its chrome.
 */
export function SiteShell<
  Codecs extends ShareParamCodecs = Record<string, never>,
  Tab extends string = string,
>(props: SiteShellProps<Codecs, Tab>): ReactElement {
  const { router } = props;
  if (router === undefined) return <ShellFrame {...props} />;
  return <RoutedShell {...props} router={router} />;
}

function RoutedShell<Codecs extends ShareParamCodecs, Tab extends string>(
  props: SiteShellProps<Codecs, Tab> & { router: TabRouter<Tab> },
): ReactElement {
  const { router, aboutTab = 'about' as Tab, about, activeId } = props;
  const route = useTabRoute(router);
  const routedAbout: ShellAbout | false =
    about === undefined || about === false
      ? false
      : {
          ...about,
          href: about.href ?? router.format({ tab: aboutTab }),
          active: about.active ?? route.tab === aboutTab,
          onSelect:
            about.onSelect ??
            (() => {
              writeRoute(router, { tab: aboutTab });
            }),
        };
  return (
    <ShellFrame
      {...props}
      about={routedAbout}
      activeId={activeId ?? route.tab}
    />
  );
}
