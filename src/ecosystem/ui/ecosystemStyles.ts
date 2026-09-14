import type { CSSProperties } from 'react';

import { TOKEN } from '../../tokens/core/familyTokens.ts';

/** The small line that introduces the family, above the footer and the menu. */
export const ECOSYSTEM_HEADING_STYLE: CSSProperties = {
  margin: 0,
  color: TOKEN.textMuted,
  fontSize: '0.75rem',
  fontWeight: 600,
};
