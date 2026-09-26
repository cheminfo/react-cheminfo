import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import type { HeaderButtonProps } from '../../shared/ui/MenuButton.tsx';
import { MenuButton } from '../../shared/ui/MenuButton.tsx';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { SiteId } from '../core/sites.ts';

import { EcosystemMenu } from './EcosystemMenu.tsx';

/** What the Tools entry of a header needs. */
export interface EcosystemButtonProps extends HeaderButtonProps {
  /**
   * The site this button sits on, which is shown but never linked.
   * @default undefined
   */
  currentSiteId?: SiteId;
  /**
   * Text of the button. In a compact bar it is not written, but it stays what
   * the pointer and a screen reader are told.
   * @default the chrome's own word for it, in the language of the page
   */
  label?: string;
  /**
   * Class names added to the root element, after the component's own.
   * @default undefined
   */
  className?: string;
}

/**
 * The Tools entry of a site header: one button opening every other site of the
 * family, each behind its own little logo.
 * @param props - The site it sits on, and how the menu opens.
 * @returns The button and its menu.
 */
export function EcosystemButton(props: EcosystemButtonProps): ReactElement {
  const { currentSiteId, label, className, ...rest } = props;
  const t = useChromeT();

  return (
    <MenuButton
      {...rest}
      className={joinClassNames('ecosystem-button', className)}
      icon="grid-view"
      label={label ?? t('ecosystem.tools')}
      menu={<EcosystemMenu currentSiteId={currentSiteId} />}
    />
  );
}
