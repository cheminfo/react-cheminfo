import type { ReactElement } from 'react';
import { useState } from 'react';

import { siteById } from '../../ecosystem/core/lookup.ts';
import type { SiteId } from '../../ecosystem/core/sites.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { ShareParamCodecs } from '../../share/core/index.ts';
import type { ShareButtonVariant } from '../../share/ui/ShareButton.tsx';
import { ShareButton } from '../../share/ui/ShareButton.tsx';
import type { ShareDialogProps } from '../../share/ui/ShareDialog.tsx';
import { ShareDialog } from '../../share/ui/ShareDialog.tsx';

/** What {@link ShareControl} needs: the dialog's props, and the button's. */
export interface ShareControlProps<
  Codecs extends ShareParamCodecs = Record<string, never>,
> extends Omit<
  ShareDialogProps<Codecs>,
  'isOpen' | 'onClose' | 'search' | 'frameTitle'
> {
  /**
   * The site the page belongs to, which names the frame `<host> — <title>`.
   * @default undefined — the frame is named by the title alone
   */
  siteId?: SiteId;
  /**
   * What a screen reader announces the frame as.
   * @default `<host> — <title>` with a `siteId`, the title without one
   */
  frameTitle?: string;
  /**
   * The address as it stands, so the tool's inputs travel with the link. A
   * function is called only while the dialog is open, so a value that is costly
   * to write — a pinned preference, a list of molecules — is written when a
   * link is asked for and not on every render of the header.
   * @default the query string of the page
   */
  search?: string | (() => string | undefined);
  /**
   * Whether the button keeps only its icon, in a bar that has run out of room.
   * @default false
   */
  compact?: boolean;
  /**
   * Text of the button.
   * @default the chrome's own word for it, in the language of the page
   */
  buttonLabel?: string;
  /**
   * What the pointer is told over the button.
   * @default the chrome's own line, in the language of the page
   */
  buttonTitle?: string;
  /**
   * A plain bar entry, or a Blueprint button for a toolbar made of them.
   * @default 'nav-link'
   */
  variant?: ShareButtonVariant;
  /**
   * Whether the dialog is open, for a page that has to know — to compute what
   * the dialog shows only while it is. Pass it with `onOpenChange`.
   * @default undefined — the control keeps the state itself
   */
  open?: boolean;
  /**
   * Called when the dialog opens or closes.
   * @default undefined
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Called as the button is pressed, before the dialog opens — to write the
   * page's state into the address the link is read from.
   * @default undefined
   */
  onOpen?: () => void;
}

/**
 * The Share entry of a header and the dialog it opens: the page handed out as a
 * link, or as the iframe that frames it in somebody else's site.
 *
 * It is what a header's `share` prop takes, so the entry lands after Contact on
 * every site. Everything the dialog can be told is passed straight through; the
 * control adds the open state, and the frame's name read off the site.
 * @param props - The dialog's props, and how the button is dressed.
 * @returns The button, and the dialog while it is open.
 */
export function ShareControl<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(props: ShareControlProps<Codecs>): ReactElement {
  const {
    siteId,
    frameTitle,
    search,
    compact = false,
    buttonLabel,
    buttonTitle,
    variant,
    open,
    onOpenChange,
    onOpen,
    title,
    ...dialog
  } = props;
  const t = useChromeT();
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = open ?? ownOpen;

  function setOpen(next: boolean): void {
    if (open === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  }

  const host = siteId === undefined ? undefined : siteById(siteId).host;
  const named =
    frameTitle ??
    (host === undefined ? title : t('share.frameTitle', { site: host, title }));

  return (
    <>
      <ShareButton
        compact={compact}
        label={buttonLabel}
        title={buttonTitle}
        variant={variant}
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      />
      <ShareDialog<Codecs>
        {...dialog}
        title={title}
        frameTitle={named}
        search={
          isOpen && typeof search === 'function' ? search() : searchText(search)
        }
        isOpen={isOpen}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
}

function searchText(
  search: string | (() => string | undefined) | undefined,
): string | undefined {
  return typeof search === 'string' ? search : undefined;
}
