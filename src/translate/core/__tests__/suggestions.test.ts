import { expect, test } from 'vitest';

import type { TranslatedPair } from '../suggestions.ts';
import { messageSimilarity, messageSuggestions } from '../suggestions.ts';

const FRENCH: readonly TranslatedPair[] = [
  { key: 'element.Fe.name', source: 'Iron', target: 'Fer' },
  { key: 'element.Au.name', source: 'Gold', target: 'Or' },
  {
    key: 'property.melting.label',
    source: 'Melting point',
    target: 'Point de fusion',
  },
  { key: 'ui.selection.period', source: 'Period 3', target: 'Période 3' },
  { key: 'ui.card.discoverer', source: 'Discoverer', target: 'Découvreur' },
];

test('the same English translated elsewhere is offered as it stands', () => {
  const [best] = messageSuggestions('Iron', FRENCH);

  expect(best?.kind).toBe('exact');
  expect(best?.message).toBe('Fer');
  expect(best?.score).toBe(1);
  expect(best?.from.key).toBe('element.Fe.name');
});

test('English differing only where the text is not language puts it back', () => {
  const [best] = messageSuggestions('Period 4', FRENCH);

  expect(best?.kind).toBe('pattern');
  expect(best?.message).toBe('Période 4');
  expect(best?.from.key).toBe('ui.selection.period');
});

test('a word that is language is never put back — the translation is only offered', () => {
  const [best] = messageSuggestions('Boiling point', FRENCH);

  expect(best?.kind).toBe('similar');
  expect(best?.message).toBe('Point de fusion');
  // "Boiling point" and "Melting point" differ in four letters of thirteen.
  expect(best?.score).toBeCloseTo(9 / 13, 10);
});

test('English that looks like nothing already translated is offered nothing', () => {
  expect(messageSuggestions('Electronegativity', FRENCH)).toStrictEqual([]);
});

test('an exact match comes before a pattern, and a pattern before a likeness', () => {
  const pairs: readonly TranslatedPair[] = [
    { key: 'a', source: 'Period 4', target: 'Période 4' },
    { key: 'b', source: 'Period 3', target: 'Période 3' },
    { key: 'c', source: 'Period', target: 'Période' },
  ];

  expect(
    messageSuggestions('Period 4', pairs).map((one) => [one.kind, one.message]),
  ).toStrictEqual([
    ['exact', 'Période 4'],
    ['similar', 'Période'],
  ]);
});

test('the same suggestion twice is offered once', () => {
  const pairs: readonly TranslatedPair[] = [
    { key: 'a', source: 'Discoverer', target: 'Découvreur' },
    { key: 'b', source: 'Discoverers', target: 'Découvreur' },
  ];

  expect(messageSuggestions('Discoverer', pairs)).toHaveLength(1);
});

test('rows translated the same way collapse to one offer', () => {
  const pairs: readonly TranslatedPair[] = [
    { key: 'a', source: 'Period 1', target: 'Période 1' },
    { key: 'b', source: 'Period 2', target: 'Période 2' },
    { key: 'c', source: 'Period 3', target: 'Période 3' },
  ];

  expect(
    messageSuggestions('Period 9', pairs).map((one) => one.message),
  ).toStrictEqual(['Période 9']);
});

test('only the best few are offered', () => {
  // The same English in two catalogs, translated differently in each.
  const pairs: readonly TranslatedPair[] = [
    { key: 'a', source: 'Iron', target: 'Fer' },
    { key: 'b', source: 'Iron', target: 'Ferrum' },
    { key: 'c', source: 'Iron', target: 'Ferro' },
  ];

  expect(
    messageSuggestions('Iron', pairs, { limit: 2 }).map((one) => one.message),
  ).toStrictEqual(['Fer', 'Ferrum']);
});

test('a run that appears twice in the translation is not put back', () => {
  const pairs: readonly TranslatedPair[] = [
    { key: 'a', source: 'the 3 of 3', target: 'le 3 de 3' },
  ];
  const [best] = messageSuggestions('the 4 of 4', pairs);

  expect(best?.kind).toBe('similar');
  expect(best?.message).toBe('le 3 de 3');
});

test('a message nobody has translated yet suggests nothing from itself', () => {
  const pairs: readonly TranslatedPair[] = [
    { key: 'a', source: 'Iron', target: '' },
  ];

  expect(messageSuggestions('Iron', pairs)).toStrictEqual([]);
});

test('an empty message asks for nothing', () => {
  expect(messageSuggestions('', FRENCH)).toStrictEqual([]);
});

test('likeness is one where the messages are the same and zero where they share nothing', () => {
  expect(messageSimilarity('Iron', 'Iron')).toBe(1);
  expect(messageSimilarity('', '')).toBe(1);
  expect(messageSimilarity('cat', 'cats')).toBe(0.75);
  expect(messageSimilarity('abc', 'xyz')).toBe(0);
});
