import type { ButtonProps } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { savedRevisionAddress } from '../../download/core/savedRevision.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import { openSavedRevision } from './openSavedRevision.ts';

/** A button opening a figure in the deployment that saved it. */
export interface SavedRevisionButtonProps extends Omit<ButtonProps, 'onClick'> {
  /**
   * The figure opened on the page, as an SVG document, or `null` when none
   * is.
   */
  svg: string | null;
  /** The site running on the page, as the family names it, e.g. `draw`. */
  site: string;
  /**
   * How this page introduces itself to the deployment it hands the figure to.
   * @default the page's own host
   */
  host?: string;
}

/**
 * The fallback for a figure the latest build no longer shows as it was: open
 * it in the deployment that saved it. Drawn only for a figure saved by another
 * deployment of the running site.
 * @param props - The figure, the site, and the button's own props.
 * @returns The button, or `null`.
 */
export function SavedRevisionButton(
  props: SavedRevisionButtonProps,
): ReactElement | null {
  const { svg, site, host, ...buttonProps } = props;
  const t = useChromeT();
  if (svg === null || savedRevisionAddress(svg, site) === undefined) {
    return null;
  }
  return (
    <Button
      icon="history"
      variant="minimal"
      text={t('figure.openSaved')}
      title={t('figure.openSavedHelp')}
      aria-label={t('figure.openSaved')}
      {...buttonProps}
      className={joinClassNames('no-print', buttonProps.className)}
      onClick={() => {
        openSavedRevision(svg, site, host);
      }}
    />
  );
}
