import { expect, test } from 'vitest';

import type {
  PaletteDragEvent,
  PalettePointerEvent,
} from '../paletteGesture.ts';
import {
  createInHand,
  createPaletteTransfer,
  paletteClick,
} from '../paletteGesture.ts';
import type { Point } from '../types.ts';

type Kind = 'spring' | 'mass';

const TYPE = 'application/x-mechanics-piece';

function isKind(value: string): value is Kind {
  return value === 'spring' || value === 'mass';
}

function cell<T>(value: T): { value: T; peek: () => T } {
  const box = { value, peek: () => box.value };
  return box;
}

// An SVG whose points are the screen's, shifted by 10 on each axis.
const SVG = {
  getScreenCTM: () => ({
    inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: -10, f: -10 }),
  }),
} as unknown as SVGSVGElement;

const SIGNALS = {
  batch: (callback: () => void) => {
    callback();
  },
};

interface FakeTransfer {
  data: Map<string, string>;
  types: string[];
  effectAllowed: string;
  dropEffect: string;
  image: unknown;
}

function dragEvent(transfer: FakeTransfer, extra: object = {}) {
  const calls = { prevented: 0 };
  const event = {
    clientX: 50,
    clientY: 70,
    altKey: false,
    currentTarget: {
      querySelector: () => ({
        getBoundingClientRect: () => ({ width: 20, height: 16 }),
      }),
    },
    dataTransfer: {
      get types() {
        return transfer.types;
      },
      get effectAllowed() {
        return transfer.effectAllowed;
      },
      set effectAllowed(value: string) {
        transfer.effectAllowed = value;
      },
      get dropEffect() {
        return transfer.dropEffect;
      },
      set dropEffect(value: string) {
        transfer.dropEffect = value;
      },
      setData: (type: string, value: string) => {
        transfer.data.set(type, value);
        transfer.types.push(type);
      },
      getData: (type: string) => transfer.data.get(type) ?? '',
      setDragImage: (image: unknown, x: number, y: number) => {
        transfer.image = { image, x, y };
      },
    },
    preventDefault: () => {
      calls.prevented++;
    },
    ...extra,
  } as unknown as PaletteDragEvent;
  return { event, calls };
}

function emptyTransfer(): FakeTransfer {
  return {
    data: new Map(),
    types: [],
    effectAllowed: 'none',
    dropEffect: 'none',
    image: null,
  };
}

test('a first click takes an entry in hand; a double click or a key adds it', () => {
  expect(paletteClick({ detail: 0 })).toBe('add');
  expect(paletteClick({ detail: 1 })).toBe('take');
  expect(paletteClick({ detail: 2 })).toBe('add');
  expect(paletteClick({ detail: 3 })).toBe('take');
  expect(paletteClick({ detail: 4 })).toBe('add');
});

test('a drag carries the kind under the site’s type, its icon centred', () => {
  const transfer = createPaletteTransfer<Kind>({
    type: TYPE,
    isKind,
    drop: () => undefined,
  });
  const props = transfer.dragProps('spring');

  expect(props.draggable).toBe(true);

  const carried = emptyTransfer();
  props.onDragStart(dragEvent(carried).event);

  expect(carried.data.get(TYPE)).toBe('spring');
  expect(carried.effectAllowed).toBe('copy');
  expect(carried.image).toMatchObject({ x: 10, y: 8 });
});

test('only a drag of the palette is let in, and it is dropped where let go', () => {
  const dropped: Array<{ kind: Kind; at: Point; alt: boolean }> = [];
  const transfer = createPaletteTransfer<Kind>({
    type: TYPE,
    isKind,
    drop: (kind, at, event) => {
      dropped.push({ kind, at, alt: event.altKey });
    },
  });

  const other = emptyTransfer();
  other.types.push('text/plain');
  const refused = dragEvent(other);
  transfer.allowDrop(refused.event);

  expect(refused.calls.prevented).toBe(0);

  const carried = emptyTransfer();
  carried.data.set(TYPE, 'mass');
  carried.types.push(TYPE);
  const over = dragEvent(carried);
  transfer.allowDrop(over.event);

  expect(over.calls.prevented).toBe(1);
  expect(carried.dropEffect).toBe('copy');

  transfer.drop(dragEvent(carried, { altKey: true }).event, SVG);

  expect(dropped).toStrictEqual([
    { kind: 'mass', at: { x: 40, y: 60 }, alt: true },
  ]);
});

