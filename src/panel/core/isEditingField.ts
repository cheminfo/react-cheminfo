/**
 * Whether an event belongs to something the user is typing in.
 *
 * An editor listens on the document for shortcuts and for pastes, so both have
 * to keep their hands off every field on the page: an `f` typed into a mass box,
 * a row filter or a sequence field is part of what is being written, not a chart
 * being fitted or a glycan being drawn.
 *
 * `isContentEditable` is asked as well as the tag, because a rich text box is a
 * `div` and swallowing its keys is the same mistake made less visibly. Two of
 * the three copies this replaces had lost that line — one of them while keeping
 * the sentence claiming it.
 * @param target - What the event was delivered to.
 * @returns Whether it should be left alone.
 */
export function isEditingField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return EDITING_TAGS.has(target.tagName);
}

/** Elements an event belongs to rather than to the editor around them. */
const EDITING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
