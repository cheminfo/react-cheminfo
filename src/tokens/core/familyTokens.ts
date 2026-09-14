// tokens-ok: file — the values `styles/chrome.css` declares are mirrored here.
/**
 * The family's tokens as a component writes them in an inline style.
 *
 * `chrome.css` is the one place a token's value is chosen; a style object
 * cannot read that file, so the values are mirrored here, and a test holds the
 * two in step. A component then writes `TOKEN.border` rather than typing its
 * own `var(--border, …)`, whose fallback drifts the day the token moves.
 */

/** Every custom property `chrome.css` declares on `:root`, with its value. */
export const FAMILY_TOKEN_VALUES = {
  '--surface': '#ffffff',
  '--surface-sunken': '#f5f7fa',
  '--surface-raised': '#ffffff',
  '--border': '#dfe3e8',
  '--border-strong': '#c3cad3',
  '--text': '#16202c',
  '--text-muted': '#5b6875',
  '--text-faint': '#8a96a3',
  '--radius': '10px',
  '--radius-lg': '16px',
  '--shadow-sm': '0 1px 2px rgb(16 32 48 / 8%)',
  '--shadow-md': '0 4px 14px rgb(16 32 48 / 10%)',
  '--shadow-lg': '0 12px 32px rgb(16 32 48 / 16%)',
  '--header-height': '3rem',
  '--page-max': '84rem',
} as const;

/** The name of one of the family's tokens, `--border` for instance. */
export type FamilyToken = keyof typeof FAMILY_TOKEN_VALUES;

/**
 * A token read through `var()`, with its own value as the fallback, so a page
 * that has not loaded `chrome.css` still paints the family's value.
 * @param name - The token.
 * @returns The reference, `var(--border, #dfe3e8)` for `--border`.
 */
export function tokenReference(name: FamilyToken): string {
  return `var(${name}, ${FAMILY_TOKEN_VALUES[name]})`;
}

/**
 * Whether a custom property is one of the family's tokens.
 * @param name - The property, with its two dashes.
 * @returns Whether `chrome.css` declares it.
 */
export function isFamilyToken(name: string): name is FamilyToken {
  return Object.hasOwn(FAMILY_TOKEN_VALUES, name);
}

/** Every token as an inline style reads it: `TOKEN.textMuted`, `TOKEN.border`. */
export const TOKEN = {
  surface: tokenReference('--surface'),
  surfaceSunken: tokenReference('--surface-sunken'),
  surfaceRaised: tokenReference('--surface-raised'),
  border: tokenReference('--border'),
  borderStrong: tokenReference('--border-strong'),
  text: tokenReference('--text'),
  textMuted: tokenReference('--text-muted'),
  textFaint: tokenReference('--text-faint'),
  radius: tokenReference('--radius'),
  radiusLarge: tokenReference('--radius-lg'),
  shadowSmall: tokenReference('--shadow-sm'),
  shadowMedium: tokenReference('--shadow-md'),
  shadowLarge: tokenReference('--shadow-lg'),
  headerHeight: tokenReference('--header-height'),
  pageMax: tokenReference('--page-max'),
} as const;
