import type { DragEvent } from 'react';
import { expect, test } from 'vitest';

import { fileDropHandlers } from '../useFileDrop.ts';

const FILE = { name: 'titration.csv' } as File;

/**
 * One drag event, as the browser dispatches it to both of two nested regions.
 * @param files - What the pointer is carrying.
 * @returns The event, to hand to each region in turn.
 */
function dragEvent(files: File[] = []): DragEvent<HTMLElement> {
  const native = {};
  return {
    nativeEvent: native,
    preventDefault() {
      /* the page must not navigate to the file */
    },
    dataTransfer: { files, types: files.length > 0 ? ['Files'] : [] },
  } as unknown as DragEvent<HTMLElement>;
}

/**
 * A region, in the order the event reaches it.
 * @returns Its handlers, what it was told about the file, and its outline.
 */
function region() {
  const dropped: File[] = [];
  const over: boolean[] = [];
  const handlers = fileDropHandlers(
    (file) => dropped.push(file),
    (value) => over.push(value),
  );
  return { handlers, dropped, over };
}

test('a file dropped on nested regions is read once, by the inner one', () => {
  const inner = region();
  const outer = region();
  const event = dragEvent([FILE]);

  inner.handlers.onDrop(event);
  outer.handlers.onDrop(event);

  expect(inner.dropped).toStrictEqual([FILE]);
  expect(outer.dropped).toStrictEqual([]);
});

test('a drop clears the outline of both regions', () => {
  const inner = region();
  const outer = region();
  const event = dragEvent([FILE]);

  inner.handlers.onDrop(event);
  outer.handlers.onDrop(event);

  expect(inner.over).toStrictEqual([false]);
  expect(outer.over).toStrictEqual([false]);
});

test('only the region under the pointer lights up', () => {
  const inner = region();
  const outer = region();
  const event = dragEvent([FILE]);

  inner.handlers.onDragOver(event);
  outer.handlers.onDragOver(event);

  expect(inner.over).toStrictEqual([true]);
  expect(outer.over).toStrictEqual([false]);
});

test('a dragged selection is not a file, so nothing lights up', () => {
  const only = region();
  only.handlers.onDragOver(dragEvent());

  expect(only.over).toStrictEqual([]);
});

test('crossing into a child does not clear the outline', () => {
  const only = region();
  const child = {};
  const leave = {
    currentTarget: { contains: (node: unknown) => node === child },
    relatedTarget: child,
  } as unknown as DragEvent<HTMLElement>;

  only.handlers.onDragLeave(leave);

  expect(only.over).toStrictEqual([]);
});

test('leaving the region clears the outline', () => {
  const only = region();
  const leave = {
    currentTarget: { contains: () => false },
    relatedTarget: null,
  } as unknown as DragEvent<HTMLElement>;

  only.handlers.onDragLeave(leave);

  expect(only.over).toStrictEqual([false]);
});
