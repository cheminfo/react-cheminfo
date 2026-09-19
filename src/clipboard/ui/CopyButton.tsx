import type { IconName, Intent } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import {
  DEFAULT_COPY_RESET_AFTER,
  useCopyToClipboard,
} from './useCopyToClipboard.ts';

/** What {@link CopyButton} copies, and how it reads. */
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
   * Text shown while a refused copy is being reported, when there is a label.
   * @default 'Copy failed'
   */
  failedLabel?: string;
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
   * @default 'clipboard'
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
 * A button that puts a piece of text on the clipboard and says so — with a
 * tick when it worked, and a cross when the browser refused it.
 * @param props - What to copy, what the button reads, and how it looks.
 * @returns The copy button.
 */
export function CopyButton(props: CopyButtonProps): ReactElement {
  const {
    content,
    label,
    copiedLabel = 'Copied',
    failedLabel = 'Copy failed',
    minimal = false,
    small = false,
    icon = 'clipboard',
    disabled = false,
    resetAfter = DEFAULT_COPY_RESET_AFTER,
    title = 'Copy to clipboard',
    className,
  } = props;
  const { copied, failed, copy } = useCopyToClipboard(resetAfter);
  const look = buttonLook({
    copied,
    failed,
    icon,
    label,
    copiedLabel,
    failedLabel,
  });

  return (
    <Button
      className={className}
      variant={minimal ? 'minimal' : 'solid'}
      size={small ? 'small' : 'medium'}
      icon={look.icon}
      intent={look.intent}
      text={look.text}
      disabled={disabled}
      title={title}
      aria-label={label ?? title}
      onClick={() => {
        void copy(typeof content === 'function' ? content() : content);
      }}
    />
  );
}

interface ButtonLookInput {
  copied: boolean;
  failed: boolean;
  icon: IconName;
  label: string | undefined;
  copiedLabel: string;
  failedLabel: string;
}

function buttonLook(input: ButtonLookInput): {
  icon: IconName;
  intent: Intent;
  text: string | undefined;
} {
  const { copied, failed, icon, label, copiedLabel, failedLabel } = input;
  const hasLabel = label !== undefined;
  if (copied) {
    return {
      icon: 'tick',
      intent: 'success',
      text: hasLabel ? copiedLabel : undefined,
    };
  }
  if (failed) {
    return {
      icon: 'cross',
      intent: 'danger',
      text: hasLabel ? failedLabel : undefined,
    };
  }
  return { icon, intent: 'none', text: label };
}
