/**
 * Which build of a site a visitor has open, in the corner of its hero.
 *
 * A report of something going wrong is worth answering only when we know what
 * was running, and that is the one thing an About page cannot say from a
 * hand-written record. It sits at the top of the page rather than at the
 * bottom because it is the one line a reader is asked to quote back, and it is
 * said once: nothing further down the page repeats it.
 */

import { Tooltip } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import {
  buildLabel,
  buildStamp,
  releasedVersion,
} from '../../build/core/buildInfo.ts';

import { AboutBuildDetails } from './AboutBuildDetails.tsx';

export interface AboutVersionProps {
  /** What the build published about itself, or `undefined` when it published none. */
  build: BuildInfo | undefined;
}

/**
 * The build badge: the release a site is serving, or the commit it was built
 * from while it has no release yet, and when it was made. A release names its
 * commit and the exact instant in the card its hover opens.
 * @param props - See {@link AboutVersionProps}.
 * @returns The badge, or `null` when the build says nothing worth showing.
 */
export function AboutVersion(props: AboutVersionProps): ReactElement | null {
  const { build } = props;
  const label = buildLabel(build);
  if (build === undefined || label === undefined) return null;
  // The instant belongs on the badge rather than in its hover: a version
  // nobody can date says nothing about how old the page they read is.
  const badge = `${label} · ${buildStamp(build.builtAt)}`;
  const version = releasedVersion(build);

  if (version === undefined) {
    return (
      <span style={BADGE_STYLE} className="about-version">
        {badge}
      </span>
    );
  }

  return (
    <Tooltip
      content={<AboutBuildDetails build={build} version={version} />}
      // To the left, so the card never covers the way to sign in under it.
      placement="left-start"
      popoverClassName="help-tooltip build-tooltip"
      hoverOpenDelay={150}
    >
      <span style={BADGE_STYLE} className="about-version" tabIndex={0}>
        {badge}
      </span>
    </Tooltip>
  );
}

const BADGE_STYLE = {
  flex: '0 0 auto',
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  fontSize: 13,
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;
