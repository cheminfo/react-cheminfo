import type { CSSProperties } from 'react';

/*
 * The field vocabulary every spectra panel is drawn with. Every colour and
 * radius is a reference to the family's tokens with no literal after it:
 * `chrome.css` is required on every page, and a fallback typed here would only
 * drift from the value it copies.
 */

/** The small name above a control. */
export const LABEL_STYLE = {
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-muted)',
} as const satisfies CSSProperties;

/** The one line under a control or a list saying what it changes. */
export const HELP_STYLE = {
  fontSize: 11,
  color: 'var(--text-faint)',
} as const satisfies CSSProperties;

/** What a list says when it holds nothing. */
export const EMPTY_STYLE = {
  fontSize: 12,
  color: 'var(--text-faint)',
} as const satisfies CSSProperties;

/** A Blueprint switch or checkbox set in the panel's own type size. */
export const SWITCH_STYLE = {
  margin: 0,
  fontSize: 12,
} as const satisfies CSSProperties;

/** A label stacked over its control. */
export const FIELD_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
} as const satisfies CSSProperties;

/** Rows stacked one under the other. */
export const LIST_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
} as const satisfies CSSProperties;

/** Fields side by side, wrapping, their boxes lined up along the bottom. */
export const ROW_STYLE = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-end',
  gap: 8,
} as const satisfies CSSProperties;

/** A box that holds code rather than prose: a formula, an expression. */
export const MONOSPACE_STYLE = {
  fontFamily:
    'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
} as const satisfies CSSProperties;

/**
 * A stacked field that shares a row with others, never narrower than it can be
 * read at.
 * @param width - The narrowest it may get, in pixels.
 * @param grow - How much of the spare room it takes against its neighbours.
 * @returns The style.
 */
export function sizedFieldStyle(width: number, grow = 1): CSSProperties {
  return { ...FIELD_STYLE, minWidth: width, flex: `${grow} 1 ${width}px` };
}
