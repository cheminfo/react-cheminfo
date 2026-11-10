/**
 * The page a demo is played on, laid out by hand.
 *
 * jsdom draws nothing: every box is empty, nothing lies at any point and
 * nothing scrolls. So the boxes are given here, the hit test answers from
 * them — the last element placed is the one on top — and `window` is made the
 * Window the events are built in, which jsdom checks and vitest's global is
 * not.
 */

import { vi } from 'vitest';

/** A box on the page, in client pixels. */
export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** What a demo's event told the element it reached. */
export interface Heard {
  type: string;
  target: string;
  x: number;
  y: number;
  detail: number;
  buttons: number;
  related: string | null;
}

/** The elements `scrollIntoView` was asked of, with its options. */
export const scrolled: Array<[Element, ScrollIntoViewOptions | undefined]> = [];

const boxes = new Map<Element, Box>();

/** Give jsdom the layout a demo reads. */
export function installPage(): void {
  boxes.clear();
  scrolled.length = 0;
  vi.stubGlobal(
    'window',
    (globalThis as unknown as { jsdom: { window: Window } }).jsdom.window,
  );
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: elementAt,
  });
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: new Proxy(recordScroll, {
      apply(record, element: Element, parameters: [ScrollIntoViewOptions?]) {
        record(element, parameters[0]);
      },
    }),
  });
}

/**
 * Give jsdom the drag events it does not have: a `DataTransfer` holding what
 * `dragstart` writes, and a `DragEvent` carrying it.
 */
export function installDrag(): void {
  vi.stubGlobal('DataTransfer', FakeDataTransfer);
  vi.stubGlobal('DragEvent', FakeDragEvent);
}

/** Take the layout away, and empty the page. */
export function removePage(): void {
  Reflect.deleteProperty(document, 'elementFromPoint');
  Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  boxes.clear();
  document.body.replaceChildren();
}

/**
 * Lay an element out, on top of everything placed before it.
 * @param element - The element.
 * @param box - Where it is.
 */
export function place(element: Element, box: Box): void {
  boxes.delete(element);
  boxes.set(element, box);
  vi.spyOn(element, 'getBoundingClientRect').mockImplementation(() => {
    const placed = boxes.get(element) ?? box;
    return new DOMRect(placed.left, placed.top, placed.width, placed.height);
  });
}

/**
 * Write markup into the page.
 * @param markup - The HTML.
 * @returns The element of each `id` in it, looked up by that id.
 */
export function build(markup: string): (id: string) => HTMLElement {
  document.body.innerHTML = markup;
  return (id) => {
    const element = document.querySelector<HTMLElement>(`#${id}`);
    if (element === null) throw new Error(`no element #${id} on the page`);
    return element;
  };
}

/**
 * Listen for events of some types, on whichever element they reach.
 * @param types - The event types.
 * @returns What was heard, in order.
 */
export function listen(types: readonly string[]): Heard[] {
  const heard: Heard[] = [];
  for (const type of types) {
    document.addEventListener(
      type,
      (event) => {
        const mouse = event as MouseEvent;
        heard.push({
          type,
          target: (event.target as Element).id,
          x: mouse.clientX,
          y: mouse.clientY,
          detail: mouse.detail,
          buttons: mouse.buttons,
          related: (mouse.relatedTarget as Element | null)?.id ?? null,
        });
      },
      { capture: true },
    );
  }
  return heard;
}

/**
 * The message a promise is rejected with, read once it settles, so a test can
 * move the clock on before awaiting it.
 * @param promise - The promise.
 * @returns The message, or `resolved` when it was not rejected.
 */
export async function rejection(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
    return 'resolved';
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/** The pointer and mouse events a hand causes. */
export const POINTER_TYPES = [
  'pointerover',
  'pointerout',
  'pointermove',
  'pointerdown',
  'pointerup',
  'mouseover',
  'mouseout',
  'mousemove',
  'mousedown',
  'mouseup',
  'click',
  'dblclick',
] as const;

class FakeDataTransfer {
  readonly #data = new Map<string, string>();

  public setData(format: string, data: string): void {
    this.#data.set(format, data);
  }

  public getData(format: string): string {
    return this.#data.get(format) ?? '';
  }
}

class FakeDragEvent extends MouseEvent {
  public readonly dataTransfer: DataTransfer | null;

  public constructor(type: string, init: DragEventInit = {}) {
    super(type, init);
    this.dataTransfer = init.dataTransfer ?? null;
  }
}

function recordScroll(element: Element, options?: ScrollIntoViewOptions): void {
  scrolled.push([element, options]);
}

function elementAt(x: number, y: number): Element | null {
  let found: Element | null = null;
  for (const [element, box] of boxes) {
    if (
      element.isConnected &&
      x >= box.left &&
      x < box.left + box.width &&
      y >= box.top &&
      y < box.top + box.height
    ) {
      found = element;
    }
  }
  return found;
}
