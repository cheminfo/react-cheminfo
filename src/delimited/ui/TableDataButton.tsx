import type { IconName } from '@blueprintjs/core';
import { Button } from '@blueprintjs/core';
import type { ReactElement, ReactNode } from 'react';
import { useState } from 'react';

import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';

import type { DelimitedTextDialogProps } from './DelimitedTextDialog.tsx';
import { DelimitedTextDialog } from './DelimitedTextDialog.tsx';

/** The cells of a table, one array per line. */
type TableRows = ReadonlyArray<readonly string[]>;

/** What the shut dialog is handed, so it holds no copy of the last table. */
const EMPTY: TableRows = [];

/** What {@link TableDataButton} hands over, and how the button reads. */
export interface TableDataButtonProps extends Omit<
  DelimitedTextDialogProps,
  'isOpen' | 'onClose' | 'rows'
> {
  /**
   * The cells, one array per line. A function is called when the dialog opens
   * and not before, which is what a table built out of a computation has to
   * be: formatting a thousand points into strings on every render, for a
   * button nobody may press, is a page that stutters while it is used.
   */
  rows: TableRows | (() => TableRows);
  /**
   * Text of the button. Left out for an icon-only button, which is what a
   * dense toolbar over a table wants.
   * @default undefined — the button is reduced to its icon
   */
  text?: string;
  /**
   * Glyph on the button.
   * @default 'th'
   */
  icon?: IconName;
  /**
   * Whether the button drops its background, for a toolbar or a card header.
   * @default true
   */
  minimal?: boolean;
  /**
   * Whether the button is the small size.
   * @default false
   */
  small?: boolean;
  /**
   * What the pointer and a screen reader are told. The dialog's own `title`
   * names the table — `Titration curve as a table` — while this names the
   * affordance, and the two are deliberately not the same string: the heading
   * is the site's to write, the button's name is the family's, so the control
   * reads the same on every tool a visitor opens that week.
   * @default the chrome's own line, in the language of the page
   */
  tooltip?: string;
  /**
   * Whether there is nothing to hand over. A table that has not been computed
   * yet says so by being greyed rather than by opening an empty dialog.
   * @default whether there are no rows — and `false` where `rows` is a
   * function, which is not called to find out
   */
  disabled?: boolean;
  /**
   * Class the button carries, so a site can reach it from its stylesheet — a
   * terminal whose green the chrome's muted grey is unreadable against, a
   * toolbar with its own metrics.
   * @default undefined
   */
  buttonClassName?: string;
  /**
   * Value of the `data-testid` attribute of the button.
   * @default undefined
   */
  testId?: string;
  /**
   * The control in place of the Blueprint button, for a page whose chrome is
   * not Blueprint's — a `react-science` toolbar, a site's own toolbar button.
   * It is handed the function that opens the dialog.
   *
   * It exists so the dialog, the separator, the copy, the save and the wording
   * are shared even where the button cannot be: a site that keeps its own
   * trigger should not also be keeping its own dialog.
   * @default a Blueprint button carrying the glyph and the text
   */
  trigger?: (open: () => void) => ReactNode;
}

/**
 * The one control that takes a table off the page: copy it, or save it.
 *
 * It is a button and a dialog together rather than a dialog a site has to hold
 * open itself, because the state behind it is the same three lines in every
 * site and because the wording is not a site's to choose. An audit in
 * September 2026 found the same affordance spelled `Export as TSV` on one
 * site, `Copy as TSV` on another and `Copy or download data` on a third, which
 * reads as three different features to anybody who uses two of our tools in a
 * week.
 *
 * It is also deliberately not named after a separator. The dialog behind it
 * writes tab-, comma- or semicolon-separated text, so a button that says TSV
 * is wrong two times out of three — and a reader looking for CSV concludes the
 * tool cannot give it to them.
 * @param props - See {@link TableDataButtonProps}.
 * @returns The button and its dialog.
 */
export function TableDataButton(props: TableDataButtonProps): ReactElement {
  const {
    rows,
    text,
    icon = 'th',
    minimal = true,
    small = false,
    tooltip,
    disabled,
    testId,
    trigger,
    buttonClassName,
    ...dialog
  } = props;
  const t = useChromeT();
  // The cells are held rather than read on every render, so a `rows` function
  // is called once per opening and the closed button costs nothing at all.
  const [shown, setShown] = useState<TableRows | null>(null);

  const told = tooltip ?? t('delimited.copyOrDownload');
  const nothing =
    disabled ?? (typeof rows === 'function' ? false : rows.length === 0);

  function show(): void {
    setShown(typeof rows === 'function' ? rows() : rows);
  }

  return (
    <>
      {trigger ? (
        trigger(show)
      ) : (
        <Button
          className={joinClassNames('no-print', buttonClassName)}
          icon={icon}
          text={text}
          variant={minimal ? 'minimal' : 'solid'}
          size={small ? 'small' : 'medium'}
          disabled={nothing}
          title={told}
          aria-label={text ?? told}
          data-testid={testId}
          onClick={show}
        />
      )}
      <DelimitedTextDialog
        {...dialog}
        rows={shown ?? EMPTY}
        isOpen={shown !== null}
        onClose={() => setShown(null)}
      />
    </>
  );
}
