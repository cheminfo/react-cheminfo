/**
 * One capsule of a filter row: an interactive tag that keeps its semantic
 * colour whether or not it is selected, the filled shape being what encodes
 * the selection.
 */

import type { Intent } from '@blueprintjs/core';
import { Tag } from '@blueprintjs/core';
import type { ReactElement } from 'react';

/** What one capsule needs. */
export interface CapsuleProps {
  /** What the capsule reads, count included. */
  text: string;
  /** Whether it is filled. */
  selected: boolean;
  /**
   * Colour of the capsule, which says what the outcome means.
   * @default undefined — the capsule takes no intent
   */
  intent?: Intent;
  /** What the pointer is told, or `undefined` for no title at all. */
  title: string | undefined;
  /** Called when the capsule is picked. */
  onClick: () => void;
}

/**
 * One capsule.
 * @param props - See {@link CapsuleProps}.
 * @returns The tag.
 */
export function Capsule(props: CapsuleProps): ReactElement {
  const { text, selected, intent, title, onClick } = props;
  return (
    <Tag
      interactive
      round
      minimal={!selected}
      intent={intent}
      aria-pressed={selected}
      htmlTitle={title}
      onClick={onClick}
    >
      {text}
    </Tag>
  );
}
