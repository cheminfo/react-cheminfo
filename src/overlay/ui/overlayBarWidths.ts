/**
 * The width a row of controls needs to hold every control at its own width:
 * the controls of each side next to each other, the gaps between them and
 * between the sides, and the row's padding. It is read off the controls
 * themselves, so it is the same whether the row has room for them or not, and
 * whether a side has wrapped them onto a second line.
 * @param sides - The sides of the row, `null` for one not drawn.
 * @param gap - The gap between two controls, and between two sides, in pixels.
 * @param paddingX - The row's padding on either side, in pixels.
 * @returns The width, in pixels.
 */
export function naturalRowWidth(
  sides: ReadonlyArray<HTMLElement | null>,
  gap: number,
  paddingX: number,
): number {
  let width = 2 * paddingX;
  let filled = 0;
  for (const side of sides) {
    if (side === null || side.children.length === 0) continue;
    const controls = side.children;
    for (const control of controls) {
      if (control instanceof HTMLElement) width += control.offsetWidth;
    }
    width += gap * (controls.length - 1);
    filled++;
  }
  return filled === 0 ? width : width + gap * (filled - 1);
}
