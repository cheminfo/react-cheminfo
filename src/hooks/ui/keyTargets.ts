/**
 * Whether a key event is aimed at somewhere the visitor types: a text field, a
 * select, an editable region or anything carrying `role="textbox"`. A keyboard
 * shortcut listening above it leaves such a key alone.
 * @param target - The `target` of the keyboard event.
 * @returns True when the key belongs to the field.
 */
export function isTextEntryTarget(
  target: EventTarget | null | undefined,
): boolean {
  const element = asElementLike(target);
  if (element === null) return false;
  if (element.isContentEditable === true) return true;
  if (
    typeof element.tagName === 'string' &&
    TEXT_ENTRY_TAGS.has(element.tagName)
  ) {
    return true;
  }
  return roleOf(element) === 'textbox';
}

/**
 * Whether a key event is aimed at a control that answers `Enter` or the space
 * bar by itself: a button, a link, a summary, or an element with the role of
 * one. A handler further up leaves the activation to it.
 * @param target - The `target` of the keyboard event.
 * @returns True when the control acts on the key itself.
 */
export function isInteractiveTarget(
  target: EventTarget | null | undefined,
): boolean {
  const element = asElementLike(target);
  if (element === null) return false;
  if (
    typeof element.tagName === 'string' &&
    INTERACTIVE_TAGS.has(element.tagName)
  ) {
    return true;
  }
  const role = roleOf(element);
  return role !== null && INTERACTIVE_ROLES.has(role);
}

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const INTERACTIVE_TAGS = new Set(['BUTTON', 'A', 'SUMMARY']);
const INTERACTIVE_ROLES = new Set([
  'button',
  'checkbox',
  'link',
  'menuitem',
  'switch',
  'tab',
]);

interface ElementLike {
  tagName?: unknown;
  isContentEditable?: unknown;
  getAttribute?: (name: string) => unknown;
}

function asElementLike(
  target: EventTarget | null | undefined,
): ElementLike | null {
  if (typeof target !== 'object' || target === null) return null;
  return target as ElementLike;
}

function roleOf(element: ElementLike): string | null {
  if (typeof element.getAttribute !== 'function') return null;
  const role = element.getAttribute('role');
  return typeof role === 'string' ? role : null;
}