test('a drop carrying no kind of the palette puts nothing down', () => {
  const dropped: Kind[] = [];
  const transfer = createPaletteTransfer<Kind>({
    type: TYPE,
    isKind,
    drop: (kind) => {
      dropped.push(kind);
    },
  });
  const carried = emptyTransfer();
  carried.data.set(TYPE, 'lever');
  carried.types.push(TYPE);
  const { event, calls } = dragEvent(carried);
  transfer.drop(event, SVG);

  expect(dropped).toStrictEqual([]);
  expect(calls.prevented).toBe(0);
});

function pointerEvent(button = 0) {
  const calls = { stopped: 0, prevented: 0 };
  const event = {
    button,
    clientX: 30,
    clientY: 20,
    stopPropagation: () => {
      calls.stopped++;
    },
    preventDefault: () => {
      calls.prevented++;
    },
  } as unknown as PalettePointerEvent;
  return { event, calls };
}

test('taking a kind takes the select tool; taking it again puts it back', () => {
  const taken = cell<Kind | null>(null);
  const at = cell<Point | null>({ x: 1, y: 1 });
  const tools: string[] = [];
  const hand = createInHand<Kind>({
    taken,
    at,
    put: () => undefined,
    onTake: () => tools.push('select'),
    signals: SIGNALS,
  });
  hand.take('spring');

  expect(taken.value).toBe('spring');
  expect(tools).toStrictEqual(['select']);

  hand.take('spring');

  expect(taken.value).toBeNull();
  expect(at.value).toBeNull();

  hand.take('mass');
  hand.release();

  expect(taken.value).toBeNull();
});

test('a left press puts the kind in hand down, and it stays in hand', () => {
  const taken = cell<Kind | null>('mass');
  const at = cell<Point | null>(null);
  const put: Array<{ kind: Kind; at: Point }> = [];
  const hand = createInHand<Kind>({
    taken,
    at,
    put: (kind, point) => put.push({ kind, at: point }),
    signals: SIGNALS,
  });
  const left = pointerEvent(0);
  hand.press(left.event, SVG);

  expect(put).toStrictEqual([{ kind: 'mass', at: { x: 20, y: 10 } }]);
  expect(left.calls).toStrictEqual({ stopped: 1, prevented: 1 });
  expect(taken.value).toBe('mass');

  const right = pointerEvent(2);
  hand.press(right.event, SVG);

  expect(put).toHaveLength(1);
  expect(right.calls).toStrictEqual({ stopped: 0, prevented: 0 });
});

test('a press while a caption is typed, or with nothing in hand, is the canvas’s', () => {
  const put: Kind[] = [];
  const typing = createInHand<Kind>({
    taken: cell<Kind | null>('spring'),
    at: cell<Point | null>(null),
    put: (kind) => put.push(kind),
    busy: () => true,
    signals: SIGNALS,
  });
  typing.press(pointerEvent().event, SVG);
  const empty = createInHand<Kind>({
    taken: cell<Kind | null>(null),
    at: cell<Point | null>(null),
    put: (kind) => put.push(kind),
    signals: SIGNALS,
  });
  const press = pointerEvent();
  empty.press(press.event, SVG);

  expect(put).toStrictEqual([]);
  expect(press.calls).toStrictEqual({ stopped: 0, prevented: 0 });
});

test('the pointer is followed only while a kind is in hand', () => {
  const taken = cell<Kind | null>(null);
  const at = cell<Point | null>(null);
  const hand = createInHand<Kind>({
    taken,
    at,
    put: () => undefined,
    signals: SIGNALS,
  });
  hand.follow(pointerEvent().event, SVG);

  expect(at.value).toBeNull();

  taken.value = 'spring';
  hand.follow(pointerEvent().event, SVG);

  expect(at.value).toStrictEqual({ x: 20, y: 10 });

  hand.leave();

  expect(at.value).toBeNull();
});
