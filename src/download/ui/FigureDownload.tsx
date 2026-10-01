import type { IconName } from '@blueprintjs/core';
import { PopoverNext } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { OverlayIconButton } from '../../overlay/ui/OverlayIconButton.tsx';

import type { FigureDownloadOptions } from './useFigureDownload.tsx';
import { useFigureDownload } from './useFigureDownload.tsx';

/** What {@link FigureDownload} needs. */
export interface FigureDownloadProps extends FigureDownloadOptions {
  /**
   * What the glyph is called, for the pointer and for a screen reader.
   * @default the chrome's own line, in the language of the page
   */
  label?: string;
  /**
   * Its glyph.
   * @default 'download'
   */
  icon?: IconName;
  /**
   * Value of the `data-testid` attribute of the glyph.
   * @default undefined
   */
  testId?: string;
}

/**
 * The glyph that takes the figure off the page, as a file or onto the
 * clipboard.
 *
 * It works from the `id` of the box the figure is mounted in rather than from
 * the figure itself, so the control is free to sit in the bar above the
 * picture — or anywhere else on the page — without the component that drew the
 * figure having to hand anything over. That is also what lets one control save
 * a view that is really several charts: whatever is inside the box is what is
 * saved.
 *
 * Both formats are offered because they answer different questions. An SVG is
 * the figure itself, sharp at any size and still editable, which is what a
 * paper wants; a PNG is a picture of it, which is what every chat window and
 * slide deck accepts. The resolution paints a PNG with more pixels and makes
 * an SVG open larger, and the panel writes out the size it is about to
 * produce so nobody has to guess what `3×` means for the figure in front of
 * them.
 * @param props - See {@link FigureDownloadProps}.
 * @returns The glyph and its panel.
 */
export function FigureDownload(props: FigureDownloadProps): ReactElement {
  const { label, icon = 'download', testId, ...options } = props;
  const t = useChromeT();
  const { isOpen, setOpen, panel, format, portal } = useFigureDownload(options);

  return (
    <>
      <PopoverNext
        isOpen={isOpen}
        placement="bottom-end"
        onInteraction={setOpen}
        content={panel}
      >
        <OverlayIconButton
          icon={icon}
          label={label ?? t('download.saveThisFigure')}
          value={format.toUpperCase()}
          active={isOpen}
          testId={testId}
          opensMenu
        />
      </PopoverNext>
      {portal}
    </>
  );
}
