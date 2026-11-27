// tokens-ok: file — the colours a site may not write are listed here.
import { FAMILY_TOKEN_VALUES } from './familyTokens.ts';
import type { TokenViolationKind } from './types.ts';

/** What a colour a site may not write should have been. */
interface ColorRule {
  /** Which kind of violation writing it raises. */
  kind: TokenViolationKind;
  /** The token to write instead, in one line. */
  hint: string;
}

/**
 * The status tokens, whose values are not banned as literals: a red or a green
 * is as often subject matter — an orbital lobe, a colour in a LaTeX example —
 * as it is a status.
 */
const STATUS_TOKENS: ReadonlySet<string> = new Set([
  '--danger',
  '--success',
  '--warning',
]);

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
 * The second list is read off `FAMILY_TOKEN_VALUES`, so a token retuned there
 * is banned under its new value. `#ffffff` is deliberately absent: `--surface`
 * is white, and so are a hundred legitimate whites in a shadow, a gradient or a
 * `color-mix`.
 */
export const BANNED_COLORS: ReadonlyMap<string, ColorRule> = new Map<
  string,
  ColorRule
>([...blueprintRules(), ...retypedTokenRules()]);

function blueprintRules(): Array<[string, ColorRule]> {
  return [
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
  ];
}

function retypedTokenRules(): Array<[string, ColorRule]> {
  const rules: Array<[string, ColorRule]> = [];
  for (const [name, value] of Object.entries(FAMILY_TOKEN_VALUES)) {
    if (STATUS_TOKENS.has(name)) continue;
    const hex = /^#(?<digits>[\da-f]{6})$/.exec(value)?.groups?.digits;
    if (hex === undefined || hex === 'ffffff') continue;
    rules.push([
      hex,
      {
        kind: 'retyped-token',
        hint: `the value of ${name} — use var(${name}).`,
      },
    ]);
  }
  return rules;
}
