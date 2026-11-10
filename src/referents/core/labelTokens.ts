/**
 * Labels written by hand in any figure: `@aldehyde` typed in a caption, by a
 * program that knows nothing of referents, becomes a label of the referent
 * `aldehyde`, which the document numbers like any other.
 */

import { labelAttributes } from './labels.ts';
import type { FigureReferent } from './types.ts';

// `@` starting a word, so `user@host` is left alone.
const TOKEN = /(?<![\w.@])@(?<key>[A-Za-z][\w-]*)/g;

const TEXT_ELEMENT = /<text\b[^>]*>[\s\S]*?<\/text\s*>/g;

/**
 * Turn the `@key` tokens a figure's text holds into labels.
 * @param svg - The figure, as an SVG document.
 * @returns The figure with each token a label showing its key, and a referent
 * per key, in the order first written; the same figure and none when it holds
 * no token.
 */
export function adoptLabelTokens(svg: string): {
  svg: string;
  referents: FigureReferent[];
} {
  const keys: string[] = [];
  const adopted = svg.replaceAll(TEXT_ELEMENT, (element) =>
    // Only the text between tags: an attribute never holds a token.
    element.replaceAll(/>(?<run>[^<]+)</g, (run, text: string) => {
      if (!text.includes('@')) return run;
      const replaced = text.replaceAll(TOKEN, (_token, key: string) => {
        if (!keys.includes(key)) keys.push(key);
        return `<tspan${labelAttributes({ key })}>${key}</tspan>`;
      });
      return `>${replaced}<`;
    }),
  );
  return {
    svg: adopted,
    referents: keys.map((key) => ({ key, name: key })),
  };
}
