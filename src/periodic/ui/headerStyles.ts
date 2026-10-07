import type { CSSProperties } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';

import { ofWidth } from './unit.ts';

/** A group or period number, and the corner where the two strips meet. */
export const headerStyle = {
  alignItems: 'center',
  color: TOKEN.textMuted,
  display: 'flex',
  fontSize: `max(0.45rem, ${ofWidth(1.35)})`,
  justifyContent: 'center',
  padding: 0,
} as const satisfies CSSProperties;

/** The same, when it is a button: the type and the ground stay the strip's. */
export const headerButtonStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  font: 'inherit',
} as const satisfies CSSProperties;
