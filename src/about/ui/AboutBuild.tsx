import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import { formatBuiltAt, shortCommit } from '../../build/core/buildInfo.ts';

export interface AboutBuildProps {
  /** What the build published about itself. */
  build: BuildInfo;
  /** Where the sources live, which is what the version and commit link into. */
  repository: string;
}

/**
 * The one line that says which build of the site a visitor has open.
 *
 * A report of something going wrong is worth answering only when we know what
 * was running, and a visitor cannot read that off the page otherwise. The
 * version and the commit link into the repository, so the change that caused a
 * problem is one click from the page that shows it.
 * @param props - See {@link AboutBuildProps}.
 * @returns The line.
 */
export function AboutBuild(props: AboutBuildProps): ReactElement {
  const { build, repository } = props;
  const sources = repository.endsWith('/')
    ? repository.slice(0, -1)
    : repository;
  const onGitHub = sources.startsWith(GITHUB);

  return (
    <p style={PARAGRAPH_STYLE}>
      Running version{' '}
      <Reference
        href={
          onGitHub ? `${sources}/releases/tag/v${build.version}` : undefined
        }
      >
        {build.version}
      </Reference>
      , built {formatBuiltAt(build.builtAt)}
      {build.commit === undefined ? null : (
        <>
          {' from commit '}
          <Reference
            href={onGitHub ? `${sources}/commit/${build.commit}` : undefined}
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

const GITHUB = 'https://github.com/';

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
