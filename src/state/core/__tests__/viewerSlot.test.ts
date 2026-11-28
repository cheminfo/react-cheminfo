import { expect, test } from 'vitest';

import { createViewerSlot } from '../viewerSlot.ts';

test('a viewer is known while its page is on screen, and forgotten after', () => {
  const slot = createViewerSlot<{ name: string }, { zoom: number }>();
  const first = { current: { name: 'first' } };
  const second = { current: { name: 'second' } };

  expect(slot.current()).toBeNull();

  const forgetFirst = slot.register(first);
  const forgetSecond = slot.register(second);
  forgetFirst();

  expect(slot.current()).toStrictEqual({ name: 'second' });

  forgetSecond();

  expect(slot.current()).toBeNull();
});

test('what a viewer is to show is taken once', () => {
  const slot = createViewerSlot<never, { zoom: number }>();
  slot.keep({ zoom: 2 });

  expect(slot.take()).toStrictEqual({ zoom: 2 });
  expect(slot.take()).toBeNull();
});
