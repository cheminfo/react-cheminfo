/**
 * Where an event bubbling to an element comes from: the element itself, one
 * of the controls it holds, or a part of the page React hands it through a
 * portal. A row that is a click target of its own while it holds buttons —
 * a list's step, an image of a table — asks this before acting, so a click
 * meant for one of its buttons, or for the menu a button opened, never also
 * acts on the row, and nothing stops the event on its way to the page's
 * shortcuts.
 */

/** The part of an event that says where it comes from and who reads it. */
export interface BubblingEvent {
  /** What the event was aimed at. */
  readonly target: EventTarget | null;
  /** The element whose handler reads it. */
  readonly currentTarget: EventTarget | null;
}

/**
 * Whether an event reached an element from outside the element's own nodes:
 * from a menu, a popover or a dialog it opened, whose events React bubbles
 * through the portal holding them although the page never put them inside
 * it.
 * @param event - The event, synthetic or native.
 * @returns Whether it came through a portal.
 */
export function fromPortal(event: BubblingEvent): boolean {
  const holder = asNode(event.currentTarget);
  const target = asNode(event.target);
  if (holder === null || target === null) return false;
  return !holder.contains(target);
}

/**
 * Whether an event bubbling to an element came from one of the controls it
 * holds rather than from the element itself: a button, a link, a field, a
 * menu item — anything a person acts on by itself — between what the event
 * was aimed at and the element, or anything reaching the element through a
 * portal ({@link fromPortal}). The element's own parts — its text, its
 * picture — are its own.
 * @param event - The event, synthetic or native.
 * @returns Whether a control of the element takes it.
 */
export function fromControl(event: BubblingEvent): boolean {
  if (fromPortal(event)) return true;
  const holder = asNode(event.currentTarget);
  const target = asNode(event.target);
  if (holder === null || target === null) return false;
  const start = target instanceof Element ? target : target.parentElement;
  const control = start?.closest(CONTROLS) ?? null;
  return control !== null && control !== holder && holder.contains(control);
}

// What a person acts on by itself. The items of a composite widget — the
// options of a list, the items of a tree — are not among them: the widget
// holding them walks them itself.
const CONTROL_ROLES = [
  'button',
  'checkbox',
  'combobox',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'radio',
  'searchbox',
  'slider',
  'spinbutton',
  'switch',
  'tab',
  'textbox',
];
const CONTROLS = [
  'a[href]',
  'button',
  'input',
  'label',
  'select',
  'summary',
  'textarea',
  '[contenteditable]:not([contenteditable="false"])',
  ...CONTROL_ROLES.map((role) => `[role="${role}"]`),
].join(', ');

/**
 * The node an event target is, where the page has nodes.
 * @param target - The target.
 * @returns The node, or `null` for none or a target that is no node.
 */
function asNode(target: EventTarget | null | undefined): Node | null {
  return typeof Node !== 'undefined' && target instanceof Node ? target : null;
}
