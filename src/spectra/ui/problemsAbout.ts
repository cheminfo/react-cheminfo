import type { ProblemPart, SettingsProblem } from '../core/problems.ts';

/**
 * The problems about one part of the settings.
 *
 * A part of the panel asks for its own by the `part` every problem carries and
 * never by the `where` it is labelled with, so rewording a label cannot move a
 * problem away from the field that causes it — which is what keeps a problem
 * next to that field rather than in one list at the top.
 * @param problems - Every problem the settings have.
 * @param part - The part the panel answers for.
 * @returns Only those problems, in the order they were found.
 */
export function problemsAbout(
  problems: readonly SettingsProblem[],
  part: ProblemPart,
): SettingsProblem[] {
  return problems.filter((entry) => entry.part === part);
}
