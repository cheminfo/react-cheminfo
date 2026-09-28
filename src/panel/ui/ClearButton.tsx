import { Button } from '@blueprintjs/core';

export interface ClearButtonProps {
  /**
   * What emptying the box does, said as the thing it achieves rather than as
   * "clear" — a screen reader and a hovering pointer both get this one line,
   * and `Leave green out` says what `Clear` does not.
   */
  label: string;
  /** Called when it is clicked, with the box left for the caller to empty. */
  onClick: () => void;
}

/**
 * The cross that empties a box, worn inside it as Blueprint's `rightElement`.
 *
 * Blueprint has no clearable input of its own; what it has is the slot, and a
 * minimal cross button in it is the shape its own examples use. Which is why
 * this carries no `size`: the input group sizes whatever is put in the slot
 * from its own size class — 20 square inside a small box, 24 inside a medium
 * one — so a button that stated a size of its own would only be able to
 * disagree with the box it is in.
 *
 * One component rather than eight lines repeated at each box, because the
 * cross has to be the same size, the same colour and in the same place
 * everywhere or it reads as a different control each time.
 * @param props - What clearing achieves, and what to do about it.
 * @returns The button, for an `InputGroup`'s `rightElement`.
 */
export function ClearButton(props: ClearButtonProps) {
  const { label, onClick } = props;

  return (
    <Button
      variant="minimal"
      icon="cross"
      aria-label={label}
      title={label}
      onClick={onClick}
    />
  );
}
