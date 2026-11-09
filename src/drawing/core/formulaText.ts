/**
 * A `{{…}}` group of a caption is read by mf-parser, in its own notation: `Ca(2+)`, `SO4(2-)`, `[13C]H4`, `CuSO4•5H2O`, `Et3N`.
 */

import { parse, toDisplay } from 'mf-parser';

import type { Script } from './richText.ts';

/** A piece of a formula as it is drawn. */
interface FormulaPart {
  /** The characters. */
  text: string;
  /**
   * Lowered or raised.
   * @default undefined — on the baseline
   */
  script?: Script;
}

/** One piece of mf-parser's display, of whichever kind. */
interface DisplayItem {
  kind: string;
  value?: string | number;
  over?: string | number;
  under?: string | number;
}

/** A charge as mf-parser writes it: the sign, then the number. */
const SIGN_FIRST = /^(?<sign>[+-])(?<count>\d*)$/;

/** The dot that joins the parts of a hydrate or a salt. */
const HYDRATE = /[•·]\s*$/;

/**
 * The pieces a formula is drawn in. A charge is written number first, with a
 * true minus, as it is everywhere else in the drawing (`2−`, not `-2`).
 * @param formula - The formula, in mf-parser notation.
 * @returns The pieces, or undefined when mf-parser cannot read it as one.
 */
export function formulaParts(formula: string): FormulaPart[] | undefined {
  let tokens: Array<{ kind: string }>;
  try {
    tokens = parse(formula) as Array<{ kind: string }>;
  } catch {
    return undefined;
  }
  // A lone charge is read as electrons taken away, which a caption never means.
  if (!tokens.some((token) => token.kind === 'atom')) return undefined;
  const parts: FormulaPart[] = [];
  for (const item of toDisplay(tokens) as DisplayItem[]) {
    if (item.kind === 'superimpose') {
      parts.push(
        { text: String(item.under ?? ''), script: 'sub' },
        { text: chargeText(String(item.over ?? '')), script: 'sup' },
      );
    } else if (item.kind === 'subscript' && !HYDRATE.test(previous(parts))) {
      parts.push({ text: String(item.value ?? ''), script: 'sub' });
    } else if (item.kind === 'subscript') {
      // The count after a hydrate dot is how many of what follows.
      parts.push({ text: String(item.value ?? '') });
    } else if (item.kind === 'superscript') {
      parts.push({ text: chargeText(String(item.value ?? '')), script: 'sup' });
    } else {
      parts.push({ text: String(item.value ?? '') });
    }
  }
  return parts.filter((part) => part.text !== '');
}

function previous(parts: readonly FormulaPart[]): string {
  return parts.at(-1)?.text ?? '';
}

function chargeText(text: string): string {
  const groups = SIGN_FIRST.exec(text)?.groups;
  if (!groups) return text;
  const count = groups.count === '1' ? '' : (groups.count ?? '');
  return `${count}${groups.sign === '-' ? '−' : '+'}`;
}
