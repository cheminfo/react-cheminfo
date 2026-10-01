import type { CSSProperties, ReactElement } from 'react';

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import { formatBuiltAt, shortCommit } from '../../build/core/buildInfo.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

export interface AboutBuildProps {
  /** What the build published about itself. */
  build: BuildInfo;
}

/**
 * The one line that says when the build a visitor has open was made.
 *
 * A report of something going wrong is worth answering only when we know what
 * was running. The version itself is in the hero, where a reader is asked to
 * quote it from; this line carries the rest, so a report can name the exact
 * build the problem was seen on.
 * @param props - See {@link AboutBuildProps}.
 * @returns The line.
 */
export function AboutBuild(props: AboutBuildProps): ReactElement {
  const { build } = props;
  const t = useChromeT();
  const builtAt = formatBuiltAt(build.builtAt);
  if (build.commit === undefined) {
    return <p style={PARAGRAPH_STYLE}>{t('about.built', { builtAt })}</p>;
  }

  // The commit sits inside a sentence whose word order is the translator's,
  // so the message names where it goes and is split there.
  const [before = '', after = ''] = t('about.builtFromCommit', {
    builtAt,
  }).split('{commit}');

  return (
    <p style={PARAGRAPH_STYLE}>
      {before}
      <code style={CODE_STYLE}>{shortCommit(build.commit)}</code>
      {after}
    </p>
  );
}

const PARAGRAPH_STYLE = {
  margin: 0,
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;

const CODE_STYLE = {
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  fontSize: 13,
} as const satisfies CSSProperties;
