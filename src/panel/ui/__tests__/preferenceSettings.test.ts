import { expect, test, vi } from 'vitest';

import { createReactiveSystem } from '../../../state/core/__tests__/fakeSignals.ts';
import { preferenceSettings } from '../preferenceSettings.ts';

const { signal } = createReactiveSystem();

test('settings read a tree of signals, and put it back when cancelled', () => {
  const bucket = {
    joint: signal<string | null>(null),
    axis: { size: signal(3) },
  };
  const settings = preferenceSettings(bucket);
  const opened = settings.read();

  expect(opened).toStrictEqual({ joint: null, axis: { size: 3 } });

  bucket.joint.value = '24/29';
  bucket.axis.size.value = 5;
  settings.restore(opened);

  expect(bucket.joint.value).toBeNull();
  expect(bucket.axis.size.value).toBe(3);
});

test('restoring leaves the signals outside the tree alone', () => {
  const bucket = { volume: signal(250) };
  const outside = signal(1200);
  const settings = preferenceSettings(bucket);
  const opened = settings.read();

  outside.value = 600;
  settings.restore(opened);

  expect(outside.value).toBe(600);
});

test('one restore runs in the batch it is given', () => {
  const bucket = { volume: signal(250), joint: signal('24/29') };
  const batch = vi.fn((callback: () => void) => {
    callback();
  });
  const settings = preferenceSettings(bucket, { batch });
  const opened = settings.read();
  bucket.volume.value = 500;
  settings.restore(opened);

  expect(batch).toHaveBeenCalledOnce();
  expect(bucket.volume.value).toBe(250);
});
