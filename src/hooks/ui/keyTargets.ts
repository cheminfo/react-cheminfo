/**
 * Whether a key event is aimed at somewhere the visitor types: a text field, a
 * select, an editable region, anything carrying `role="textbox"`, or a canvas
 * holding the focus — a structure editor reads its own keys there, `Delete`
 * and the arrows included. A keyboard shortcut listening above it leaves such
 * a key alone.
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
 * Whether a key event is aimed at a control that reads the arrow keys,
 * `PageUp`, `PageDown`, `Home` and `End` itself: somewhere the visitor types
 * ({@link isTextEntryTarget}), a slider, a spin button, a combobox or a
 * scroll bar, or a button whose popup is open (`aria-haspopup` with
 * `aria-expanded="true"`: its list takes the arrows). A list's keyboard
 * navigation listening above such a control leaves the key to it, so choosing
 * in a select or moving a slider inside a list never moves the list's
 * selection. The items of a composite widget — a radio, a tab, an option —
 * are not such controls: the widget walks them with this same navigation, and
 * a nested one that acts on a key marks it handled (`preventDefault`).
 * @param target - The `target` of the keyboard event.
 * @returns True when the control acts on those keys itself.
 */
export function ownsNavigationKeys(
  target: EventTarget | null | undefined,
): boolean {
  if (isTextEntryTarget(target)) return true;
  const element = asElementLike(target);
  if (element === null) return false;
  const role = roleOf(element);
  if (role !== null && NAVIGATING_ROLES.has(role)) return true;
  const popup = attributeOf(element, 'aria-haspopup');
  return (
    popup !== null &&
    popup !== 'false' &&
    attributeOf(element, 'aria-expanded') === 'true'
  );
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

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'CANVAS']);
/** The roles of a single control that moves its own value on the arrow keys (WAI-ARIA). */
const NAVIGATING_ROLES = new Set([
  'combobox',
  'scrollbar',
  'slider',
  'spinbutton',
]);
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
  return attributeOf(element, 'role');
}

function attributeOf(element: ElementLike, name: string): string | null {
  if (typeof element.getAttribute !== 'function') return null;
  const value = element.getAttribute(name);
  return typeof value === 'string' ? value : null;
}
