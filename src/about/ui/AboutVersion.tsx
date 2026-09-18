/**
 * Which release of a site a visitor has open, in the corner of its hero.
 *
 * A report of something going wrong is worth answering only when we know what
 * was running, and the version is the one thing an About page cannot say from
 * a hand-written record. It sits at the top of the page rather than at the
 * bottom because it is the one line a reader is asked to quote back.
 */

import type { CSSProperties, ReactElement } from 'react';

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import { releasedVersion } from '../../build/core/buildInfo.ts';
import { githubSources } from '../core/repository.ts';

export interface AboutVersionProps {
  /** What the build published about itself, or `undefined` when it published none. */
  build: BuildInfo | undefined;
  /** Where the sources live, which is what the version links into. */
  repository: string;
  /** Whether a visitor can open that repository, and so whether it is linked. */
  publicRepository: boolean;
}

/**
 * The version badge, or nothing when there is no version worth showing.
 * @param props - See {@link AboutVersionProps}.
 * @returns The badge, or `null`.
 */
export function AboutVersion(props: AboutVersionProps): ReactElement | null {
  const { build, repository, publicRepository } = props;
  const version = releasedVersion(build);
  if (version === undefined) return null;
  const sources = publicRepository ? githubSources(repository) : undefined;
  if (sources === undefined) {
    return (
      <span style={BADGE_STYLE} className="about-version">
        {version}
      </span>
    );
  }

  return (
    <a
      className="about-version"
      href={`${sources}/releases/tag/v${version}`}
      target="_blank"
      rel="noopener noreferrer"
      style={LINK_BADGE_STYLE}
    >
      {version}
    </a>
  );
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
