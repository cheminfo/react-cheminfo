/**
 * The body of `SiteShell`, once the route has been read: the theme, the bar,
 * the page and the footer.
 */

import type { ReactElement, ReactNode } from 'react';
import { isValidElement } from 'react';

import { AboutPage } from '../../about/ui/AboutPage.tsx';
import { AboutButton } from '../../chrome/ui/AboutButton.tsx';
import { SiteFooter } from '../../chrome/ui/SiteFooter.tsx';
import { SiteHeader } from '../../chrome/ui/SiteHeader.tsx';
import { useCompactHeader } from '../../chrome/ui/useCompactHeader.ts';
import { CiteButton } from '../../citation/ui/CiteButton.tsx';
import { EcosystemButton } from '../../ecosystem/ui/EcosystemButton.tsx';
import { SiteTheme } from '../../ecosystem/ui/SiteTheme.tsx';
import type { ShareParamCodecs } from '../../share/core/index.ts';
import { HiddenPartsProvider } from '../../share/ui/HiddenPartsProvider.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import { ShareControl } from './ShareControl.tsx';
import type { ShellSlot, SiteShellProps } from './SiteShell.tsx';

/**
 * Draw the shell.
 * @param props - The shell's props, the route already read.
 * @returns The page in its chrome.
 */
export function ShellFrame<Codecs extends ShareParamCodecs, Tab extends string>(
  props: SiteShellProps<Codecs, Tab>,
): ReactElement {
  const {
    siteId,
    site,
    mark,
    markSize,
    nav,
    activeId,
    homeHref,
    onHome,
    renderNavItem,
    navPart = 'tabs',
    width = 'page',
    embedded = false,
    hidden,
    about = false,
    contact,
    belowHeader,
    mainClassName,
    mainTestId,
    footer = {},
    account,
    children,
  } = props;
  const compact = useCompactHeader();
  const footerSiteId = footer === false ? undefined : (footer.siteId ?? siteId);
  const aboutOnShow = about !== false && about.active === true;

  const page = (
    <>
      {siteId === undefined ? (
        <SiteTheme site={site} />
      ) : (
        <SiteTheme siteId={siteId} />
      )}
      <div className="site-shell">
        <SiteHeader
          siteId={siteId}
          site={site}
          mark={mark}
          markSize={markSize}
          embedded={embedded}
          width={width}
          nav={hidden?.includes(navPart) ? [] : nav}
          activeId={aboutOnShow ? (about.id ?? 'about') : activeId}
          homeHref={homeHref}
          onHome={onHome}
          renderNavItem={renderNavItem}
          contact={contact}
          actions={<ShellActions {...props} compact={compact} />}
          share={<ShellShare {...props} compact={compact} />}
          account={account}
        />
        {embedded ? null : belowHeader}
        <main
          className={joinClassNames(
            'site-shell__main',
            width === 'full' ? 'site-shell__main--full' : undefined,
            embedded ? 'site-shell__main--embedded' : undefined,
            mainClassName,
          )}
          data-testid={mainTestId}
        >
          {aboutOnShow
            ? (about.page ?? <AboutPage content={about.content} />)
            : children}
        </main>
      </div>
      {footer === false || footerSiteId === undefined ? null : (
        <SiteFooter
          siteId={footerSiteId}
          embedded={embedded}
          width={width}
          heading={footer.heading}
          layout={footer.layout}
        >
          {footer.note === undefined ? null : (
            <p className="app-footer__note">{footer.note}</p>
          )}
          {footer.children}
        </SiteFooter>
      )}
    </>
  );

  return hidden === undefined ? (
    page
  ) : (
    <HiddenPartsProvider hidden={hidden}>{page}</HiddenPartsProvider>
  );
}

type ActionProps<
  Codecs extends ShareParamCodecs,
  Tab extends string,
> = SiteShellProps<Codecs, Tab> & { compact: boolean };

function ShellActions<Codecs extends ShareParamCodecs, Tab extends string>(
  props: ActionProps<Codecs, Tab>,
): ReactNode {
  const {
    siteId,
    about = false,
    cite,
    ecosystem = true,
    actionsAfterAbout,
    actionsAfterCite,
    actions,
    language,
    compact,
  } = props;
  const works = cite ?? (about === false ? [] : (about.content.cite ?? []));
  return (
    <>
      {about === false ? null : (
        <AboutButton
          id={about.id}
          href={about.href ?? '/about'}
          active={about.active}
          onSelect={about.onSelect}
          label={about.label}
          title={about.title}
        />
      )}
      {fill(actionsAfterAbout, compact)}
      {works === false || works.length === 0 ? null : (
        <CiteButton works={works} compact={compact} />
      )}
      {fill(actionsAfterCite, compact)}
      {ecosystem ? (
        <EcosystemButton currentSiteId={siteId} compact={compact} />
      ) : null}
      {fill(actions, compact)}
      {fill(language, compact)}
    </>
  );
}

function ShellShare<Codecs extends ShareParamCodecs, Tab extends string>(
  props: ActionProps<Codecs, Tab>,
): ReactNode {
  const { share, siteId, compact } = props;
  if (share === undefined) return null;
  if (isValidElement(share)) return share;
  return <ShareControl<Codecs> siteId={siteId} compact={compact} {...share} />;
}

function fill(slot: ShellSlot, compact: boolean): ReactNode {
  return typeof slot === 'function' ? slot(compact) : slot;
}
