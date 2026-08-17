import { Button, Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';

const SHARE_TITLE = 'Share a link to this page, or embed it in your own site';

/** How the button is dressed for the bar it sits in. */
export type ShareButtonVariant = 'nav-link' | 'blueprint';

export interface ShareButtonProps {
  /** Called when the button is pressed; what it opens is the caller's business. */
  onClick: () => void;
  /**
   * A plain entry of a site's own header bar, or a Blueprint button for a
   * toolbar already made of them.
   * @default 'nav-link'
   */
  variant?: ShareButtonVariant;
  /**
   * Text of the button, and what a screen reader is told.
   * @default 'Share'
   */
  label?: string;
  /**
   * Whether the button is reduced to its icon, for a bar that has run out of
   * room. It is still named to the pointer and to a screen reader.
   * @default false
   */
  compact?: boolean;
  /**
   * What the pointer is told.
   * @default 'Share a link to this page, or embed it in your own site'
   */
  title?: string;
  /**
   * Class the button carries, on top of the one its variant gives it.
   * @default undefined
   */
  className?: string;
}

/**
 * The Share entry of a site header: the button that offers the open page as a
 * link, or as the iframe that frames it in someone else's site.
 * @param props - What the button does, how it is dressed, and how it is named.
 * @returns The button.
 */
export function ShareButton(props: ShareButtonProps): ReactElement {
  const {
    onClick,
    variant = 'nav-link',
    label = 'Share',
    compact = false,
    title = SHARE_TITLE,
    className,
  } = props;
  const text = compact ? undefined : label;

  if (variant === 'blueprint') {
    return (
      <Button
        className={className}
        variant="minimal"
        icon="share"
        text={text}
        title={title}
        aria-label={label}
        onClick={onClick}
      />
    );
  }

  return (
    <button
      type="button"
      className={className === undefined ? 'nav-link' : `nav-link ${className}`}
      title={title}
      aria-label={label}
      onClick={onClick}
    >
      <Icon icon="share" size={14} />
      {text}
    </button>
  );
}
