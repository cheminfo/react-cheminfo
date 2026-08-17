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
