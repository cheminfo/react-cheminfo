import type { ReactElement } from 'react';

import type { HideablePart } from '../core/index.ts';

import type { SharePartDescriptions } from './SharePartRow.tsx';
import { SharePartRow } from './SharePartRow.tsx';

export interface SharePartOptionsProps {
  /** The parts this page can switch off, in the order the vocabulary lists them. */
  parts: readonly HideablePart[];
  /** The parts the draft currently switches off. */
  hidden: readonly string[];
  /** Where each row says what switching it off does. */
  descriptions: SharePartDescriptions;
  /** Called with the part and whether the link should switch it off. */
  onChange: (part: string, hidden: boolean) => void;
  /** Called with the part the pointer is on, or `null` when it leaves. */
  onPointed: (part: string | null) => void;
}

/**
 * One switch per part of the page, worded positively: a part that is `On` is a
 * part the link keeps, which is how somebody building a course tile thinks
 * about it.
 * @param props - The parts, what is switched off, and how to change it.
 * @returns The rows.
 */
export function SharePartOptions(props: SharePartOptionsProps): ReactElement {
  const { parts, hidden, descriptions, onChange, onPointed } = props;

  return (
    <>
      {parts.map((part) => (
        <SharePartRow
          key={part.key}
          label={part.label}
          description={part.description}
          on={!hidden.includes(part.key)}
          descriptions={descriptions}
          onChange={(on) => {
            onChange(part.key, !on);
          }}
          onPointed={(pointed) => {
            onPointed(pointed ? part.key : null);
          }}
        />
      ))}
    </>
  );
}
