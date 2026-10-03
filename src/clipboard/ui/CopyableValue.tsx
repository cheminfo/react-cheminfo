import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { MISSING_VALUE } from '../../format/core/missing.ts';
import type { HelpText } from '../../help/ui/HelpBody.tsx';
import { HelpTooltip } from '../../help/ui/HelpTooltip.tsx';
import { OVERLAY_HELP_NAME_STYLE } from '../../overlay/ui/overlayRowStyles.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';

import { ClickToCopy } from './ClickToCopy.tsx';

const DEFAULT_BLOCK_HEIGHT = 160;

/** What says there is more of the value than is on screen. */
const FADE = 'linear-gradient(to bottom, #000 72%, transparent 100%)';

/** What {@link CopyableValue} names, shows and copies. */
export interface CopyableValueProps {
  /** What the value is, written above it, e.g. `InChIKey`. */
  label: string;
  /** The value itself, which is what a click on it copies. */
  value: string;
  /**
   * What the value is, read by hovering the label — which is underlined with
   * dots to say so. It opens as the family's help card rather than as the
   * browser's own tooltip, which takes a second to appear and is drawn by the
   * operating system rather than by us.
   * @default undefined — the label explains nothing beyond itself
   */
  hint?: HelpText;
  /**
   * Whether the value keeps its line breaks and scrolls past `maxHeight`, for
   * a molfile or any other multi-line notation.
   * @default false
   */
  block?: boolean;
  /**
   * Height past which a block value scrolls on its own, or is cut off when it
   * is clipped.
   * @default 160
   */
  maxHeight?: number | string;
  /**
   * Whether a block value is cut off at `maxHeight` and faded, rather than
   * given scrollbars. A notation is copied rather than read, and a molfile is
   * both long and wide, so a scrollbar on each axis of each of two of them is
   * four bars of chrome buying nothing.
   * @default false
   */
  clip?: boolean;
  /**
   * What the pointer and a screen reader are told, replacing the title built
   * from the label and the value.
   * @default undefined — `Copy the ${label} (${value})`
   */
  copyTitle?: string;
  /**
   * A control on the label's own line, pushed to the right — a save button for
   * a notation that is also a file, a menu of the forms it comes in. It sits
   * outside the value, so pressing it never copies.
   * @default undefined
   */
  action?: ReactNode;
  /**
   * What goes under the value: the links an identifier leads to, a note on it.
   * @default undefined
   */
  children?: ReactNode;
  /**
   * Class the row carries, in addition to `copyable-value`.
   * @default undefined
   */
  className?: string;
}

/**
 * One read-only value, named, copied by clicking it.
 *
 * A derived notation — a SMILES, an InChIKey, an accession, a computed energy
 * — is only useful somewhere else, so the value is the button that copies it:
 * the cursor carries a clipboard over it, a click or `Enter` puts it on the
 * clipboard, and a tick confirms. Nothing is drawn beside the label, which
 * names the value and no more. An empty value reads as the missing marker and
 * offers nothing to copy.
 * @param props - See {@link CopyableValueProps}.
 * @returns The labelled value.
 */
export function CopyableValue(props: CopyableValueProps): ReactElement {
  const {
    label,
    value,
    hint,
    block = false,
    maxHeight = DEFAULT_BLOCK_HEIGHT,
    clip = false,
    copyTitle,
    action,
    children,
    className,
  } = props;
  const isEmpty = value === '';

  const written = (
    <span
      className="copyable-value__label"
      style={hint === undefined ? LABEL_STYLE : HINTED_LABEL_STYLE}
    >
      {label}
    </span>
  );
  const name =
    hint === undefined ? (
      written
    ) : (
      <HelpTooltip content={{ body: hint }} placement="top-start">
        {written}
      </HelpTooltip>
    );

  return (
    <div
      className={
        className === undefined
          ? 'copyable-value'
          : `copyable-value ${className}`
      }
    >
      {action === undefined ? (
        name
      ) : (
        <span className="copyable-value__header" style={HEADER_STYLE}>
          {name}
          {action}
        </span>
      )}
      <ClickToCopy
        as="code"
        // The value fills the row, so the glyph goes inside its right edge: a
        // `code` is an inline element but this one is laid out as a block.
        layout="block"
        value={value}
        label={label}
        title={copyTitle}
        disabled={isEmpty}
        className="copyable-value__value"
        style={
          block
            ? { ...(clip ? CLIPPED_VALUE_STYLE : BLOCK_VALUE_STYLE), maxHeight }
            : VALUE_STYLE
        }
      >
        {isEmpty ? MISSING_VALUE : value}
      </ClickToCopy>
      {children}
    </div>
  );
}

const LABEL_STYLE = {
  display: 'block',
  color: TOKEN.textMuted,
  fontSize: 12,
  fontWeight: 600,
} as const satisfies CSSProperties;

/**
 * A label that explains itself is underlined with dots, which is the one
 * convention that lets a `?` glyph leave the row — see `OverlayRow`, where the
 * rest of the package already reads this way.
 */
const HINTED_LABEL_STYLE = {
  ...LABEL_STYLE,
  ...OVERLAY_HELP_NAME_STYLE,
  display: 'inline',
} as const satisfies CSSProperties;

/** The label and its control, on one line with the control at the right. */
const HEADER_STYLE = {
  display: 'flex',
  minHeight: 20,
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
} as const satisfies CSSProperties;

const VALUE_STYLE = {
  display: 'block',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  overflowWrap: 'anywhere',
} as const satisfies CSSProperties;

const BLOCK_VALUE_STYLE = {
  ...VALUE_STYLE,
  whiteSpace: 'pre',
  overflowWrap: 'normal',
  overflow: 'auto',
} as const satisfies CSSProperties;

/** The same block, cut off at its height and faded out rather than scrolled. */
const CLIPPED_VALUE_STYLE = {
  ...BLOCK_VALUE_STYLE,
  overflow: 'hidden',
  maskImage: FADE,
  WebkitMaskImage: FADE,
} as const satisfies CSSProperties;
