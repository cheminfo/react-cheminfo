import { Button, PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';

import { writeBlobToClipboard } from '../../clipboard/core/writeBlobToClipboard.ts';
import { CopyButton } from '../../clipboard/ui/CopyButton.tsx';
import { copySvg } from '../../download/core/copySvg.ts';
import { figurePng } from '../../download/core/figurePng.ts';
import { HelpTooltip } from '../../help/ui/index.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { qrCodeSvg } from '../core/qrCode.ts';

/**
 * How many pixels the PNG gives each pixel of the SVG: a module of a few
 * dozen pixels survives being stretched over a whole slide.
 */
const PNG_SCALE = 4;

export interface ShareQrCodeProps {
  /** The address the code holds. */
  url: string;
  /**
   * Called once the code has landed on the clipboard.
   * @default undefined
   */
  onCopied?: () => void;
  /**
   * Whether the link is not ready to hand out yet, as while it is being sealed.
   * @default false
   */
  disabled?: boolean;
}

/**
 * The link as a QR code, for a class that opens it on their phones: shown on
 * the screen it is scanned off the projector, and copied as a picture it goes
 * into a slide or a handout. The PNG pastes into anything; the SVG stays sharp
 * at any size.
 * @param props - The address, and what to do once the code is copied.
 * @returns The button, and the panel it opens.
 */
export function ShareQrCode(props: ShareQrCodeProps): ReactElement {
  const { url, onCopied, disabled = false } = props;
  const t = useChromeT();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverNext
      isOpen={isOpen}
      disabled={disabled}
      placement="top-end"
      onInteraction={setIsOpen}
      content={<QrCodePanel url={url} onCopied={onCopied} />}
    >
      <HelpTooltip
        content={{
          title: t('share.qrCodeHelpTitle'),
          body: t('share.qrCodeHelp'),
        }}
      >
        <Button
          icon={<QrCodeGlyph />}
          text={t('share.qrCode')}
          active={isOpen}
          disabled={disabled}
        />
      </HelpTooltip>
    </PopoverNext>
  );
}

// Rendered only while the panel is open, so a dialog nobody asks a code of
// never encodes one.
function QrCodePanel(props: {
  url: string;
  onCopied: (() => void) | undefined;
}): ReactElement {
  const { url, onCopied } = props;
  const t = useChromeT();
  const code = useMemo(() => qrCodeSvg(url), [url]);

  if (code === null) {
    return (
      <p className="share-qr share-qr--too-long">{t('share.qrCodeTooLong')}</p>
    );
  }
  return (
    <div className="share-qr" role="group" aria-label={t('share.qrCode')}>
      <img
        className="share-qr__code"
        src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(code.markup)}`}
        alt={t('share.qrCodeAlt')}
      />
      <p className="share-qr__hint">{t('share.qrCodeHint')}</p>
      <div className="share-qr__actions">
        <CopyButton
          content={() => writeBlobToClipboard(figurePng(code, PNG_SCALE))}
          icon="media"
          label={t('share.copyQrPng')}
          title=""
          onCopied={onCopied}
        />
        <CopyButton
          content={() => copySvg(code.markup)}
          label={t('share.copyQrSvg')}
          title=""
          onCopied={onCopied}
        />
      </div>
    </div>
  );
}

// Blueprint has no QR glyph: three finder squares and a module say it at 16 px.
function QrCodeGlyph(): ReactElement {
  return (
    <svg
      className="bp6-icon"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M1 1h6v6H1zm1.5 1.5v3h3v-3zM9 1h6v6H9zm1.5 1.5v3h3v-3zM1 9h6v6H1zm1.5 1.5v3h3v-3z"
      />
      <path d="M3.5 3.5h1v1h-1zM11.5 3.5h1v1h-1zM3.5 11.5h1v1h-1zM9 9h2.5v2.5H9zM12.5 12.5H15V15h-2.5zM12.5 9H15v2h-2.5zM9 13h2v2H9z" />
    </svg>
  );
}
