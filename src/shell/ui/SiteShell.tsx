import type { ReactElement } from 'react';

import { writeRoute } from '../../router/core/history.ts';
import type { TabRouter } from '../../router/core/tabRouter.ts';
import { useTabRoute } from '../../router/ui/useTabRoute.ts';
import type { ShareParamCodecs } from '../../share/core/index.ts';

import { ShellFrame } from './ShellFrame.tsx';
import type { ShellAbout } from './shellParts.ts';
import type { SiteShellProps } from './siteShellProps.ts';

export type { ShellAbout, ShellFooter, ShellSlot } from './shellParts.ts';
export type { SiteShellProps } from './siteShellProps.ts';

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
