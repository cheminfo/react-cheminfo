import { cssTokenNames, resolveCssTokens } from './cssTokens.ts';

/**
 * One drawing, serialized with every token it names written out.
 *
 * The copy is taken first and read from the original, because the values are a
 * property of where the figure sits on the page: a detached clone inherits
 * nothing and would resolve every token to an empty string.
 * @param drawing - The drawing, as it sits on the page.
 * @returns Its markup.
 */
export function drawingMarkup(drawing: SVGSVGElement): string {
  const clone = drawing.cloneNode(true) as SVGSVGElement;
  const markup = new XMLSerializer().serializeToString(clone);
  return resolveCssTokens(markup, tokenValues(drawing, cssTokenNames(markup)));
}

/**
 * What each token the markup names is worth where the figure is drawn.
 * @param drawing - The drawing, as it sits on the page.
 * @param names - The tokens it asks for.
 * @returns The values, keyed by token name.
 */
function tokenValues(
  drawing: SVGSVGElement,
  names: readonly string[],
): Record<string, string> {
  const values: Record<string, string> = {};
  if (names.length === 0) return values;
  const styles = window.getComputedStyle(drawing);
  for (const name of names) {
    values[name] = styles.getPropertyValue(name);
  }
  return values;
}
