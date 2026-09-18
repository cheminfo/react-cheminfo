/**
 * Which build of a site a visitor has open, in the corner of its hero.
 *
 * A report of something going wrong is worth answering only when we know what
 * was running, and that is the one thing an About page cannot say from a
 * hand-written record. It sits at the top of the page rather than at the
 * bottom because it is the one line a reader is asked to quote back.
 */

import type { CSSProperties, ReactElement } from 'react';

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import {
  buildLabel,
  buildStamp,
  buildSummary,
  releasedVersion,
} from '../../build/core/buildInfo.ts';
import { githubSources } from '../core/repository.ts';

export interface AboutVersionProps {
  /** What the build published about itself, or `undefined` when it published none. */
  build: BuildInfo | undefined;
  /** Where the sources live, which is what the badge links into. */
  repository: string;
  /** Whether a visitor can open that repository, and so whether it is linked. */
  publicRepository: boolean;
}

/**
 * The build badge: the release a site is serving, or the commit it was built
 * from while it has no release yet, and when it was made.
 * @param props - See {@link AboutVersionProps}.
 * @returns The badge, or `null` when the build says nothing worth showing.
 */
export function AboutVersion(props: AboutVersionProps): ReactElement | null {
  const { build, repository, publicRepository } = props;
  const label = buildLabel(build);
  if (build === undefined || label === undefined) return null;
  const href = publicRepository ? addressOf(build, repository) : undefined;
  const summary = buildSummary(build);
  // The instant belongs on the badge rather than in its hover: a version
  // nobody can date says nothing about how old the page they read is.
  const badge = `${label} · ${buildStamp(build.builtAt)}`;
  if (href === undefined) {
    return (
      <span style={BADGE_STYLE} className="about-version" title={summary}>
        {badge}
      </span>
    );
  }

  return (
    <a
      className="about-version"
      href={href}
      title={summary}
      target="_blank"
      rel="noopener noreferrer"
      style={LINK_BADGE_STYLE}
    >
      {badge}
    </a>
  );
}

/**
 * What the badge opens: the release it names, or the commit it was built from.
 * @param build - What the build published about itself.
 * @param repository - Where the sources live.
 * @returns The address, or `undefined` when nothing inside the repository can
 * be addressed.
 */
function addressOf(build: BuildInfo, repository: string): string | undefined {
  const sources = githubSources(repository);
  if (sources === undefined) return undefined;
  const version = releasedVersion(build);
  if (version !== undefined) return `${sources}/releases/tag/v${version}`;
  return build.commit === undefined
    ? undefined
    : `${sources}/commit/${build.commit}`;
}

const BADGE_STYLE = {
  flex: '0 0 auto',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  fontSize: 13,
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;

const LINK_BADGE_STYLE = {
  ...BADGE_STYLE,
  color: 'var(--accent)',
} as const satisfies CSSProperties;
