import { Icon } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { useSiteLanguage } from '../../language/ui/siteLanguageContext.ts';
import { FilterInput } from '../../panel/ui/FilterInput.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import { ECOSYSTEM_HOME_HOST, ecosystemHomeUrl } from '../core/home.ts';
import { searchSites, searchWords } from '../core/searchSites.ts';
import type { SiteId } from '../core/sites.ts';
import { siteUrl } from '../core/sites.ts';

import { SiteGroupGrid } from './SiteGroupGrid.tsx';
import { ECOSYSTEM_HEADING_STYLE } from './ecosystemStyles.ts';

const PANEL_STYLE: CSSProperties = {
  display: 'flex',
  width: 'min(62rem, 92vw)',
  maxHeight: 'min(72vh, 44rem)',
  flexDirection: 'column',
  padding: '12px 16px 4px',
  gap: 10,
  overflowY: 'auto',
};
const HEADER_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '6px 16px',
};
const HEADING_STYLE: CSSProperties = {
  ...ECOSYSTEM_HEADING_STYLE,
  flex: '1 1 auto',
};
const SEARCH_STYLE: CSSProperties = { width: 'min(16rem, 100%)' };
const HOME_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  color: TOKEN.textMuted,
  fontSize: '0.75rem',
  fontWeight: 600,
  gap: 5,
  whiteSpace: 'nowrap',
};
const NO_MATCH_STYLE: CSSProperties = {
  margin: '4px 0 16px',
  color: TOKEN.textMuted,
  fontSize: '0.8125rem',
};

/** What the Tools menu needs. */
export interface EcosystemMenuProps {
  /**
   * The site the visitor is already on, which is shown but never linked.
   * @default undefined
   */
  currentSiteId?: SiteId;
  /**
   * Whether the visitor is on the family's entrance, www.cheminfo.org, which
   * the menu then does not link back to.
   * @default false
   */
  atHome?: boolean;
  /**
   * Class names added to the root element, after the component's own.
   * @default undefined
   */
  className?: string;
}

/**
 * What the ecosystem button opens: every site of the family, gathered under the
 * topic it belongs to, each behind its own little logo and the two colours it
 * owns, with a search over them and a link to the family's entrance.
 *
 * The topics are what make the menu answer a question a flat grid of tiles
 * never could — which of these is for a first-year course, and which for
 * a research project. The search answers the other question, the one asked by
 * name: it keeps the topics, leaves out the sites that do not answer, lights
 * the best one, and Enter opens it. It lives in a popover, so a crawler never
 * reaches it; `EcosystemLinks` is what carries the family through the page
 * itself.
 * @param props - The site the visitor is already on.
 * @returns The search, the topics and their sites.
 */
export function EcosystemMenu(props: EcosystemMenuProps): ReactElement {
  const { className, currentSiteId, atHome = false } = props;
  const t = useChromeT();
  const language = useSiteLanguage();
  const [query, setQuery] = useState('');

  const searching = searchWords(query).length > 0;
  const found = searchSites(query, {
    texts: (site) => [
      t.or(`site.${site.id}.tagline`, site.tagline),
      t.or(`ecosystem.group.${site.group}.label`, ''),
    ],
  });
  const target = found.find((site) => site.id !== currentSiteId);

  return (
    <div
      className={joinClassNames('ecosystem-menu', className)}
      style={PANEL_STYLE}
    >
      <div style={HEADER_STYLE}>
        <div style={HEADING_STYLE}>{t('ecosystem.menuHeading')}</div>
        <div style={SEARCH_STYLE}>
          <FilterInput
            autoFocus
            value={query}
            placeholder={t('ecosystem.search')}
            ariaLabel={t('ecosystem.search')}
            onValueChange={setQuery}
            onEnter={() => {
              if (target === undefined) return;
              globalThis.open(
                siteUrl(target, { language }),
                '_blank',
                'noreferrer',
              );
            }}
          />
        </div>
        {atHome ? null : (
          <a
            href={ecosystemHomeUrl({ language })}
            target="_blank"
            rel="noreferrer"
            title={t('ecosystem.homeTitle')}
            style={HOME_STYLE}
          >
            <Icon icon="home" size={12} />
            {ECOSYSTEM_HOME_HOST}
          </a>
        )}
      </div>
      {searching && found.length === 0 ? (
        <p style={NO_MATCH_STYLE}>
          {t('ecosystem.noMatch', { query: query.trim() })}
        </p>
      ) : (
        <SiteGroupGrid
          currentSiteId={currentSiteId}
          only={searching ? new Set(found.map((site) => site.id)) : undefined}
          pointed={searching ? target?.id : undefined}
          lit
          newTab
        />
      )}
    </div>
  );
}
