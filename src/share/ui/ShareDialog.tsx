import { Dialog } from '@blueprintjs/core';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import type {
  ShareConfig,
  ShareParamCodecs,
  ShareParamValues,
  ShareVocabulary,
} from '../core/index.ts';

import { ShareDialogContent } from './ShareDialogContent.tsx';

const DIALOG_STYLE: CSSProperties = { width: 'min(680px, 94vw)' };

/**
 * The configuration the dialog is holding, handed to a tool-specific section so
 * it can read it and change it.
 */
export interface ShareDraft<
  Codecs extends ShareParamCodecs = Record<string, never>,
> {
  /** What the link would say if it were handed out now. */
  config: ShareConfig<Codecs>;
  /** Frame the page, or give it its chrome back. */
  setEmbed: (embed: boolean) => void;
  /** Switch one part of the page off, or on again. */
  setPartHidden: (part: string, hidden: boolean) => void;
  /** Give one of the tool's own parameters a new value. */
  setParam: <Key extends keyof ShareParamValues<Codecs>>(
    key: Key,
    value: ShareParamValues<Codecs>[Key],
  ) => void;
}

export interface ShareDialogProps<
  Codecs extends ShareParamCodecs = Record<string, never>,
> {
  /** Whether the dialog is on screen. */
  isOpen: boolean;
  /** Called when the dialog is dismissed. */
  onClose: () => void;
  /** What this site's links can say: the hideable parts, and the tool's own parameters. */
  vocabulary: ShareVocabulary<Codecs>;
  /** How the open page is named in the dialog, and in the frame. */
  title: string;
  /**
   * Where the page is served from — origin and path. Anything from the first
   * `?` or `#` is dropped, so an address can be handed over as it is.
   * @default the address of the page
   */
  baseUrl?: string;
  /**
   * The address as it stands, so the tool's own inputs travel with the link and
   * a page already running a configuration opens on that one.
   * @default the query string of the page
   */
  search?: string;
  /**
   * What a screen reader announces the frame as. A frame in someone else's page
   * is usually named after the site as well as the page.
   * @default the title
   */
  frameTitle?: string;
  /**
   * Height of the frame, in pixels.
   * @default 700
   */
  frameHeight?: number;
  /**
   * Whether the dialog is rendered through a portal on `document.body`.
   * @default true
   */
  usePortal?: boolean;
  /**
   * An extra section for what only this tool can configure — a series length, a
   * difficulty, a seed. A function is handed the draft, so such a section can
   * write the tool's own parameters into the link.
   * @default undefined — the dialog shows the sections every site shares
   */
  children?: ReactNode | ((draft: ShareDraft<Codecs>) => ReactNode);
}

/**
 * Hand the open page out as a link, or as the iframe that frames it in someone
 * else's site.
 *
 * The dialog opens on the link one actually hands out: framed, and with the
 * parts a host page has no use for already switched off. A page that is itself
 * running a configuration shows that one instead.
 * @param props - Whether the dialog is open, what the site's links can say, and how the page is named.
 * @returns The dialog.
 */
export function ShareDialog<
  Codecs extends ShareParamCodecs = Record<string, never>,
>(props: ShareDialogProps<Codecs>): ReactElement {
  const { isOpen, onClose, usePortal = true, ...rest } = props;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      usePortal={usePortal}
      title="Share or embed"
      icon="share"
      className="share-dialog"
      style={DIALOG_STYLE}
    >
      {/* The draft is mounted with the body, so a dialog a page leaves mounted
          still opens on the link it would hand out rather than on whatever was
          left in it. */}
      {isOpen ? <ShareDialogContent {...rest} onClose={onClose} /> : null}
    </Dialog>
  );
}
