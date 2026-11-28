/**
 * The panels a link opens an editor on: `?panel=structure,name`, read the
 * same way on every site.
 */

/** The query parameter naming the panels a link opens, comma-separated. */
export const PANEL_PARAM = 'panel';

/**
 * The panels a `panel` parameter names, each once, in its order, blanks
 * dropped. With `isId`, a name no panel carries is skipped, so a link written
 * before a panel was renamed still opens.
 * @param value - The parameter, when the address carries one.
 * @param isId - Whether a name is one of the editor's panels.
 * @returns The names.
 */
export function readPanelList<P extends string = string>(
  value: string | undefined,
  isId?: (name: string) => name is P,
): P[] {
  const panels: P[] = [];
  if (value === undefined) return panels;
  for (const part of value.split(',')) {
    const name = part.trim();
    if (name === '' || (isId && !isId(name))) continue;
    if (!panels.includes(name as P)) panels.push(name as P);
  }
  return panels;
}
