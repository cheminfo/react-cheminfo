import { Tooltip } from '@blueprintjs/core';
import type { ReactElement } from 'react';

import { CopyButton } from '../../clipboard/ui/CopyButton.tsx';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import {
  CARD_TOOLTIP_CLASS,
  CARD_TOOLTIP_DELAY,
  CARD_TOOLTIP_MODIFIERS,
} from './cardTooltip.ts';

/** What {@link CopyTableButton} copies. */
export interface CopyTableButtonProps {
  /**
   * Writes the table, tab-separated and header first, when the button is
   * pressed: a card holding a long table writes nothing until it is asked.
   */
  table: () => string;
  /**
   * What the tooltip says the button copies, e.g. `Copy the conformers as a
   * table, to paste into a spreadsheet`.
   * @default the chrome's own line, `Copy the table, to paste into a
   *   spreadsheet`
   */
  tooltip?: string;
  /**
   * Show the glyph alone, which is what a heading of a few letters has room
   * for. The label is still the button's accessible name.
   * @default false - the label shows, and gives way to the glyph on a frame
   *   narrower than 30rem
   */
  glyphOnly?: boolean;
  /**
   * Value of the `data-testid` attribute of the button's box.
   * @default 'card-copy-table'
   */
  testId?: string;
}

/**
 * A card's "Copy as table" action: the table, tab-separated and header first,
 * which a spreadsheet pastes into its cells. A tick says the clipboard took
 * it, a cross that the browser refused. It never prints.
 * @param props - See {@link CopyTableButtonProps}.
 * @returns The button, with the tooltip saying what it copies.
 */
export function CopyTableButton(props: CopyTableButtonProps): ReactElement {
  const {
    table,
    tooltip,
    glyphOnly = false,
    testId = 'card-copy-table',
  } = props;
  const t = useChromeT();
  return (
    <Tooltip
      content={tooltip ?? t('card.copyTableTitle')}
      placement="top-end"
      modifiers={CARD_TOOLTIP_MODIFIERS}
      popoverClassName={CARD_TOOLTIP_CLASS}
      hoverOpenDelay={CARD_TOOLTIP_DELAY}
    >
      <span data-testid={testId}>
        <CopyButton
          content={table}
          label={t('card.copyTable')}
          title=""
          icon="th"
          minimal
          small
          className={joinClassNames(
            'card__copy-table',
            glyphOnly && 'card__copy-table--glyph',
          )}
        />
      </span>
    </Tooltip>
  );
}
