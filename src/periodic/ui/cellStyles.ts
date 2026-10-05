/**
 * The three bands a cell is laid out as, and the column the electrons stand in.
 *
 * Kept beside the cell rather than inside it, because what they say — where the
 * atomic number sits, how tall a band is — is read far more often than the
 * markup that carries them.
 */

import type { CSSProperties } from 'react';

import { SHELLS_GAP, SHELLS_SHARE, SHELL_LEADING } from './cellType.ts';
import { ofWidth } from './unit.ts';

/** The column the electron counts stand in, as a CSS length. */
export const SHELLS_COLUMN = ofWidth(SHELLS_SHARE);

/** The air between the symbol and that column, as a CSS length. */
export const SHELLS_AIR = ofWidth(SHELLS_GAP);

/**
 * The band at each end of a cell: the atomic number at the top, whatever the
 * tool writes at the bottom.
 *
 * They are one length, not two, and that is what makes the symbol between them
 * sit at the centre of the cell rather than near it — a bottom band wider than
 * the top one by a third lifted every symbol in the table two pixels.
 */
const EDGE_BAND = ofWidth(1.8);

/**
 * A cell is three bands of its own, and every cell has all three.
 *
 * The atomic number is in the top band, against its left edge; the symbol is
 * centred in the middle one; whatever the tool writes is centred in the
 * bottom one. The bands keep their height whether or not anything is written
 * in the last of them, so a number sits at one height across the whole table
 * and a symbol at one other — before this, both rode on a stack the cell
 * centred and moved whenever a neighbour's value was written smaller.
 */
export const cellStyle = {
  border: '1px solid rgb(255 255 255 / 0.55)',
  borderRadius: 3,
  cursor: 'pointer',
  display: 'grid',
  font: 'inherit',
  gridTemplateRows: `${EDGE_BAND} 1fr ${EDGE_BAND}`,
  justifyItems: 'center',
  minWidth: 0,
  overflow: 'hidden',
  padding: '1px',
  transition: 'opacity 120ms ease, filter 120ms ease',
} as const satisfies CSSProperties;

export const numberStyle = {
  alignSelf: 'start',
  gridColumn: 1,
  gridRow: 1,
  fontSize: `max(0.33rem, ${ofWidth(1.1)})`,
  fontVariantNumeric: 'tabular-nums',
  justifySelf: 'start',
  lineHeight: 1,
  opacity: 0.8,
} as const satisfies CSSProperties;

export const symbolStyle = {
  alignSelf: 'center',
  gridColumn: 1,
  gridRow: 2,
  fontWeight: 700,
  letterSpacing: '-0.02em',
  lineHeight: 1.02,
} as const satisfies CSSProperties;

export const detailStyle = {
  alignSelf: 'center',
  gridColumn: 1,
  gridRow: 3,
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
} as const satisfies CSSProperties;

/**
 * The electrons of each shell, innermost at the top, down the right-hand edge
 * of the whole cell: the stack is as tall as the three bands together, which
 * is what lets seven of them be read.
 */
export const shellsStyle = {
  alignSelf: 'center',
  gridColumn: 2,
  gridRow: '1 / span 3',
  fontVariantNumeric: 'tabular-nums',
  justifySelf: 'end',
  lineHeight: SHELL_LEADING,
  opacity: 0.85,
  paddingInlineEnd: `max(0.5px, ${ofWidth(0.15)})`,
  textAlign: 'right',
  whiteSpace: 'pre-line',
} as const satisfies CSSProperties;
