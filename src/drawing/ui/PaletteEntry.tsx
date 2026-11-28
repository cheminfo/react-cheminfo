import type { ReactElement } from 'react';
import { Toolbar } from 'react-science/ui';

import type { PaletteDragProps } from '../core/paletteGesture.ts';
import { paletteClick } from '../core/paletteGesture.ts';

/** What {@link PaletteEntry} is given. */
export interface PaletteEntryProps {
  /** The entry's own icon, which a drag also carries under the pointer. */
  icon: ReactElement;
  /** What the pointer is told: `usePaletteWords().tooltip(name, canvas)`. */
  tooltip: string;
  /** What names the entry to a screen reader: `Add a resistor`. */
  label: string;
  /** Whether the entry is the kind in hand. */
  active: boolean;
  /** Take the entry in hand, from a single click. */
  onTake: () => void;
  /** Add one at once, from a double click, Enter or Space. */
  onAdd: () => void;
  /**
   * What makes the entry draggable: `transfer.dragProps(kind)`.
   * @default undefined — the entry is not dragged
   */
  drag?: PaletteDragProps;
}

/**
 * One entry of an editor's palette, in a vertical `Toolbar`: a click takes it
 * in hand, a double click or a key adds it at once, a drag puts it where it is
 * let go — the gesture every editor of the family reads through
 * `paletteClick`.
 * @param props - See {@link PaletteEntryProps}.
 * @returns The toolbar item.
 */
export function PaletteEntry(props: PaletteEntryProps): ReactElement {
  const { icon, tooltip, label, active, onTake, onAdd, drag } = props;
  return (
    <Toolbar.Item
      icon={icon}
      tooltip={tooltip}
      aria-label={label}
      active={active}
      onClick={(event) => {
        if (paletteClick(event) === 'take') onTake();
        else onAdd();
      }}
      // Toolbar.Item declares no drag props but hands them on to its button.
      {...drag}
    />
  );
}
