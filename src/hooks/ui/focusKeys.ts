/**
 * Whose key it is: the focused control's, or the page's shortcuts'. Every key
 * typed in a text field, an editable region or a select is the field's. Space
 * and Enter are a control's while it acts on them — a button, a checkbox, a
 * menu, a link for Enter, a radio, a tab or the option of a single list until
 * it is chosen —, the page's otherwise: after a click on a slider, on the
 * speed already chosen or on the row already selected, Space reaches the
 * page's shortcut (a viewer plays). A page's keyboard shortcuts listen above
 * the controls and ask this first.
 */

import { Utils } from '@blueprintjs/core';

/** What the focused control is, as far as Space and Enter go. */
export interface FocusedControl {
  /** Its ARIA role, else what the element is: `button`, `link`, `checkbox`, `radio`, `summary`. */
  role: string;
  /** Whether it is already chosen: a checked radio, a selected tab or option. */
  chosen: boolean;
  /** Whether it is an option of a list that takes several, where Space toggles it. */
  multiple: boolean;
}

/**
 * Whether Space or Enter belongs to the focused control rather than to the
 * page. A button, a checkbox or a menu takes both; a link takes Enter only;
 * a slider takes neither (its keys are the arrows); a radio, a tab and the
 * option of a single list take Space until they are chosen — once chosen,
 * Space does nothing to them, and goes to the page.
 * @param key - The key: `' '` or `'Enter'`.
 * @param control - The focused control, or `null` for none.
 * @returns Whether the control keeps the key.
 */
export function keyBelongsTo(
  key: string,
  control: FocusedControl | null,
): boolean {
  if (control === null || control.role === 'slider') return false;
  if (key === 'Enter') return true;
  if (key !== ' ') return false;
  const { role, chosen, multiple } = control;
  if (role === 'link') return false;
  if (role === 'option') return multiple || !chosen;
  if (role === 'radio' || role === 'tab') return !chosen;
  return true;
}

/**
 * Whether a key pressed over the page belongs to the focused element rather
 * than to the page's shortcuts: every key in a text field, an editable region
 * or a select; Space and Enter as {@link keyBelongsTo} says.
 * @param event - The key.
 * @returns Whether a shortcut leaves it alone.
 */
export function keyBelongsToFocus(
  event: Pick<KeyboardEvent, 'key' | 'target'>,
): boolean {
  const { target, key } = event;
  if (!(target instanceof HTMLElement)) return false;
  if (
    Utils.elementIsTextInput(target) ||
    target.isContentEditable ||
    target.closest('select') !== null
  ) {
    return true;
  }
  if (key !== ' ' && key !== 'Enter') return false;
  return keyBelongsTo(key, focusedControl(target));
}

// The controls that may act on Space or Enter. Blueprint's elementIsTextInput
// leaves checkboxes and radios to the page on purpose, so they are named here.
const CONTROLS = [
  'button',
  'a[href]',
  'summary',
  'input[type="checkbox"]',
  'input[type="radio"]',
  '[role="button"]',
  '[role="link"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="radio"]',
  '[role="tab"]',
  '[role="option"]',
  '[role="treeitem"]',
  '[role="combobox"]',
  '[role="slider"]',
].join(', ');

/**
 * The control a focused element is, or is in.
 * @param target - The focused element.
 * @returns The control, or `null`.
 */
function focusedControl(target: HTMLElement): FocusedControl | null {
  const control = target.closest<HTMLElement>(CONTROLS);
  if (control === null) return null;
  const checked = control instanceof HTMLInputElement && control.checked;
  return {
    role: roleOf(control),
    chosen:
      checked ||
      control.getAttribute('aria-checked') === 'true' ||
      control.getAttribute('aria-selected') === 'true',
    multiple: control.closest('[aria-multiselectable="true"]') !== null,
  };
}

/**
 * The role of a control: its ARIA role, else what the element is.
 * @param control - The control.
 * @returns The role.
 */
function roleOf(control: HTMLElement): string {
  const role = control.getAttribute('role');
  if (role !== null) return role;
  if (control instanceof HTMLInputElement) return control.type;
  const tag = control.tagName.toLowerCase();
  return tag === 'a' ? 'link' : tag;
}
