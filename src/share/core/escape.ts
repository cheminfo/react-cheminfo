/**
 * Escape a value written into HTML text, so a formula, a title or an address
 * a link carries cannot close the element it sits in.
 * @param value - The untrusted value.
 * @returns The value with `&`, `<` and `>` replaced by their entities.
 */
export function escapeText(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * Escape a value written into a double-quoted HTML attribute, so an address
 * carrying an ampersand or a quote cannot break out of it.
 * @param value - The untrusted value.
 * @returns The value with `&`, `<`, `>` and `"` replaced by their entities.
 */
export function escapeAttribute(value: string): string {
  return escapeText(value).replaceAll('"', '&quot;');
}

/**
 * Text read out of XML or HTML, its entities replaced by the characters they
 * stand for: the five of XML, `&nbsp;`, and numeric references, in one pass.
 * @param text - Text as written in an element or an attribute.
 * @returns The text.
 */
export function unescapeXml(text: string): string {
  return text.replaceAll(
    /&(?<entity>#x[0-9a-f]+|#\d+|lt|gt|quot|apos|amp|nbsp);/gi,
    (_, entity: string) => {
      const name = entity.toLowerCase();
      const named = ENTITIES[name];
      if (named !== undefined) return named;
      const code = name.startsWith('#x')
        ? Number.parseInt(name.slice(2), 16)
        : Number.parseInt(name.slice(1), 10);
      return String.fromCodePoint(code);
    },
  );
}

/**
 * A text to match literally inside a regular expression.
 * @param value - The text.
 * @returns It, with every character a pattern reads escaped.
 */
export function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

/**
 * The named entities read back: the five of XML, and `&nbsp;`, which an HTML
 * serializer writes for U+00A0 when a page holds the SVG inline.
 */
const ENTITIES: Readonly<Record<string, string>> = {
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  amp: '&',
  nbsp: '\u00A0',
};
