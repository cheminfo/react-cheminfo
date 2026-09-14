import { Checkbox, H6 } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import type { HideablePart } from '../core/index.ts';

import { SharePartOptions } from './SharePartOptions.tsx';

const SECTION_STYLE: CSSProperties = { marginBottom: 18 };
const HINT_STYLE: CSSProperties = {
  display: 'block',
  marginLeft: 26,
  color: 'var(--text-muted, #5b6875)',
  fontSize: 12,
};

export interface ShareConfigOptionsProps {
  /** Whether the draft drops the site chrome. */
  embed: boolean;
  /** The parts that still mean something in this layout, in vocabulary order. */
  parts: readonly HideablePart[];
  /** The parts the draft switches off. */
  hidden: readonly string[];
  /** Called when the layout is switched. */
  onEmbedChange: (embed: boolean) => void;
  /** Called with the part and whether the link should switch it off. */
  onPartChange: (part: string, hidden: boolean) => void;
}

/**
 * The boxes of the share dialog: the layout, then one box per part of the page.
 * @param props - The draft's layout and parts, and how to change them.
 * @returns The two sections.
 */
export function ShareConfigOptions(
  props: ShareConfigOptionsProps,
): ReactElement {
  const { embed, parts, hidden, onEmbedChange, onPartChange } = props;

  return (
    <>
      <section className="share-section" style={SECTION_STYLE}>
        <H6>Layout</H6>
        <Checkbox
          checked={embed}
          label="Embed in another page"
          onChange={(event) => {
            onEmbedChange(event.currentTarget.checked);
          }}
        />
        <span style={HINT_STYLE}>
          Drops the site header and its navigation, so the page sits inside a
          page of your own.
        </span>
      </section>

      {parts.length > 0 ? (
        <section className="share-section" style={SECTION_STYLE}>
          <H6>Show on the page</H6>
          <SharePartOptions
            parts={parts}
            hidden={hidden}
            onChange={onPartChange}
          />
        </section>
      ) : null}
    </>
  );
}
