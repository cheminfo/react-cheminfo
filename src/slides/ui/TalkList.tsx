import type { ReactElement } from 'react';

import { isModifiedClick } from '../../chrome/ui/navItem.ts';
import { pluralize } from '../../format/core/index.ts';
import type { TalkManifest, TalkSummary } from '../core/index.ts';

/** The talks to list, and what opening one means. */
export interface TalkListProps {
  /** One manifest per publishing site. */
  manifests: readonly TalkManifest[];
  /** Called when a talk is picked. */
  onOpen: (manifest: TalkManifest, talk: TalkSummary) => void;
  /**
   * The address a talk sits at, which keeps the card a real link — a middle
   * click opens a tab of its own, and a crawler walks the list.
   * @default undefined — the card is a link with no address
   */
  renderHref?: (manifest: TalkManifest, talk: TalkSummary) => string;
  /**
   * How a site id is written above its talks.
   * @default the id itself
   */
  siteName?: (site: string) => string;
}

/**
 * The talks on offer: a site's own, or the whole family's.
 *
 * The site heading appears only once there is more than one site to tell
 * apart, so the same component draws a single site's `/talks` page and the
 * family-wide listing without either looking like the other one's leftovers.
 * @param props - See {@link TalkListProps}.
 * @returns The listing.
 */
export function TalkList(props: TalkListProps): ReactElement {
  const { manifests, onOpen, renderHref, siteName } = props;
  const groups = groupBySite(manifests);
  const showSite = groups.length > 1;

  return (
    <div className="talk-list">
      {groups.map((group) => (
        <section key={group.site} className="talk-list-group">
          {showSite ? (
            <h2 className="talk-list-site">
              {siteName === undefined ? group.site : siteName(group.site)}
            </h2>
          ) : null}
          <div className="talk-grid">
            {group.entries.map(({ manifest, talk }) => (
              <a
                key={`${manifest.site}:${talk.id}`}
                className="talk-card"
                href={renderHref?.(manifest, talk)}
                onClick={(event) => {
                  if (isModifiedClick(event)) return;
                  event.preventDefault();
                  onOpen(manifest, talk);
                }}
              >
                <div className="talk-card-title">{talk.title}</div>
                {talk.subtitle === undefined ? null : (
                  <div className="talk-card-subtitle">{talk.subtitle}</div>
                )}
                <div className="talk-card-meta">{occasion(talk)}</div>
                <div className="talk-card-count">
                  {`${talk.slideCount} ${pluralize(talk.slideCount, 'slide')}`}
                </div>
              </a>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** One talk, together with the manifest that published it. */
interface TalkEntry {
  /** The manifest the talk was listed in. */
  manifest: TalkManifest;
  /** The talk itself. */
  talk: TalkSummary;
}

/** Every talk one site published, most recent first. */
interface TalkGroup {
  /** The `ECOSYSTEM_SITES` id of the publishing site. */
  site: string;
  /** Its talks. */
  entries: TalkEntry[];
}

function groupBySite(manifests: readonly TalkManifest[]): TalkGroup[] {
  const bySite = new Map<string, TalkEntry[]>();
  for (const manifest of manifests) {
    let entries = bySite.get(manifest.site);
    if (entries === undefined) {
      entries = [];
      bySite.set(manifest.site, entries);
    }
    for (const talk of manifest.talks) entries.push({ manifest, talk });
  }

  const groups: TalkGroup[] = [];
  for (const [site, entries] of bySite) {
    groups.push({ site, entries: entries.toSorted(byMostRecent) });
  }
  return groups;
}

// The dates are ISO, so they order as text; a talk with no date sorts last
// rather than ahead of every dated one.
function byMostRecent(left: TalkEntry, right: TalkEntry): number {
  const before = left.talk.date ?? '';
  const after = right.talk.date ?? '';
  if (before === after) return 0;
  if (before === '') return 1;
  if (after === '') return -1;
  return before > after ? -1 : 1;
}

function occasion(talk: TalkSummary): string {
  const parts: string[] = [];
  if (talk.event !== undefined) parts.push(talk.event);
  if (talk.date !== undefined) parts.push(talk.date);
  return parts.join(' · ');
}
