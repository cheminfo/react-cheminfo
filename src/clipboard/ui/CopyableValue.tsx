import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { MISSING_VALUE } from '../../format/core/missing.ts';
import { TOKEN } from '../../tokens/core/familyTokens.ts';

import { ClickToCopy } from './ClickToCopy.tsx';

const DEFAULT_BLOCK_HEIGHT = 160;

/** What {@link CopyableValue} names, shows and copies. */
export interface CopyableValueProps {
  /** What the value is, written above it, e.g. `InChIKey`. */
  label: string;
  /** The value itself, which is what a click on it copies. */
  value: string;
  /**
   * A longer explanation of the label, shown on hover.
   * @default undefined — the label carries no hover text
   */
  hint?: string;
  /**
   * Whether the value keeps its line breaks and scrolls past `maxHeight`, for
   * a molfile or any other multi-line notation.
   * @default false
   */
  block?: boolean;
  /**
   * Height past which a block value scrolls on its own.
   * @default 160
   */
  maxHeight?: number | string;
  /**
   * What the pointer and a screen reader are told, replacing the title built
   * from the label and the value.
   * @default undefined — `Copy the ${label} (${value})`
   */
  copyTitle?: string;
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
    copyTitle,
    children,
    className,
  } = props;
  const isEmpty = value === '';

  return (
    <div
      className={
        className === undefined
          ? 'copyable-value'
          : `copyable-value ${className}`
      }
    >
      <span
        className="copyable-value__label"
        style={hint === undefined ? LABEL_STYLE : HINTED_LABEL_STYLE}
        title={hint}
      >
        {label}
      </span>
      <ClickToCopy
        as="code"
        value={value}
        label={label}
        title={copyTitle}
        disabled={isEmpty}
        className="copyable-value__value"
        style={block ? { ...BLOCK_VALUE_STYLE, maxHeight } : VALUE_STYLE}
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

const HINTED_LABEL_STYLE = {
  ...LABEL_STYLE,
  cursor: 'help',
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
