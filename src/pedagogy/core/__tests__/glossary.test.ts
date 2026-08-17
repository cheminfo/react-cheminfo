import { expect, test } from 'vitest';

import type { Glossary } from '../glossary.ts';
import { lookupGlossaryTerm, parseGlossaryMarkers } from '../glossary.ts';

const GLOSSARY: Glossary = {
  orbital: {
    title: 'Orbital',
    summary: 'A one-electron wavefunction.',
    examples: [{ code: '1s', note: 'the lowest one' }],
  },
  'atomic orbital': {
    title: 'Atomic orbital (AO)',
    summary: 'An orbital of one atom.',
    examples: [{ code: '2p', input: 'carbon' }],
  },
};

test('prose without a marker is one segment', () => {
  expect(parseGlossaryMarkers('Two lobes, opposite phase.')).toStrictEqual([
    { kind: 'text', start: 0, text: 'Two lobes, opposite phase.' },
  ]);
});

test('an empty string has no segments', () => {
  expect(parseGlossaryMarkers('')).toStrictEqual([]);
});

test('a marker at the start leaves no empty run before it', () => {
  expect(parseGlossaryMarkers('[[orbital]] of methane')).toStrictEqual([
    { kind: 'term', start: 0, term: 'orbital', text: 'orbital' },
    { kind: 'text', start: 11, text: ' of methane' },
  ]);
});

test('a marker at the end leaves no empty run after it', () => {
  expect(parseGlossaryMarkers('methane has an [[orbital]]')).toStrictEqual([
    { kind: 'text', start: 0, text: 'methane has an ' },
    { kind: 'term', start: 15, term: 'orbital', text: 'orbital' },
  ]);
});

test('adjacent markers produce no empty run between them', () => {
  expect(parseGlossaryMarkers('[[sigma bond]][[pi bond]]')).toStrictEqual([
    { kind: 'term', start: 0, term: 'sigma bond', text: 'sigma bond' },
    { kind: 'term', start: 14, term: 'pi bond', text: 'pi bond' },
  ]);
});

test('the pipe form keeps the term and shows the written text', () => {
  expect(
    parseGlossaryMarkers('the [[atomic orbital|2p orbitals]] of carbon'),
  ).toStrictEqual([
    { kind: 'text', start: 0, text: 'the ' },
    { kind: 'term', start: 4, term: 'atomic orbital', text: '2p orbitals' },
    { kind: 'text', start: 34, text: ' of carbon' },
  ]);
});

test('an empty display text falls back to the term', () => {
  expect(parseGlossaryMarkers('[[orbital|]]')).toStrictEqual([
    { kind: 'term', start: 0, term: 'orbital', text: 'orbital' },
  ]);
});

test('the term is lowercased while the displayed text keeps its case', () => {
  expect(parseGlossaryMarkers('[[Hückel]] theory')).toStrictEqual([
    { kind: 'term', start: 0, term: 'hückel', text: 'Hückel' },
    { kind: 'text', start: 10, text: ' theory' },
  ]);
});

test('an unknown term is still a term segment, and resolves to nothing', () => {
  expect(parseGlossaryMarkers('a [[flux capacitor]] here')).toStrictEqual([
    { kind: 'text', start: 0, text: 'a ' },
    { kind: 'term', start: 2, term: 'flux capacitor', text: 'flux capacitor' },
    { kind: 'text', start: 20, text: ' here' },
  ]);
  expect(lookupGlossaryTerm(GLOSSARY, 'flux capacitor')).toBeUndefined();
});

test('an unclosed marker is returned verbatim, brackets included', () => {
  expect(parseGlossaryMarkers('see [[orbital and stop')).toStrictEqual([
    { kind: 'text', start: 0, text: 'see [[orbital and stop' },
  ]);
});

test('a stray opening pair is swallowed by the next closing pair', () => {
  // `[^\]]+` accepts `[`, so the marker starts at the first `[[` and the term
  // it yields is unknown — which renders as plain text, never as brackets.
  expect(parseGlossaryMarkers('[[a [[orbital]]')).toStrictEqual([
    { kind: 'term', start: 0, term: 'a [[orbital', text: 'a [[orbital' },
  ]);
  expect(lookupGlossaryTerm(GLOSSARY, 'a [[orbital')).toBeUndefined();
});

test('surrounding spaces inside a marker are trimmed off both halves', () => {
  expect(parseGlossaryMarkers('[[ Atomic Orbital | 2p ]]')).toStrictEqual([
    { kind: 'term', start: 0, term: 'atomic orbital', text: '2p' },
  ]);
});

test('parsing twice gives the same segments — no shared lastIndex', () => {
  const text = 'an [[orbital]] and another [[orbital]]';

  expect(parseGlossaryMarkers(text)).toStrictEqual(parseGlossaryMarkers(text));
});

test('lookup is case-insensitive and trims the term', () => {
  const entry = lookupGlossaryTerm(GLOSSARY, 'orbital');

  expect(entry?.title).toBe('Orbital');
  expect(lookupGlossaryTerm(GLOSSARY, '  ORBITAL ')).toStrictEqual(entry);
  expect(lookupGlossaryTerm(GLOSSARY, 'Atomic Orbital')?.title).toBe(
    'Atomic orbital (AO)',
  );
});

test('a term the glossary never defines resolves to nothing', () => {
  expect(lookupGlossaryTerm({}, 'orbital')).toBeUndefined();
  expect(lookupGlossaryTerm(GLOSSARY, '')).toBeUndefined();
});

test('a term naming an inherited member resolves to nothing', () => {
  expect(lookupGlossaryTerm(GLOSSARY, 'constructor')).toBeUndefined();
  expect(lookupGlossaryTerm(GLOSSARY, 'toString')).toBeUndefined();
});
