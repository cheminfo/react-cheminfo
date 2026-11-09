import type { DemoCursor } from './demoCursor.ts';
import type { DemoPoint } from './demoEvents.ts';
import { movePointer, pressPointer, releasePointer } from './demoEvents.ts';
import type { DemoTarget } from './demoTargets.ts';
import { locate } from './demoTargets.ts';

/** What a demo's step does to the tool, the way a hand would. */
export interface DemoActions {
  /**
   * Whether the step is replayed at once, to reach a later one: the cursor
   * jumps and the pauses are skipped, but every event is still sent.
   */
  readonly fast: boolean;
  /** Move the cursor onto a target. */
  point: (target: DemoTarget) => Promise<void>;
  /** Click a target. */
  click: (target: DemoTarget) => Promise<void>;
  /** Double-click a target. */
  doubleClick: (target: DemoTarget) => Promise<void>;
  /** Press on one target, drag to another, and let go. */
  drag: (from: DemoTarget, to: DemoTarget) => Promise<void>;
  /** Click a field and type into it, after what it holds. */
  type: (target: DemoTarget, text: string) => Promise<void>;
  /** Pick an option of a `<select>` by its value. */
  choose: (target: DemoTarget, value: string) => Promise<void>;
  /** Let a moment pass, for what was done to be seen. */
  wait: (milliseconds: number) => Promise<void>;
}

/** How the actions of one step are played. */
export interface DemoActionOptions {
  /** The demo's pointer. */
  cursor: DemoCursor;
  /** Stops the step where it is, when the slide moves on. */
  signal: AbortSignal;
  /** Whether the step is replayed at once. */
  fast: boolean;
}

/**
 * The actions a step plays, through the demo's cursor.
 * @param options - See {@link DemoActionOptions}.
 * @returns The actions.
 */
export function createDemoActions(options: DemoActionOptions): DemoActions {
  const { cursor, signal, fast } = options;
  let hovered: Element | null = null;

  async function moveTo(point: DemoPoint): Promise<void> {
    if (fast) {
      cursor.jump(point);
      hovered = movePointer(point, false, hovered);
      return;
    }
    await cursor.glide(point, signal, (next) => {
      hovered = movePointer(next, false, hovered);
    });
  }

  async function press(point: DemoPoint, count: number): Promise<void> {
    cursor.press(true);
    if (!fast) cursor.ripple();
    pressPointer(point, count);
    await frame(signal);
    releasePointer(point, count, true);
    cursor.press(false);
    await frame(signal);
  }

  async function reach(target: DemoTarget): Promise<DemoPoint> {
    const point = await locate(target, signal);
    await moveTo(point);
    return point;
  }

  async function wait(milliseconds: number): Promise<void> {
    if (!fast) await sleep(milliseconds, signal);
  }

  return {
    fast,
    point: async (target) => {
      await reach(target);
    },
    click: async (target) => {
      await press(await reach(target), 1);
    },
    doubleClick: async (target) => {
      const point = await reach(target);
      await press(point, 1);
      await press(point, 2);
    },
    drag: async (from, to) => {
      const start = await reach(from);
      const end = await locate(to, signal);
      cursor.press(true);
      pressPointer(start, 1);
      await frame(signal);
      const halfway = {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2,
      };
      if (fast) {
        cursor.jump(halfway);
        hovered = movePointer(halfway, true, hovered);
        await frame(signal);
        cursor.jump(end);
        hovered = movePointer(end, true, hovered);
        await frame(signal);
      } else {
        await cursor.glide(end, signal, (next) => {
          hovered = movePointer(next, true, hovered);
        });
      }
      releasePointer(end, 1, false);
      cursor.press(false);
      await frame(signal);
    },
    type: async (target, text) => {
      const point = await reach(target);
      await press(point, 1);
      const field = document.elementFromPoint(point.x, point.y);
      if (!isTextField(field)) {
        throw new Error('The demo was asked to type where there is no field.');
      }
      field.focus({ preventScroll: true });
      /* eslint-disable no-await-in-loop -- typed one character at a time, on purpose */
      for (const character of text) {
        setValue(field, `${field.value}${character}`);
        field.dispatchEvent(new Event('input', { bubbles: true }));
        await wait(TYPING_MS);
      }
      /* eslint-enable no-await-in-loop */
    },
    choose: async (target, value) => {
      const point = await reach(target);
      const select = document.elementFromPoint(point.x, point.y);
      if (!(select instanceof HTMLSelectElement)) {
        throw new Error('The demo was asked to choose where there is no list.');
      }
      cursor.press(true);
      if (!fast) cursor.ripple();
      await wait(CHOOSING_MS);
      setValue(select, value);
      select.dispatchEvent(new Event('input', { bubbles: true }));
      select.dispatchEvent(new Event('change', { bubbles: true }));
      cursor.press(false);
      await frame(signal);
    },
    wait,
  };
}

/** The pace of typing, per character. */
const TYPING_MS = 70;
/** How long a list is shown being opened before its choice lands. */
const CHOOSING_MS = 260;

function isTextField(
  element: Element | null,
): element is HTMLInputElement | HTMLTextAreaElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  );
}

/**
 * Write a field's value the way typing does. A framework that keeps the
 * field's value in its own state watches the element's own setter, so the
 * value is written through the prototype's.
 * @param field - The field.
 * @param value - Its new value.
 */
function setValue(
  field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string,
): void {
  Reflect.set(Object.getPrototypeOf(field) as object, 'value', value, field);
}

function frame(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    requestAnimationFrame(() => {
      if (signal.aborted) reject(signal.reason as Error);
      else resolve();
    });
  });
}

function sleep(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', stop);
      resolve();
    }, milliseconds);
    function stop(): void {
      clearTimeout(timer);
      reject(signal.reason as Error);
    }
    signal.addEventListener('abort', stop, { once: true });
  });
}
