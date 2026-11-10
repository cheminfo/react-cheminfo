// @vitest-environment jsdom
/**
 * A step's typing and choosing: what reaches a field and a list, at the pace
 * a room can follow.
 */

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DemoActions } from '../demoActions.ts';
import { createDemoActions } from '../demoActions.ts';
import type { DemoCursor } from '../demoCursor.ts';
import { createDemoCursor } from '../demoCursor.ts';

import {
  build,
  installPage,
  listen,
  place,
  rejection,
  removePage,
} from './page.ts';

let byId: (id: string) => HTMLElement;
let cursor: DemoCursor;
const never = new AbortController().signal;

beforeEach(() => {
  vi.useFakeTimers();
  installPage();
  byId = build(
    `<button id="go">Go</button>` +
      `<input id="formula" value="C6"><textarea id="notes">a</textarea>` +
      `<select id="list"><option value="a">A</option>` +
      `<option value="b">B</option><option value="c">C</option></select>`,
  );
  place(byId('go'), { left: 10, top: 10, width: 100, height: 30 });
  place(byId('formula'), { left: 10, top: 300, width: 160, height: 24 });
  place(byId('notes'), { left: 10, top: 340, width: 160, height: 60 });
  place(byId('list'), { left: 10, top: 420, width: 120, height: 24 });
  cursor = createDemoCursor(document);
});

afterEach(() => {
  removePage();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function actions(fast: boolean): DemoActions {
  return createDemoActions({ cursor, signal: never, fast });
}

async function play(action: Promise<void>): Promise<void> {
  await vi.runAllTimersAsync();
  await action;
}

/**
 * Each value a field reports as it is written, and when.
 * @param id - The field.
 * @param type - The event it reports with.
 * @returns The values and their fake times, filled as they come.
 */
function watch(id: string, type = 'input'): Array<[string, number]> {
  const values: Array<[string, number]> = [];
  byId(id).addEventListener(type, (event) => {
    values.push([(event.target as HTMLInputElement).value, performance.now()]);
  });
  return values;
}

test('typing clicks the field, then adds each character after what it holds', async () => {
  const typed = watch('formula');
  const clicks = listen(['click']);

  await play(actions(false).type('#formula', 'H6'));

  expect(clicks.map((click) => click.target)).toStrictEqual(['formula']);
  expect(typed.map(([value]) => value)).toStrictEqual(['C6H', 'C6H6']);
  expect(typed[1]?.[1]).toBe((typed[0]?.[1] ?? 0) + 70);
  expect(document.activeElement).toBe(byId('formula'));
});

test('a fast step types into a text area without a pause', async () => {
  const typed = watch('notes');

  await play(actions(true).type('#notes', 'bc'));

  expect(typed.map(([value]) => value)).toStrictEqual(['ab', 'abc']);
  expect(typed[1]?.[1]).toBe(typed[0]?.[1]);
});

test('typing writes past a framework watching the field’s own value', async () => {
  const field = byId('formula') as HTMLInputElement;
  const own = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  const written: string[] = [];
  Object.defineProperty(field, 'value', {
    configurable: true,
    get: () => own?.get?.call(field) as string,
    set: (value: string) => {
      written.push(value);
      own?.set?.call(field, value);
    },
  });

  await play(actions(true).type('#formula', 'O'));

  expect(written).toStrictEqual([]);
  expect(field.value).toBe('C6O');
});

test('typing where there is no field fails the step, after its click', async () => {
  const clicks = listen(['click']);
  const failed = rejection(actions(true).type('#go', 'x'));
  await vi.runAllTimersAsync();

  await expect(failed).resolves.toBe(
    'The demo was asked to type where there is no field.',
  );

  expect(clicks.map((click) => click.target)).toStrictEqual(['go']);
});

test('choosing shows the list opened, then picks the option and says so', async () => {
  const seen: string[] = [];
  const list = byId('list') as HTMLSelectElement;
  for (const type of ['input', 'change']) {
    list.addEventListener(type, () => {
      const ringed = document.querySelectorAll('.demo-cursor-ripple').length;
      const pressed = document
        .querySelector('.demo-cursor')
        ?.classList.contains('demo-cursor--pressed');
      seen.push(`${type}:${list.value}:${ringed}:${String(pressed)}`);
    });
  }
  const arrived: number[] = [];
  list.addEventListener('pointermove', () => {
    arrived.push(performance.now());
  });
  const chosen = watch('list', 'change');

  await play(actions(false).choose('#list', 'c'));

  expect(seen).toStrictEqual(['input:c:1:true', 'change:c:1:true']);
  expect(chosen[0]?.[1]).toBe((arrived.at(-1) ?? 0) + 260);
  expect(
    document
      .querySelector('.demo-cursor')
      ?.classList.contains('demo-cursor--pressed'),
  ).toBe(false);
});

test('a fast step chooses at once, with no ring', async () => {
  const chosen = watch('list', 'change');
  const before = performance.now();

  await play(actions(true).choose('#list', 'b'));

  expect(chosen).toStrictEqual([['b', before]]);
  expect(document.querySelectorAll('.demo-cursor-ripple')).toHaveLength(0);
});

test('choosing where there is no list fails the step', async () => {
  const failed = rejection(actions(true).choose('#formula', 'b'));
  await vi.runAllTimersAsync();

  await expect(failed).resolves.toBe(
    'The demo was asked to choose where there is no list.',
  );
});
