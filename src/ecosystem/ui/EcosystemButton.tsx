import type { ReactElement } from 'react';

import type { HeaderButtonProps } from '../../shared/ui/MenuButton.tsx';
import { MenuButton } from '../../shared/ui/MenuButton.tsx';
import type { SiteId } from '../core/sites.ts';

import { EcosystemMenu } from './EcosystemMenu.tsx';

export interface EcosystemButtonProps extends HeaderButtonProps {
  /**
   * The site this button sits on, which is shown but never linked.
   * @default undefined
   */
  currentSiteId?: SiteId;
  /**
   * Text of the button. In a compact bar it is not written, but it stays what
   * the pointer and a screen reader are told.
   * @default 'Tools'
   */
  label?: string;
}

/**
 * The Tools entry of a site header: one button opening every other site of the
 * family, each behind its own little logo.
 * @param props - The site it sits on, and how the menu opens.
 * @returns The button and its menu.
 */
export function EcosystemButton(props: EcosystemButtonProps): ReactElement {
  const { currentSiteId, label = 'Tools', ...rest } = props;

  return (
    <MenuButton
      {...rest}
      className="ecosystem-button"
      icon="grid-view"
      label={label}
      menu={<EcosystemMenu currentSiteId={currentSiteId} />}
    />
  );
}
