import type { ReactElement } from 'react';

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import { formatBuiltAt, shortCommit } from '../../build/core/buildInfo.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

/**
 * What the badge of a release leaves to its hover: the commit it was built
 * from, the instant to the second, and the chrome it was built against.
 * @param props - The build and its released version.
 * @param props.build - What the build published about itself.
 * @param props.version - The release the badge names.
 * @returns The card's contents.
 */
export function AboutBuildDetails(props: {
  build: BuildInfo;
  version: string;
}): ReactElement {
  const { build, version } = props;
  const t = useChromeT();

  return (
    <>
      <div className="build-tooltip__header">
        {t('about.buildVersion', { version })}
      </div>
      <dl className="build-tooltip__rows">
        <dt>{t('about.buildBuilt')}</dt>
        <dd>{formatBuiltAt(build.builtAt)}</dd>
        {build.commit === undefined ? null : (
          <>
            <dt>{t('about.buildCommit')}</dt>
            <dd>{shortCommit(build.commit)}</dd>
          </>
        )}
        {build.reactCheminfo === undefined ? null : (
          <>
            <dt>react-cheminfo</dt>
            <dd>{build.reactCheminfo}</dd>
          </>
        )}
      </dl>
    </>
  );
}
