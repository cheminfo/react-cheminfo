import type { ReactElement } from 'react';

import { Prose } from '../../i18n/ui/Prose.tsx';
import type { Organisation } from '../core/team.ts';

/**
 * What someone does, with `{organisation}` drawn as a link to where they do it.
 * @param props - What to draw.
 * @param props.text - The role.
 * @param props.organisation - Where they do it, when the role says so.
 * @returns The role.
 */
export function RoleText(props: {
  text: string;
  organisation?: Organisation | undefined;
}): ReactElement {
  const { text, organisation } = props;
  if (organisation === undefined) return <>{text}</>;
  return (
    <Prose
      text={text}
      nodes={{
        organisation: (
          <a href={organisation.href} target="_blank" rel="noopener noreferrer">
            {organisation.name}
          </a>
        ),
      }}
    />
  );
}
