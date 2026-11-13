import type { IconName } from '@blueprintjs/core';
import type { CSSProperties, ReactElement } from 'react';
import { Button } from 'react-science/ui';

import { clipboardSupports } from '../../clipboard/core/clipboardItem.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import type { OverlayMetrics } from '../../overlay/core/overlayMetrics.ts';
import { useOverlaySurface } from '../../overlay/ui/overlaySurface.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';
import type { FigureNotice } from '../core/copyFigure.ts';
import { SVG_CLIPBOARD_TYPE } from '../core/copySvg.ts';
import { FIGURE_PNG_TYPE } from '../core/figurePng.ts';
import { canShareFile } from '../core/shareFile.ts';

/** What {@link FigureQuickActions} needs. */
export interface FigureQuickActionsProps {
  /** Whether there is a figure to copy or send. */
  disabled: boolean;
  /** Whether a file or a copy is being written right now. */
  busy: boolean;
  /** What the last copy or send came to. */
  notice: FigureNotice | null;
  /** Copies the figure. */
  onCopy: () => void;
  /**
   * Sends a PNG of the figure through the share sheet.
   * @default undefined — nothing is offered to send
   */
  onSend?: () => void;
}

/**
 * Copy and Send, which take the size picked and none of the file's choices,
 * and the words beside them: what a copy puts on the clipboard, or what the
 * last copy or send did. A row of its own rather than two panel rows, since a
 * button needs no name column beside it.
 * @param props - See {@link FigureQuickActionsProps}.
 * @returns The buttons and their words.
 */
export function FigureQuickActions(
  props: FigureQuickActionsProps,
): ReactElement {
  const { disabled, busy, notice, onCopy, onSend } = props;
  const t = useChromeT();
  const { metrics } = useOverlaySurface();
  const button = (text: string, icon: IconName, onClick: () => void) => (
    <Button
      variant="minimal"
      size={metrics.blueprintSize}
      icon={icon}
      text={text}
      disabled={disabled}
      aria-disabled={busy || undefined}
      onClick={busy ? undefined : onClick}
    />
  );
  return (
    <div style={rowStyle(metrics)}>
      {button(t('clipboard.copy'), 'clipboard', onCopy)}
      {onSend !== undefined && canShareFile('figure.png', FIGURE_PNG_TYPE)
        ? button(t('download.send'), 'send-message', onSend)
        : null}
      <span style={noteStyle(metrics)}>
        {quickNote(notice, clipboardSupports(SVG_CLIPBOARD_TYPE), t)}
      </span>
    </div>
  );
}

function rowStyle(metrics: OverlayMetrics): CSSProperties {
  return {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: metrics.gap,
  };
}

function noteStyle(metrics: OverlayMetrics): CSSProperties {
  return { color: TOKEN.textMuted, fontSize: Math.max(10, metrics.labelSize) };
}

function quickNote(
  notice: FigureNotice | null,
  svg: boolean,
  t: Translate<ChromeKey>,
): string {
  if (notice === 'copyUnsupported') return t('download.copyUnsupported');
  if (notice === 'copied') {
    return t(svg ? 'download.copiedPngSvg' : 'download.copiedPng');
  }
  if (notice === 'sent') return t('download.sentPng');
  if (notice === 'sendReady') return t('download.sendReady');
  if (notice === 'sendUnsupported') return t('download.sendUnsupported');
  return t(svg ? 'download.copyPngSvg' : 'download.copyPng');
}
