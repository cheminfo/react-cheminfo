import type { ReactElement } from 'react';

import type { SharePartDescriptions } from './SharePartRow.tsx';
import { ShareSealOption } from './ShareSealOption.tsx';

/**
 * What an open preset shows instead of the options: what it hands out, and
 * the one switch it leaves to the teacher, protecting the link, within reach
 * on every tab.
 * @param props - The preset's words and the seal switch.
 * @param props.description - What the preset hands out.
 * @param props.sealed - Whether the link is sealed.
 * @param props.descriptions - Where each row says what switching it off does.
 * @param props.onSealedChange - Seal the link; `undefined` when the site cannot open a sealed address.
 * @returns The summary.
 */
export function SharePresetSummary(props: {
  description: string;
  sealed: boolean;
  descriptions: SharePartDescriptions;
  onSealedChange: ((sealed: boolean) => void) | undefined;
}): ReactElement {
  const { description, sealed, descriptions, onSealedChange } = props;
  return (
    <>
      <p className="share-dialog__preset">{description}</p>
      {onSealedChange === undefined ? null : (
        <ShareSealOption
          sealed={sealed}
          descriptions={descriptions}
          onChange={onSealedChange}
        />
      )}
    </>
  );
}
