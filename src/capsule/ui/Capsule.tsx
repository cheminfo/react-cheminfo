/**
 * One capsule of a filter row: an interactive tag that keeps its semantic
 * colour whether or not it is selected, the filled shape being what encodes
 * the selection.
 */

import type { Intent } from '@blueprintjs/core';
import { Tag } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';

import { readableInk } from '../../color/core/contrast.ts';

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
  /**
   * A colour of the value's own, as `#rgb` or `#rrggbb`, in place of `intent`.
   * @default undefined — the capsule is coloured by its intent
   */
  color?: string;
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
  const { text, selected, intent, color, title, onClick } = props;
  // The colour and the ink it is read in are set inline; chrome.css tints it.
  const style =
    color === undefined
      ? undefined
      : ({
          '--capsule': color,
          '--capsule-ink': readableInk(color),
        } as CSSProperties);
  return (
    <Tag
      interactive
      round
      minimal={!selected}
      intent={color === undefined ? intent : undefined}
      className={color === undefined ? undefined : 'colored-capsule'}
      style={style}
      aria-pressed={selected}
      htmlTitle={title}
      onClick={onClick}
    >
      {text}
    </Tag>
  );
}
