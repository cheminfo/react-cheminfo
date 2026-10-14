import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

import type { SharePartDescriptions } from './SharePartRow.tsx';
import { SharePartRow } from './SharePartRow.tsx';

export interface ShareSealOptionProps {
  /** Whether the link is handed out sealed. */
  sealed: boolean;
  /** Where the row says what sealing does. */
  descriptions: SharePartDescriptions;
  /** Called when sealing is switched. */
  onChange: (sealed: boolean) => void;
}

/**
 * The switch that seals a link. It sits with the layout switches, and under a
 * preset's description too, since protecting a link is not part of what any
 * preset chooses.
 * @param props - Whether the link is sealed, and how to change it.
 * @returns The row.
 */
export function ShareSealOption(props: ShareSealOptionProps): ReactElement {
  const { sealed, descriptions, onChange } = props;
  const t = useChromeT();

  return (
    <SharePartRow
      label={t('share.protect')}
      description={t('share.protectHint')}
      on={sealed}
      descriptions={descriptions}
      onChange={onChange}
    />
  );
}
