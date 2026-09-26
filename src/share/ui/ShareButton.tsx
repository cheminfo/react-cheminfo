import { Button, Icon } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';

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
   * @default the chrome's own word for it, in the language of the page
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
   * @default the chrome's own line, in the language of the page
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
    label: given,
    compact = false,
    title: givenTitle,
    className,
  } = props;
  const t = useChromeT();
  const label = given ?? t('share.button');
  const title = givenTitle ?? t('share.buttonTitle');
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
      className={
        className === undefined
          ? 'nav-link nav-link--icon'
          : `nav-link nav-link--icon ${className}`
      }
      title={title}
      aria-label={label}
      onClick={onClick}
    >
      <Icon icon="share" size={14} />
      {text === undefined ? null : (
        <span className="nav-link__label">{text}</span>
      )}
    </button>
  );
}
