import type { FocusEvent, ReactElement } from 'react';
import { useState } from 'react';

import { headerButtonStyle, headerStyle } from './headerStyles.ts';

/** What {@link SelectAllCorner} needs. */
interface SelectAllCornerProps {
  /** What it does, for the pointer and for a screen reader. */
  title: string;
  /** Called when it is clicked. */
  onClick: () => void;
}

/**
 * The corner where the two header strips meet, which takes the whole table.
 *
 * It is a control and nothing else, so it stays out of sight until it is
 * pointed at or reached from the keyboard, and it is left off a print and out
 * of a saved figure. The glyph points into the grid it takes, as a
 * spreadsheet's does; it is a mark rather than a word because the corner is a
 * seventeenth of the table's width, and the word differs in every language the
 * chrome speaks.
 * @param props - See {@link SelectAllCornerProps}.
 * @returns The corner.
 */
export function SelectAllCorner(props: SelectAllCornerProps): ReactElement {
  const { title, onClick } = props;
  const [pointed, setPointed] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      style={{
        ...headerStyle,
        gridColumn: 1,
        gridRow: 1,
        ...headerButtonStyle,
        opacity: pointed || focused ? 1 : 0,
        transition: 'opacity 120ms ease',
      }}
      className="no-print"
      data-figure="chrome"
      onPointerEnter={() => {
        setPointed(true);
      }}
      onPointerLeave={() => {
        setPointed(false);
      }}
      // Only a focus the keyboard gave it: a click focuses it too, and the
      // glyph would otherwise stay up after the pointer has gone.
      onFocus={(event: FocusEvent<HTMLButtonElement>) => {
        setFocused(event.currentTarget.matches(':focus-visible'));
      }}
      onBlur={() => {
        setFocused(false);
      }}
    >
      ◢
    </button>
  );
}
