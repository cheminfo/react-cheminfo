/**
 * A sentence with its placeholders filled in.
 *
 * The placeholders are `{name}`, and one with no value is left in place rather
 * than replaced by an empty string, so a site that mistypes a key sees the
 * mistake in the figure instead of a sentence that quietly loses a number.
 * @param template - The sentence, from the projection copy.
 * @param values - What each placeholder stands for.
 * @returns The filled sentence.
 */
export function fillCopy(
  template: string,
  values: Readonly<Record<string, string>>,
): string {
  return template.replaceAll(PLACEHOLDER, (match: string, name: string) => {
    const value = values[name];
    return value === undefined ? match : value;
  });
}

const PLACEHOLDER = /\{(?<name>[^{}]+)\}/gu;
