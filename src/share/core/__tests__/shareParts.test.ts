import { expect, test } from 'vitest';

import { integerParam } from '../params.ts';
import { createHiddenParts, pickShareParts } from '../shareParts.ts';
import { signalPreference } from '../signalPreference.ts';
import type { HideablePart } from '../vocabulary.ts';

const PART_IDS = ['tabs', 'breakdown', 'valences'] as const;
type PartId = (typeof PART_IDS)[number];

const PARTS: Record<PartId, HideablePart> = {
  tabs: { key: 'tabs', label: 'Tabs', description: 'The tab bar.' },
  breakdown: {
    key: 'breakdown',
    label: 'Breakdown',
    description: 'The count.',
  },
  valences: { key: 'valences', label: 'Valences', description: 'The table.' },
};

const hidden = createHiddenParts(PART_IDS, PARTS);

test('an absent parameter hides nothing', () => {
  expect(hidden.parseHidden(undefined)).toStrictEqual([]);
  expect(hidden.parseHidden('')).toStrictEqual([]);
  expect(hidden.serializeHidden([])).toBe('');
});

test('a name the site does not know is dropped, not kept', () => {
  expect(hidden.parseHidden('breakdown,sidebar,valences')).toStrictEqual([
    'breakdown',
    'valences',
  ]);
  expect(hidden.parseHidden('header')).toStrictEqual([]);
  expect(hidden.isPartId('breakdown')).toBe(true);
  expect(hidden.isPartId('sidebar')).toBe(false);
});

test('one selection is always written as one link, in the site’s order', () => {
  expect(hidden.parseHidden('valences, breakdown ,tabs')).toStrictEqual([
    'tabs',
    'breakdown',
    'valences',
  ]);
  expect(hidden.serializeHidden(['valences', 'tabs', 'breakdown'])).toBe(
    'tabs,breakdown,valences',
  );
});

test('a page offers the parts it names, in the vocabulary’s order', () => {
  const vocabulary = { parts: [PARTS.tabs, PARTS.breakdown, PARTS.valences] };

  expect(
    pickShareParts(vocabulary, ['valences', 'tabs', 'gone']),
  ).toStrictEqual([PARTS.tabs, PARTS.valences]);
  expect(pickShareParts(vocabulary, [])).toStrictEqual([]);
});

test('a preference kept in a signal is read from it and written to it', () => {
  const cell = { value: 10 };
  const count = signalPreference(
    integerParam({ min: 1, max: 200, default: 10 }),
    cell,
  );
  count.set(25);

  expect(cell.value).toBe(25);
  expect(count.get()).toBe(25);

  const written: number[] = [];
  const zoom = signalPreference(
    integerParam({ min: 1, max: 4, default: 1 }),
    cell,
    (value) => written.push(value),
  );
  zoom.set(3);

  expect(written).toStrictEqual([3]);
  expect(cell.value).toBe(25);
});
