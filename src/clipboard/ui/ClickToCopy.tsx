import { Icon } from '@blueprintjs/core';
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from 'react';

import { onActivateKey } from '../../hooks/ui/activationKey.ts';
import type { ChromeKey } from '../../i18n/core/chromeCatalog.ts';
import type { Translate } from '../../i18n/ui/useT.ts';
import { useChromeT } from '../../i18n/ui/useT.ts';
import { joinClassNames } from '../../shared/ui/joinClassNames.ts';
import type { ClipboardContent } from '../core/writeToClipboard.ts';
import { writeToClipboard } from '../core/writeToClipboard.ts';

import { useCopyToClipboard } from './useCopyToClipboard.ts';

/** The elements a {@link ClickToCopy} can be, so a table cell is its own target. */
export type ClickToCopyElement = 'span' | 'code' | 'div' | 'td' | 'th';

/** What {@link ClickToCopy} copies, and how it reads. */
export interface ClickToCopyProps {
  /**
   * What goes on the clipboard: text, or text with its HTML rendering. A
   * function is called only when the value is clicked.
   */
  value: ClipboardContent | (() => ClipboardContent);
  /** What is shown; the pointer turns into a clipboard over it. */
  children: ReactNode;
  /**
   * What the value is, named in the hover title: `Copy the SMILES (C=CC=O)`.
   * @default undefined — the title names only the value
   */
  label?: string;
  /**
   * Hover title, replacing the one built from `label` and the value.
   * @default undefined
   */
  title?: string;
  /**
   * The element drawn. A `span` or a `code` sits in a line of text and shows
   * its glyph past its right edge; a `div`, `td` or `th` keeps room for it
   * inside. A `td` or `th` keeps its cell role, so a table stays a table to a
   * screen reader. A list item or a paragraph holds a `span` or a `div`
   * instead, so it stays a list item or a paragraph.
   * @default 'span'
   */
  as?: ClickToCopyElement;
  /**
   * Whether the value is a tab stop and a button of its own, with the glyph a
   * keyboard is shown instead of the cursor. Off when a copy button beside it
   * already copies the same value, so the keyboard and a screen reader meet
   * one control.
   * @default true
   */
  focusable?: boolean;
  /**
   * Whether there is nothing to copy: the children are drawn as plain content.
   * @default false
   */
  disabled?: boolean;
  /**
   * Class the element carries, in addition to `click-to-copy`.
   * @default undefined
   */
  className?: string;
  /**
   * Inline style of the element.
   * @default undefined
   */
  style?: CSSProperties;
}

/** Past this length the value is left out of the title: a molfile is no tooltip. */
const TITLE_VALUE_MAX = 120;

const INLINE = new Set<ClickToCopyElement>(['span', 'code']);
const CELLS = new Set<ClickToCopyElement>(['td', 'th']);

/** A control inside the value acts on its own click, which copies nothing. */
const NESTED_CONTROL =
  'a[href], button, input, select, textarea, summary, label, [role="button"], [role="link"], [role="checkbox"], [role="switch"], [role="tab"], [role="menuitem"]';

/**
 * A value that is copied by clicking it.
 *
 * Text in a tool is not selectable — a drag across a viewer must not paint the
 * page — so what is worth taking away is copied this way instead: a cursor
 * carrying a clipboard and a tint announce it on hover, a click or `Enter` puts
 * it on the clipboard, and a tick confirms it. The click stops there, so
 * a value inside a clickable row copies without also opening the row, and a
 * link or a button nested in the value keeps its own click.
 * @param props - See {@link ClickToCopyProps}.
 * @returns The copyable value.
 */
export function ClickToCopy(props: ClickToCopyProps): ReactElement {
  const {
    value,
    children,
    label,
    title,
    as: Element = 'span',
    focusable = true,
    disabled = false,
    className,
    style,
  } = props;
  const t = useChromeT();
  const { copied, failed, copy } = useCopyToClipboard();

  if (disabled) {
    return (
      <Element className={className} style={style}>
        {children}
      </Element>
    );
  }

  function activate(
    event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
  ): void {
    if (isOnNestedControl(event)) return;
    event.stopPropagation();
    void copy(
      typeof value === 'function' ? () => writeToClipboard(value()) : value,
    );
  }

  const outcome = copied ? 'copied' : failed ? 'failed' : undefined;

  return (
    <Element
      className={joinClassNames(
        'click-to-copy',
        INLINE.has(Element) ? 'click-to-copy--inline' : 'click-to-copy--block',
        className,
      )}
      style={style}
      role={focusable && !CELLS.has(Element) ? 'button' : undefined}
      tabIndex={focusable ? 0 : undefined}
      title={title ?? copyTitle(value, label, t)}
      data-copy={outcome}
      onClick={activate}
      onKeyDown={onActivateKey<KeyboardEvent<HTMLElement>>(activate)}
    >
      {children}
      {focusable ? (
        <Icon
          className="click-to-copy__icon"
          icon={
            outcome === 'copied'
              ? 'tick'
              : outcome === 'failed'
                ? 'cross'
                : 'clipboard'
          }
          size={16}
        />
      ) : null}
      <span className="click-to-copy__status" role="status">
        {outcome === 'copied'
          ? t('clipboard.copied')
          : outcome === 'failed'
            ? t('clipboard.failed')
            : null}
      </span>
    </Element>
  );
}

function isOnNestedControl(
  event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
): boolean {
  const { target, currentTarget } = event;
  if (!(target instanceof Element) || target === currentTarget) return false;
  const control = target.closest(NESTED_CONTROL);
  return (
    control !== null &&
    control !== currentTarget &&
    currentTarget.contains(control)
  );
}

function copyTitle(
  value: ClickToCopyProps['value'],
  label: string | undefined,
  t: Translate<ChromeKey>,
): string {
  const what =
    label === undefined
      ? t('clipboard.copy')
      : t('clipboard.copyThe', { what: label });
  if (typeof value === 'function') return what;
  const text = typeof value === 'string' ? value : value.text;
  if (text === '' || text.length > TITLE_VALUE_MAX) return what;
  return label === undefined
    ? t('clipboard.copyValue', { value: text })
    : `${what} (${text})`;
}
