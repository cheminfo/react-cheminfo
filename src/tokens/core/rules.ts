// tokens-ok: file — the colours a site may not write are listed here.
import type { TokenViolationKind } from './checkTokens.ts';

/** What a colour a site may not write should have been. */
export interface ColorRule {
  /** Which kind of violation writing it raises. */
  kind: TokenViolationKind;
  /** The token to write instead, in one line. */
  hint: string;
}

/**
 * The colours a site may not write, keyed by their six lowercase hex digits.
 *
 * Two things land here. Blueprint's own neutrals and intent blue, which arrive
 * by reading a value off a component and pasting it: they are near the
 * family's greys without being them, which is what makes two of our sites
 * opened side by side read as two products. And the family's own token values
 * re-typed as literals, which pins the page to the colour the token held on
 * the day it was copied — a retune then moves everything except it.
 *
 * `#ffffff` is deliberately absent: `--surface` is white, and so are a hundred
 * legitimate whites in a shadow, a gradient or a `color-mix`.
 */
export const BANNED_COLORS: ReadonlyMap<string, ColorRule> = new Map<
  string,
  ColorRule
>([
  [
    'f6f7f9',
    {
      kind: 'blueprint-grey',
      hint: "Blueprint's page grey — the family's page is var(--surface-sunken).",
    },
  ],
  [
    'd3d8de',
    {
      kind: 'blueprint-grey',
      hint: "Blueprint's light grey — the family's line is var(--border).",
    },
  ],
  [
    '5f6b7c',
    {
      kind: 'blueprint-grey',
      hint: "Blueprint's muted text — use var(--text-muted).",
    },
  ],
  [
    '2d72d2',
    {
      kind: 'blueprint-blue',
      hint: "Blueprint's intent blue — the site's own colour is var(--accent).",
    },
  ],
  [
    '137cbd',
    {
      kind: 'blueprint-blue',
      hint: "Blueprint's older intent blue — the site's own colour is var(--accent).",
    },
  ],
  [
    'f5f7fa',
    {
      kind: 'retyped-token',
      hint: 'the value of --surface-sunken — use var(--surface-sunken).',
    },
  ],
  [
    'dfe3e8',
    {
      kind: 'retyped-token',
      hint: 'the value of --border — use var(--border).',
    },
  ],
  [
    'c3cad3',
    {
      kind: 'retyped-token',
      hint: 'the value of --border-strong — use var(--border-strong).',
    },
  ],
  [
    '16202c',
    { kind: 'retyped-token', hint: 'the value of --text — use var(--text).' },
  ],
  [
    '5b6875',
    {
      kind: 'retyped-token',
      hint: 'the value of --text-muted — use var(--text-muted).',
    },
  ],
  [
    '8a96a3',
    {
      kind: 'retyped-token',
      hint: 'the value of --text-faint — use var(--text-faint).',
    },
  ],
]);
