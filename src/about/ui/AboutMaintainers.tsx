import type { CSSProperties, ReactElement } from 'react';

import { useLanguage } from '../../i18n/ui/useLanguage.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { MaintainerLine } from '../core/team.ts';

import { RoleText } from './RoleText.tsx';

export interface AboutMaintainersProps {
  /** Who maintains what the site runs on. */
  maintainers: readonly MaintainerLine[];
}

/**
 * Who maintains the libraries and the tooling a site runs on, which on a site
 * made with others is not who made it.
 * @param props - See {@link AboutMaintainersProps}.
 * @returns The list.
 */
export function AboutMaintainers(props: AboutMaintainersProps): ReactElement {
  const t = useChromeT();
  const language = useLanguage();

  return (
    <ul style={LIST_STYLE}>
      {props.maintainers.map(({ name, organisation, works, tooling }) => {
        const named = tooling ? [...works, t('about.role.theTooling')] : works;
        const text = t('about.role.maintains', {
          works: new Intl.ListFormat(language).format(named),
        });
        return (
          <li key={name}>
            <strong>{name}</strong> —{' '}
            <RoleText text={text} organisation={organisation} />
          </li>
        );
      })}
    </ul>
  );
}

const LIST_STYLE = {
  margin: 0,
  paddingLeft: 20,
} as const satisfies CSSProperties;
