import type { SettingsProblem } from '../core/problems.ts';

/**
 * The problems whose `where` is, or starts with, one of the given words.
 *
 * The `where` strings are what `settingsProblems` writes, so a part of the
 * panel asks for its own by naming the same words it is headed with — which
 * keeps a problem next to the field that causes it rather than in one list at
 * the top, far from anything the reader can act on.
 * @param problems - Every problem the settings have.
 * @param prefixes - The `where` strings the part answers for.
 * @returns Only those problems, in the order they were found.
 */
export function problemsAbout(
  problems: readonly SettingsProblem[],
  ...prefixes: readonly string[]
): SettingsProblem[] {
  return problems.filter((entry) =>
    prefixes.some((prefix) => entry.where.startsWith(prefix)),
  );
}
