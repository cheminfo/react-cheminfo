import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import { formatBuiltAt, shortCommit } from '../../build/core/buildInfo.ts';
import { githubSources } from '../core/repository.ts';

export interface AboutBuildProps {
  /** What the build published about itself. */
  build: BuildInfo;
  /** Where the sources live, which is what the version and commit link into. */
  repository: string;
}

/**
 * The one line that says when the build a visitor has open was made.
 *
 * A report of something going wrong is worth answering only when we know what
 * was running. The version itself is in the hero, where a reader is asked to
 * quote it from; this line carries the rest, and the commit links into the
 * repository, so the change that caused a problem is one click from the page
 * that shows it.
 * @param props - See {@link AboutBuildProps}.
 * @returns The line.
 */
export function AboutBuild(props: AboutBuildProps): ReactElement {
  const { build, repository } = props;
  const sources = githubSources(repository);

  return (
    <p style={PARAGRAPH_STYLE}>
      Built {formatBuiltAt(build.builtAt)}
      {build.commit === undefined ? null : (
        <>
          {' from commit '}
          <Reference
            href={
              sources === undefined
                ? undefined
                : `${sources}/commit/${build.commit}`
            }
          >
            {shortCommit(build.commit)}
          </Reference>
        </>
      )}
      .
    </p>
  );
}

function Reference(props: {
  href: string | undefined;
  children: ReactNode;
}): ReactElement {
  const { href, children } = props;
  if (href === undefined) return <code style={CODE_STYLE}>{children}</code>;

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={LINK_STYLE}>
      <code style={CODE_STYLE}>{children}</code>
    </a>
  );
}

const PARAGRAPH_STYLE = {
  margin: '8px 0 0',
  color: 'var(--text-muted)',
  fontSize: 13,
} as const satisfies CSSProperties;

const CODE_STYLE = {
  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
  fontSize: 13,
} as const satisfies CSSProperties;

const LINK_STYLE = { color: 'var(--accent)' } as const satisfies CSSProperties;
