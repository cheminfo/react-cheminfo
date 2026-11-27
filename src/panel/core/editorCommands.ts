/**
 * The vocabulary every spectrum viewer's command table is written in: a
 * command, the key it answers to, and the gestures that do the same thing.
 * The tables stay per viewer; how a command is labelled is shared.
 */

/** The key a command answers to. */
export interface CommandShortcut {
  /** The `event.key` values it fires on, the first being the one shown. */
  keys: readonly string[];
  /**
   * How to write the keys in a tooltip, where the raw value would read badly.
   * @default the keys themselves
   */
  label?: readonly string[];
}

/** A gesture that does the same thing, listed under the tooltip's title. */
export interface CommandGesture {
  /** Where the gesture is made, or what it is made with. */
  title: string;
  /** The buttons, keys or wheel that make it. */
  shortcuts: readonly string[];
}

/** One thing a viewer can be asked to do. */
export interface EditorCommand {
  /** What it is called, which is what the tooltip is titled. */
  title: string;
  /**
   * The key it answers to, absent for a command with none.
   * @default undefined
   */
  shortcut?: CommandShortcut;
  /**
   * What it does, in a sentence, under the title in the tooltip.
   * @default undefined
   */
  description?: string;
  /**
   * The gestures that do the same thing, for the ones a key cannot describe.
   * @default undefined
   */
  gestures?: readonly CommandGesture[];
}

/**
 * A command's title, with its key in parentheses when it has one: what a
 * button's `aria-label` says.
 * @param entry - The command, as a table words it.
 * @returns The label.
 */
export function commandEntryLabel(entry: EditorCommand): string {
  const key = entry.shortcut?.label?.[0] ?? entry.shortcut?.keys[0];
  return key === undefined ? entry.title : `${entry.title} (${key})`;
}

/**
 * Every key of a command, as a tooltip shows them.
 * @param entry - The command.
 * @returns One chip per key, empty when the command has no shortcut.
 */
export function commandShortcutLabels(entry: EditorCommand): string[] {
  const { shortcut } = entry;
  if (shortcut === undefined) return [];
  return [...(shortcut.label ?? shortcut.keys)];
}

/** A viewer's command table, by command id. */
export type CommandTable<TId extends string> = Readonly<
  Record<TId, EditorCommand>
>;

/**
 * The command a key press asks for, if any.
 *
 * A press carrying a modifier asks for nothing: every chord belongs to the
 * browser or to the page around the viewer, and `Ctrl`+`C` is somebody copying
 * a table. Keys match case-insensitively, so a capital arriving from a held
 * shift still reaches the command a lowercase key names. Whether something is
 * being typed into is the caller's to check, since only it knows where the
 * press landed.
 * @param table - The viewer's commands.
 * @param event - The key press.
 * @returns The command, `null` when the press asks for nothing.
 */
export function matchCommand<TId extends string>(
  table: CommandTable<TId>,
  event: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey'>,
): TId | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  return commandKeys(table).get(event.key.toLowerCase()) ?? null;
}

/** The keys of each table seen, built once per table. */
const KEYS_OF = new WeakMap<object, Map<string, string>>();

/**
 * Every key a table answers to, lower-cased, against the command it runs.
 * @param table - The commands.
 * @returns The keys.
 */
function commandKeys<TId extends string>(
  table: CommandTable<TId>,
): Map<string, TId> {
  const known = KEYS_OF.get(table);
  if (known !== undefined) return known as Map<string, TId>;
  const keys = new Map<string, TId>();
  for (const id of Object.keys(table) as TId[]) {
    for (const key of table[id].shortcut?.keys ?? []) {
      const lower = key.toLowerCase();
      if (!keys.has(lower)) keys.set(lower, id);
    }
  }
  KEYS_OF.set(table, keys);
  return keys;
}
