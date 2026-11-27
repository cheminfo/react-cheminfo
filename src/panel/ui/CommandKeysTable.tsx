/**
 * The last section of every viewer's documentation: each command, the keys
 * that run it as caps, the gestures that do the same, and what it does — read
 * from the same table the toolbar and the key handler read, so a shortcut
 * cannot be documented as one thing and bound as another.
 */

import type { ReactElement } from 'react';

import { ShortcutKeys } from '../../guide/ui/ShortcutList.tsx';
import type { EditorCommand } from '../core/editorCommands.ts';
import { commandShortcutLabels } from '../core/editorCommands.ts';

/** Props of {@link CommandKeysTable}. */
export interface CommandKeysTableProps {
  /** The commands, in the order the table lists them. */
  commands: readonly EditorCommand[];
}

/**
 * The table.
 * @param props - See {@link CommandKeysTableProps}.
 * @returns One row per command.
 */
export function CommandKeysTable(props: CommandKeysTableProps): ReactElement {
  return (
    <table style={TABLE_STYLE}>
      <tbody>
        {props.commands.map((entry) => (
          <CommandRow key={entry.title} entry={entry} />
        ))}
      </tbody>
    </table>
  );
}

/**
 * One command: what it is called, its keys and gestures, and what it does.
 * @param props - Component props.
 * @param props.entry - The command, as the viewer words it.
 * @returns The row.
 */
function CommandRow(props: { entry: EditorCommand }): ReactElement {
  const { entry } = props;
  const keys = commandShortcutLabels(entry);
  return (
    <tr>
      <th style={COMMAND_CELL_STYLE}>{entry.title}</th>
      <td style={KEY_CELL_STYLE}>
        {keys.length === 0 ? null : <ShortcutKeys keys={keys} />}
        {entry.gestures?.map((gesture) => (
          <span key={gesture.title} style={GESTURE_STYLE}>
            {gesture.shortcuts.join(', ')}
          </span>
        ))}
      </td>
      <td style={DESCRIPTION_CELL_STYLE}>{entry.description}</td>
    </tr>
  );
}

const TABLE_STYLE = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 13,
} as const;

const COMMAND_CELL_STYLE = {
  textAlign: 'left',
  fontWeight: 600,
  verticalAlign: 'top',
  padding: '3px 8px 3px 0',
  whiteSpace: 'nowrap',
} as const;

const KEY_CELL_STYLE = {
  verticalAlign: 'top',
  padding: '3px 8px 3px 0',
  whiteSpace: 'nowrap',
} as const;

const DESCRIPTION_CELL_STYLE = {
  verticalAlign: 'top',
  padding: '3px 0',
} as const;

const GESTURE_STYLE = { marginLeft: 4, opacity: 0.7, fontSize: 12 } as const;
