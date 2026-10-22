import type { ReactElement } from 'react';

import { MOLECULES_URL, sourceLook } from '../core/moleculesSources.ts';

import type { SourceBadgeProps } from './SourceBadge.tsx';
import { SourceBadge } from './SourceBadge.tsx';
import { useSourceLooks } from './useSourceLooks.ts';

export interface MoleculesSourceBadgeProps extends Omit<
  SourceBadgeProps,
  'color' | 'logo'
> {
  /**
   * Where molecules answers, for a site that reads another instance.
   * @default MOLECULES_URL
   */
  moleculesUrl?: string;
}

/**
 * A source named by a site that does not keep its look: the colour and the
 * logo come from molecules.cheminfo.org, where they are edited. A source
 * molecules does not know — or until it has answered — is drawn neutral.
 * @param props - The source, by its name in any case, and the entry it holds.
 * @returns The badge.
 */
export function MoleculesSourceBadge(
  props: MoleculesSourceBadgeProps,
): ReactElement {
  const { moleculesUrl = MOLECULES_URL, ...badge } = props;
  const look = sourceLook(useSourceLooks(moleculesUrl), badge.name);
  if (look === undefined) return <SourceBadge {...badge} />;

  return (
    <SourceBadge
      {...badge}
      label={badge.label ?? look.name}
      // A source molecules draws in no colour of its own is drawn neutral
      // here: the site naming it is not that source.
      color={look.color ?? undefined}
      logo={look.logo}
    />
  );
}
