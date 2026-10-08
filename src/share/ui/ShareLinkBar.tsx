import { AnchorButton } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { CopyButton } from '../../clipboard/ui/index.ts';
import { HelpTooltip } from '../../help/ui/index.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';

export interface ShareLinkBarProps {
  /** The address the link hands out. */
  url: string;
  /** The markup that frames the page in someone else's site. */
  frame: string;
  /**
   * Called once either copy has landed on the clipboard.
   * @default undefined
   */
  onCopied?: () => void;
}

/**
 * The three things one does with a share link, in the dialog's footer and
 * never scrolled away: a dialog whose Copy button is below the fold is a dialog
 * one scrolls through every single time. A copy is what the dialog was opened
 * for, so the dialog is told when one lands and closes on it.
 *
 * Neither the address nor the frame markup is printed. A teacher reads neither
 * before pasting it, and a hundred characters of query string set in monospace
 * is the widest thing in the dialog; what tells them which button to press is
 * the help on it.
 * @param props - The address, and the frame markup the third button copies.
 * @returns The bar.
 */
export function ShareLinkBar(props: ShareLinkBarProps): ReactElement {
  const { url, frame, onCopied } = props;
  const t = useChromeT();

  return (
    <div className="share-linkbar">
      <HelpTooltip
        content={{
          title: t('share.copyLinkHelpTitle'),
          body: t('share.copyLinkHelp'),
        }}
      >
        <CopyButton
          content={url}
          label={t('share.copyLink')}
          title=""
          onCopied={onCopied}
        />
      </HelpTooltip>
      <HelpTooltip
        content={{
          title: t('share.openInNewTabHelpTitle'),
          body: t('share.openInNewTabHelp'),
        }}
      >
        <AnchorButton
          icon="share"
          text={t('share.openInNewTab')}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        />
      </HelpTooltip>
      <HelpTooltip
        content={{
          title: t('share.copyIframeHelpTitle'),
          body: t('share.copyIframeHelp'),
        }}
      >
        <CopyButton
          content={frame}
          icon="code"
          label={t('share.copyIframe')}
          title=""
          onCopied={onCopied}
        />
      </HelpTooltip>
    </div>
  );
}
