/**
 * The characters a caption's symbol palette offers, and the commands that
 * type them: Greek letters, the signs and arrows of a scheme, and the Symbol
 * font's way of making the selected letters Greek.
 */

import type { Command, EditorState } from 'prosemirror-state';

import { hasLatinLetter, latinToGreek } from '../core/symbolFont.ts';

import { captionSchema } from './captionSchema.ts';

/** A character of the palette, and its name for a screen reader. */
export interface CaptionSymbol {
  /** What is typed. */
  symbol: string;
  /** Its name. */
  name: string;
}

/**
 * The palette, a group to a row: Greek letters, the capitals that differ
 * from Latin ones, signs, then arrows. Each is drawn by the fonts a caption
 * is set in, and by the font a drawing's PDF embeds; ⇌ and ⊕ are not, so a
 * PDF would print them as an empty box.
 */
export const CAPTION_SYMBOLS: ReadonlyArray<{
  /** The group's name, for a screen reader. */
  name: string;
  symbols: readonly CaptionSymbol[];
}> = [
  {
    name: 'Greek letters',
    symbols: [
      { symbol: 'α', name: 'alpha' },
      { symbol: 'β', name: 'beta' },
      { symbol: 'γ', name: 'gamma' },
      { symbol: 'δ', name: 'delta' },
      { symbol: 'ε', name: 'epsilon' },
      { symbol: 'ζ', name: 'zeta' },
      { symbol: 'η', name: 'eta' },
      { symbol: 'θ', name: 'theta' },
      { symbol: 'ι', name: 'iota' },
      { symbol: 'κ', name: 'kappa' },
      { symbol: 'λ', name: 'lambda' },
      { symbol: 'μ', name: 'mu' },
      { symbol: 'ν', name: 'nu' },
      { symbol: 'ξ', name: 'xi' },
      { symbol: 'π', name: 'pi' },
      { symbol: 'ρ', name: 'rho' },
      { symbol: 'σ', name: 'sigma' },
      { symbol: 'τ', name: 'tau' },
      { symbol: 'υ', name: 'upsilon' },
      { symbol: 'φ', name: 'phi' },
      { symbol: 'χ', name: 'chi' },
      { symbol: 'ψ', name: 'psi' },
      { symbol: 'ω', name: 'omega' },
    ],
  },
  {
    name: 'Greek capitals',
    symbols: [
      { symbol: 'Γ', name: 'capital gamma' },
      { symbol: 'Δ', name: 'capital delta' },
      { symbol: 'Θ', name: 'capital theta' },
      { symbol: 'Λ', name: 'capital lambda' },
      { symbol: 'Ξ', name: 'capital xi' },
      { symbol: 'Π', name: 'capital pi' },
      { symbol: 'Σ', name: 'capital sigma' },
      { symbol: 'Φ', name: 'capital phi' },
      { symbol: 'Ψ', name: 'capital psi' },
      { symbol: 'Ω', name: 'capital omega' },
    ],
  },
  {
    name: 'Signs',
    symbols: [
      { symbol: '°', name: 'degree' },
      { symbol: '±', name: 'plus or minus' },
      { symbol: '×', name: 'times' },
      { symbol: '·', name: 'middle dot' },
      { symbol: '−', name: 'minus' },
      { symbol: '≈', name: 'approximately' },
      { symbol: '≠', name: 'not equal' },
      { symbol: '≤', name: 'less or equal' },
      { symbol: '≥', name: 'greater or equal' },
      { symbol: '∞', name: 'infinity' },
      { symbol: '‰', name: 'per mille' },
      { symbol: 'Å', name: 'ångström' },
      { symbol: '′', name: 'prime' },
      { symbol: '″', name: 'double prime' },
      { symbol: '‡', name: 'double dagger' },
      { symbol: '•', name: 'bullet' },
      { symbol: '∂', name: 'partial' },
      { symbol: '√', name: 'square root' },
    ],
  },
  {
    name: 'Arrows',
    symbols: [
      { symbol: '→', name: 'right arrow' },
      { symbol: '←', name: 'left arrow' },
      { symbol: '↑', name: 'up arrow' },
      { symbol: '↓', name: 'down arrow' },
      { symbol: '↔', name: 'left right arrow' },
    ],
  },
];

/**
 * Type a character where the caret is, in the styles of what is typed there,
 * in place of the selection.
 * @param symbol - The character.
 * @returns The command.
 */
export function insertCaptionSymbol(symbol: string): Command {
  return (state, dispatch) => {
    dispatch?.(state.tr.insertText(symbol).scrollIntoView());
    return true;
  };
}

/**
 * Make the selected Latin letters Greek, as the Symbol font sets them
 * (a → α, D → Δ), each run keeping its styles. It does nothing when the
 * selection holds no Latin letter.
 * @param state - The editor state.
 * @param dispatch - Where the change goes.
 * @returns Whether a letter was made Greek.
 */
export const greekCaptionSelection: Command = (state, dispatch) => {
  const { from, to, empty } = state.selection;
  if (empty) return false;
  const tr = state.tr;
  state.doc.nodesBetween(from, to, (node, position) => {
    if (!node.text) return;
    const start = Math.max(from, position);
    const end = Math.min(to, position + node.nodeSize);
    const text = node.text.slice(start - position, end - position);
    const greek = latinToGreek(text);
    // A Greek letter is one character, as the Latin one was, so the
    // positions of the runs still to come do not move.
    if (greek !== text) {
      tr.replaceWith(start, end, captionSchema.text(greek, node.marks));
    }
  });
  if (!tr.docChanged) return false;
  dispatch?.(tr.scrollIntoView());
  return true;
};

/**
 * Whether the selection holds a Latin letter, which
 * {@link greekCaptionSelection} would make Greek.
 * @param state - The editor state.
 * @returns Whether it holds one.
 */
export function selectionHasLatinLetter(state: EditorState): boolean {
  const { from, to, empty } = state.selection;
  return !empty && hasLatinLetter(state.doc.textBetween(from, to, '\n', '\n'));
}
