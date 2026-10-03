import { H6 } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { HideablePart } from '../core/index.ts';

import { SharePartOptions } from './SharePartOptions.tsx';
import type { SharePartDescriptions } from './SharePartRow.tsx';
import { SharePartRow } from './SharePartRow.tsx';

const SECTION_STYLE: CSSProperties = { marginBottom: 14 };

export interface ShareConfigOptionsProps {
  /** Whether the draft drops the site chrome. */
  embed: boolean;
  /** The parts that still mean something in this layout, in vocabulary order. */
  parts: readonly HideablePart[];
  /** The parts the draft switches off. */
  hidden: readonly string[];
  /** Where each row says what switching it off does. */
  descriptions: SharePartDescriptions;
  /** Called when the layout is switched. */
  onEmbedChange: (embed: boolean) => void;
  /** Called with the part and whether the link should switch it off. */
  onPartChange: (part: string, hidden: boolean) => void;
  /** Called with the part the pointer is on, or `null` when it leaves. */
  onPartPointed: (part: string | null) => void;
}

/**
 * The switches of the share dialog: the layout, then one per part of the page.
 * @param props - The draft's layout and parts, and how to change them.
 * @returns The two sections.
 */
export function ShareConfigOptions(
  props: ShareConfigOptionsProps,
): ReactElement {
  const {
    embed,
    parts,
    hidden,
    descriptions,
    onEmbedChange,
    onPartChange,
    onPartPointed,
  } = props;
  const t = useChromeT();

  return (
    <>
      <section className="share-section" style={SECTION_STYLE}>
        <H6>{t('share.layout')}</H6>
        <SharePartRow
          label={t('share.embed')}
          description={t('share.embedHint')}
          on={embed}
          descriptions={descriptions}
          onChange={onEmbedChange}
        />
      </section>

      {parts.length > 0 ? (
        <section className="share-section" style={SECTION_STYLE}>
          <H6>{t('share.showOnPage')}</H6>
          <SharePartOptions
            parts={parts}
            hidden={hidden}
            descriptions={descriptions}
            onChange={onPartChange}
            onPointed={onPartPointed}
          />
        </section>
      ) : null}
    </>
  );
}
