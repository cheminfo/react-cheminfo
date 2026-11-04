import { expect, test } from 'vitest';

import {
  fitSignalBucket,
  hydrateSignalBucket,
  snapshotSignalBucket,
} from '../signalBucket.ts';

import { createReactiveSystem } from './fakeSignals.ts';

function bucketOf() {
  const { signal } = createReactiveSystem();
  return {
    resolution: signal(600),
    panels: signal(['structure']),
    style: signal({ bondLength: 14.4, font: 'Arial' }),
    glassware: { joint: signal<string | null>(null), setups: signal(true) },
    label: 'not a leaf',
  };
}

test('a snapshot mirrors the tree, leaving out what is not a signal', () => {
  expect(snapshotSignalBucket(bucketOf())).toStrictEqual({
    resolution: 600,
    panels: ['structure'],
    style: { bondLength: 14.4, font: 'Arial' },
    glassware: { joint: null, setups: true },
  });
});

test('hydrating writes the leaves named and leaves the others alone', () => {
  const bucket = bucketOf();

  hydrateSignalBucket(bucket, {
    resolution: 300,
    glassware: { setups: false },
    unknown: 1,
  });

  expect(snapshotSignalBucket(bucket)).toStrictEqual({
    resolution: 300,
    panels: ['structure'],
    style: { bondLength: 14.4, font: 'Arial' },
    glassware: { joint: null, setups: false },
  });
});

test('fitting gives every leaf a value of its shape, and nothing else', () => {
  const bucket = bucketOf();

  const fitted = fitSignalBucket(bucket, {
    resolution: 'high',
    panels: ['glassware', 'tlc'],
    style: { font: 'Helvetica' },
    glassware: { joint: '14/23' },
    retired: true,
  });

  expect(fitted).toStrictEqual({
    resolution: 600,
    panels: ['glassware', 'tlc'],
    style: { bondLength: 14.4, font: 'Helvetica' },
    glassware: { joint: '14/23', setups: true },
  });
});

test('fitting falls back to the values given rather than to the leaves', () => {
  const bucket = bucketOf();
  bucket.resolution.value = 150;

  const fitted = fitSignalBucket(bucket, undefined, {
    resolution: 600,
    panels: [],
    style: { bondLength: 10, font: 'Arial' },
    glassware: { joint: null, setups: false },
  });

  expect(fitted).toStrictEqual({
    resolution: 600,
    panels: [],
    style: { bondLength: 10, font: 'Arial' },
    glassware: { joint: null, setups: false },
  });
});
