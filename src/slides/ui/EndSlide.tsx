import type { ReactElement } from 'react';

import { findSiteById } from '../../ecosystem/core/lookup.ts';
import { siteUrl } from '../../ecosystem/core/sites.ts';
import { Wordmark } from '../../ecosystem/ui/Wordmark.tsx';
import { SiteMark } from '../../ecosystem/ui/marks.tsx';
import { readEndSites } from '../core/slideMarker.ts';

import type { SlideLayoutProps } from './Slide.tsx';
import { SlideBody } from './SlideBody.tsx';

/**
 * The closing slide, the player's `end` layout: what the talk covered on the
 * left, and on the right each site a `<!-- sites: id, … -->` marker names, with
 * its mark, its name in its two colours and its address, to open. An id
 * outside the family is skipped, so a deck never breaks in front of a room.
 * @param props - What the player hands every layout.
 * @returns The slide.
 */
export function EndSlide(
  props: Omit<SlideLayoutProps, 'onStep' | 'step'>,
): ReactElement {
  const { sites, body } = readEndSites(props.slide.body);
  const cards: ReactElement[] = [];
  for (const id of sites) {
    const site = findSiteById(id);
    if (site === undefined) continue;
    cards.push(
      <li key={id} className="end-slide__site">
        <a href={siteUrl(site)} target="_blank" rel="noreferrer">
          <SiteMark site={site} size={132} />
          <span className="end-slide__name">
            <Wordmark site={site} size={56} />
            <span className="end-slide__host">{site.host}</span>
          </span>
        </a>
      </li>,
    );
  }

  return (
    <div className="slide slide--end">
      <div className="slide-content end-slide">
        <div className="end-slide__recap">
          <SlideBody body={body} />
        </div>
        <ul className="end-slide__sites">{cards}</ul>
      </div>
    </div>
  );
}
