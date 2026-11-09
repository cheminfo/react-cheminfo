/**
 * The input a demo hands the tool: the pointer and mouse events a real hand
 * would cause, dispatched on whatever lies under the demo's cursor.
 *
 * The tool is not told it is being demonstrated. Its own handlers take these
 * events as they take a visitor's, so a demo shows what the tool does rather
 * than a re-enactment of it — and a demo that stops working says the tool's
 * controls moved.
 */

/** A point on the page, in client pixels. */
export interface DemoPoint {
  /** From the left of the viewport. */
  x: number;
  /** From the top of the viewport. */
  y: number;
}

/** The pointer the demo's events come from, told apart from a real one. */
export const DEMO_POINTER_ID = 7331;

/**
 * Let the tool capture the demo's pointer.
 *
 * A canvas captures the pointer pressed on it, and the browser refuses a
 * capture for a pointer it never saw press, which would break the handler
 * halfway. Captures of the demo's pointer are therefore taken as done, and
 * every other one goes to the browser as before. Installed once per page, and
 * only on a page playing a demo.
 */
export function tolerateDemoPointer(): void {
  if (tolerated) return;
  tolerated = true;
  answerForDemoPointer('setPointerCapture', undefined);
  answerForDemoPointer('releasePointerCapture', undefined);
  answerForDemoPointer('hasPointerCapture', true);
}

/**
 * Keep the keyboard with the page framing the tool.
 *
 * A press moves the focus to what was pressed, and the tool's own handlers
 * focus what they work on; framed on a slide, either would take the
 * presenter's keys into the frame, and the arrows would stop moving the
 * slides. So while the tool's page is not the one focused, a focus asked for
 * by anything is not taken. A visitor who clicks into the frame focuses it,
 * and from then on the tool takes the focus as it always does.
 */
export function keepKeyboardOutside(): void {
  if (keyboardKept) return;
  keyboardKept = true;
  for (const prototype of [HTMLElement.prototype, SVGElement.prototype]) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'focus');
    const original = descriptor?.value as
      ((options?: FocusOptions) => void) | undefined;
    if (descriptor === undefined || original === undefined) continue;
    Object.defineProperty(prototype, 'focus', {
      ...descriptor,
      value: new Proxy(original, {
        apply(target, element: Element, parameters: [FocusOptions?]) {
          if (!element.ownerDocument.hasFocus()) return;
          Reflect.apply(target, element, parameters);
        },
      }),
    });
  }
}

/**
 * Move the pointer to a point, as a hand moving the mouse does.
 * @param point - Where it goes.
 * @param pressed - Whether the button is held, for a drag.
 * @param previous - What was under the pointer before, to leave it.
 * @returns What is under the pointer now.
 */
export function movePointer(
  point: DemoPoint,
  pressed: boolean,
  previous: Element | null,
): Element | null {
  const target = document.elementFromPoint(point.x, point.y);
  if (target !== previous) {
    if (previous !== null) {
      fire(previous, 'pointerout', point, pressed, 0, target);
      fire(previous, 'mouseout', point, pressed, 0, target);
    }
    if (target !== null) {
      fire(target, 'pointerover', point, pressed, 0, previous);
      fire(target, 'mouseover', point, pressed, 0, previous);
    }
  }
  if (target !== null) {
    fire(target, 'pointermove', point, pressed, 0);
    fire(target, 'mousemove', point, pressed, 0);
  }
  return target;
}

/**
 * Press the button at a point.
 * @param point - Where.
 * @param count - Which press of a run this is: `2` for the second of a double
 * click.
 */
export function pressPointer(point: DemoPoint, count: number): void {
  const target = document.elementFromPoint(point.x, point.y);
  if (target === null) return;
  fire(target, 'pointerdown', point, true, count);
  fire(target, 'mousedown', point, true, count);
  focusFrom(target);
}

/**
 * Release the button at a point, and click when it is where it was pressed.
 * @param point - Where.
 * @param count - Which press of a run this is.
 * @param click - Whether the release is a click.
 */
export function releasePointer(
  point: DemoPoint,
  count: number,
  click: boolean,
): void {
  const target = document.elementFromPoint(point.x, point.y);
  if (target === null) return;
  fire(target, 'pointerup', point, false, count);
  fire(target, 'mouseup', point, false, count);
  if (!click) return;
  fire(target, 'click', point, false, count);
  if (count === 2) fire(target, 'dblclick', point, false, count);
}

let tolerated = false;
let keyboardKept = false;

/**
 * Answer a pointer-capture method for the demo's pointer, and leave it to the
 * browser for every other.
 * @param name - The method of `Element`.
 * @param answer - What it returns for the demo's pointer.
 */
function answerForDemoPointer(
  name: 'hasPointerCapture' | 'releasePointerCapture' | 'setPointerCapture',
  answer: boolean | undefined,
): void {
  const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, name);
  const original = descriptor?.value as
    ((pointerId: number) => boolean | undefined) | undefined;
  if (descriptor === undefined || original === undefined) return;
  Object.defineProperty(Element.prototype, name, {
    ...descriptor,
    value: new Proxy(original, {
      apply(target, element: Element, parameters: [number]) {
        if (parameters[0] === DEMO_POINTER_ID) return answer;
        return Reflect.apply(target, element, parameters);
      },
    }),
  });
}

function fire(
  target: Element,
  type: string,
  point: DemoPoint,
  pressed: boolean,
  detail: number,
  relatedTarget: Element | null = null,
): void {
  const init: PointerEventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    view: globalThis.window,
    clientX: point.x,
    clientY: point.y,
    screenX: point.x,
    screenY: point.y,
    button: 0,
    buttons: pressed ? 1 : 0,
    detail,
    relatedTarget,
    pointerId: DEMO_POINTER_ID,
    pointerType: 'mouse',
    isPrimary: true,
  };
  const event = type.startsWith('pointer')
    ? new PointerEvent(type, init)
    : new MouseEvent(type, init);
  target.dispatchEvent(event);
}

/**
 * A real press moves the focus to what was pressed; a dispatched one does
 * not, so the demo does it, the way the browser would.
 * @param target - What was pressed.
 */
function focusFrom(target: Element): void {
  const focusable = target.closest<HTMLElement>(FOCUSABLE);
  focusable?.focus({ preventScroll: true });
}

const FOCUSABLE =
  'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])';
