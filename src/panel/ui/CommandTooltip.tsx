import type { ReactElement } from 'react';
import { TooltipHelpContent } from 'react-science/ui';

import type { EditorCommand } from '../core/editorCommands.ts';
import { commandShortcutLabels } from '../core/editorCommands.ts';

/** Props of {@link CommandTooltip}. */
export interface CommandTooltipProps {
  /** The command, as the viewer's table words it. */
  entry: EditorCommand;
}

/**
 * One command's tooltip: its title, every key, the gestures that do the same
 * thing, and what it does.
 *
 * `TooltipHelpContent` from react-science, which is what NMRium's tooltips
 * are, so a page holding the viewers beside NMRium or the glycan editor
 * explains itself the same way in all of them.
 * @param props - See {@link CommandTooltipProps}.
 * @returns The tooltip's content.
 */
export function CommandTooltip(props: CommandTooltipProps): ReactElement {
  const { entry } = props;
  const shortcuts = commandShortcutLabels(entry);
  const subTitles: Array<{ title: string; shortcuts: string[] }> = [];
  for (const gesture of entry.gestures ?? []) {
    subTitles.push({ title: gesture.title, shortcuts: [...gesture.shortcuts] });
  }
  return (
    <TooltipHelpContent
      title={entry.title}
      description={entry.description}
      shortcuts={shortcuts.length === 0 ? undefined : shortcuts}
      subTitles={entry.gestures === undefined ? undefined : subTitles}
      style={TOOLTIP_STYLE}
    />
  );
}

// The component is 250px wide by default, which is a lot of tooltip for a
// three-word title; the ones carrying a description still get the room.
const TOOLTIP_STYLE = { width: 'auto', maxWidth: 260 } as const;
