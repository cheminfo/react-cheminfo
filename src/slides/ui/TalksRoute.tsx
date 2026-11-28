import type { ComponentType, ReactElement, ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { TabRouter } from '../../router/core/tabRouterTypes.ts';
import { useTabRoute } from '../../router/ui/useTabRoute.ts';
import type { SiteTalk, SiteTalks } from '../core/siteTalks.ts';
import { SLIDE_PARAM, slideParam } from '../core/slideAddress.ts';
import { openTalk, showTalkSlide } from '../core/talkNavigation.ts';

import type { RenderSlideLink } from './DemoLink.tsx';
import type { SlideLayoutProps } from './Slide.tsx';
import { Slideshow } from './Slideshow.tsx';
import { TalkList } from './TalkList.tsx';
import type { SlideshowFullscreen } from './useSlideshowFullscreen.ts';

/** Props of {@link TalksRoute}. */
export interface TalksRouteProps<Tab extends string> {
  /** The site's router, created once at module level. */
  router: TabRouter<Tab>;
  /** The tab whose bare address lists the talks and whose `/<id>` plays one. */
  tab: Tab;
  /** The site's decks, from `createSiteTalks`. */
  talks: SiteTalks;
  /** The heading of the list. */
  title: ReactNode;
  /**
   * The line under the heading.
   * @default undefined — none
   */
  lead?: ReactNode;
  /**
   * The layouts this site adds to the player.
   * @default undefined
   */
  layouts?: Record<string, ComponentType<SlideLayoutProps>>;
  /**
   * The site's own link, for the in-app links the slides hold.
   * @default undefined — a plain anchor
   */
  renderLink?: RenderSlideLink;
  /**
   * The host this site is published at, whose addresses a deck plays from the
   * page's own origin.
   * @default undefined — addresses are played as written
   */
  frameHost?: string;
  /**
   * Fullscreen owned by the site rather than by the player.
   * @default undefined — the player fullscreens itself
   */
  fullscreen?: SlideshowFullscreen;
}

/**
 * A site's talks: their list at the tab's bare address, and one talk at
 * `/<id>`, played with the slide on show in `?slide=` counted from one, so the
 * address bar is the link to it. The route is controlled by the site's own
 * router; opening a talk and leaving it are entries of their own in the
 * history, turning a slide rewrites the current one.
 * @param props - See {@link TalksRouteProps}.
 * @returns The list, the player, or a way back when no talk has that name.
 */
export function TalksRoute<Tab extends string>(
  props: TalksRouteProps<Tab>,
): ReactElement {
  const {
    router,
    tab,
    talks,
    title,
    lead,
    layouts,
    renderLink,
    frameHost,
    fullscreen,
  } = props;
  const { id, params } = useTabRoute(router);
  if (id === null) {
    return (
      <TalksIndex
        router={router}
        tab={tab}
        talks={talks}
        title={title}
        lead={lead}
      />
    );
  }

  const talk = talks.find(id);
  if (talk === undefined) {
    return <MissingTalk router={router} tab={tab} talkId={id} />;
  }
  return (
    <div className="talk-page">
      <TalkPlayer
        router={router}
        tab={tab}
        talk={talk}
        index={SLIDE.parse(params[SLIDE_PARAM])}
        layouts={layouts}
        renderLink={renderLink}
        frameHost={frameHost}
        fullscreen={fullscreen}
      />
    </div>
  );
}

function TalksIndex<Tab extends string>(
  props: Pick<TalksRouteProps<Tab>, 'router' | 'tab' | 'talks' | 'title'> & {
    lead: ReactNode;
  },
): ReactElement {
  const { router, tab, talks, title, lead } = props;
  const manifest = useMemo(() => {
    const location = globalThis.location as Location | undefined;
    return talks.manifest(location?.origin ?? '');
  }, [talks]);
  return (
    <div className="talks-page">
      <h1>{title}</h1>
      {lead === undefined ? null : <p className="talks-page__lead">{lead}</p>}
      <TalkList
        manifests={[manifest]}
        onOpen={(_, talk) => {
          openTalk(router, tab, talk.id);
        }}
        renderHref={(_, talk) => router.format({ tab, id: talk.id })}
      />
    </div>
  );
}

function MissingTalk<Tab extends string>(props: {
  router: TabRouter<Tab>;
  tab: Tab;
  talkId: string;
}): ReactElement {
  const { router, tab, talkId } = props;
  const t = useChromeT();
  return (
    <div className="talks-page">
      <p>{t('slides.noSuchTalk', { id: talkId })}</p>
      <a href={router.format({ tab })}>{t('slides.everyTalk')}</a>
    </div>
  );
}

interface TalkPlayerProps<Tab extends string> extends Pick<
  TalksRouteProps<Tab>,
  'router' | 'tab'
> {
  talk: SiteTalk;
  index: number;
  layouts: TalksRouteProps<Tab>['layouts'];
  renderLink: RenderSlideLink | undefined;
  frameHost: string | undefined;
  fullscreen: SlideshowFullscreen | undefined;
}

function TalkPlayer<Tab extends string>(
  props: TalkPlayerProps<Tab>,
): ReactElement {
  const {
    router,
    tab,
    talk,
    index,
    layouts,
    renderLink,
    frameHost,
    fullscreen,
  } = props;
  const talkId = talk.id;
  const onIndex = useCallback(
    (next: number) => {
      showTalkSlide(router, tab, talkId, next);
    },
    [router, tab, talkId],
  );
  const onExit = useCallback(() => {
    openTalk(router, tab, null);
  }, [router, tab]);

  return (
    <Slideshow
      talk={talk}
      talkId={talkId}
      index={index}
      onIndex={onIndex}
      onExit={onExit}
      layouts={layouts}
      renderLink={renderLink}
      frameHost={frameHost}
      fullscreen={fullscreen}
    />
  );
}

const SLIDE = slideParam();
