import type { IconName } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import {
  DEFAULT_COPY_RESET_AFTER,
  useCopyToClipboard,
} from './useCopyToClipboard.ts';

export interface CopyButtonProps {
  /**
   * What to copy. A function is called when the button is pressed, which is
   * what a whole list has to be: writing ten thousand structures out on every
   * render, for a button nobody may press, is a page that stutters as it is
   * scrolled.
   */
  content: string | (() => string);
  /**
   * Text of the button. Left out for an icon-only button, which is what a
   * dense row of them needs.
   * @default undefined — the button is reduced to its icon
   */
  label?: string;
  /**
   * Text shown while the copy is being confirmed, when there is a label.
   * @default 'Copied'
   */
  copiedLabel?: string;
  /**
   * Whether the button drops its background, for a toolbar or a code block.
   * @default false
   */
  minimal?: boolean;
  /**
   * Whether the button is the small size.
   * @default false
   */
  small?: boolean;
  /**
   * Glyph shown at rest. A tick replaces it while the copy is confirmed.
   * @default 'duplicate'
   */
  icon?: IconName;
  /**
   * Whether there is nothing to copy.
   * @default false
   */
  disabled?: boolean;
  /**
   * How long the button says it copied, in milliseconds.
   * @default 1500
   */
  resetAfter?: number;
  /**
   * What the pointer and a screen reader are told.
   * @default 'Copy to clipboard'
   */
  title?: string;
  /**
   * Class the button carries, so a site can reach it from its stylesheet.
   * @default undefined
   */
  className?: string;
}

/**
 * A button that puts a piece of text on the clipboard and says so.
 * @param props - What to copy, what the button reads, and how it looks.
 * @returns The copy button.
 */
export function CopyButton(props: CopyButtonProps): ReactElement {
  const {
    content,
    label,
    copiedLabel = 'Copied',
    minimal = false,
    small = false,
    icon = 'duplicate',
    disabled = false,
    resetAfter = DEFAULT_COPY_RESET_AFTER,
    title = 'Copy to clipboard',
    className,
  } = props;
  const { copied, copy } = useCopyToClipboard(resetAfter);

  return (
    <Button
      className={className}
      variant={minimal ? 'minimal' : 'solid'}
      size={small ? 'small' : 'medium'}
      icon={copied ? 'tick' : icon}
      intent={copied ? 'success' : 'none'}
      text={buttonText(label, copiedLabel, copied)}
      disabled={disabled}
      title={title}
      aria-label={label ?? title}
      onClick={() => {
        void copy(typeof content === 'function' ? content() : content);
      }}
    />
  );
}

function buttonText(
  label: string | undefined,
  copiedLabel: string,
  copied: boolean,
): string | undefined {
  if (label === undefined) return undefined;
  return copied ? copiedLabel : label;
}
