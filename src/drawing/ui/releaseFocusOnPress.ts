/**
 * Leaves no focus on a button pressed with the pointer, as Safari never does.
 *
 * Blueprint opens a tooltip whenever its button takes the focus, and only a
 * blur closes what the focus opened. A dialog handing the focus back to the
 * button that opened it would therefore leave the tooltip open with the pointer
 * long gone. Giving the focus up at the press closes the tooltip there, and it
 * opens again once the pointer comes back.
 *
 * The listener captures, so a dialog the press opens remembers no button. A key
 * press counts no clicks and keeps the focus where a keyboard user is working,
 * and an overlay keeps it too, since Escape is heard from inside one.
 */
export function releaseFocusOnPress(): void {
  document.addEventListener(
    'click',
    (event) => {
      if (event.detail === 0 || !(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLElement>(
        'button, [role="button"]',
      );
      if (button && !button.closest('.bp6-overlay')) button.blur();
    },
    true,
  );
}
