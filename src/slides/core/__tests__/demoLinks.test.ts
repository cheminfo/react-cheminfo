import { expect, test } from 'vitest';

import { demoLabel, parseSingleLink, splitDemoLinks } from '../demoLinks.ts';

test('reads a plain link', () => {
  expect(
    parseSingleLink('[Try 300.123](/mf-finder?targetMass=300.123)'),
  ).toStrictEqual({
    label: 'Try 300.123',
    href: '/mf-finder?targetMass=300.123',
  });
});

test('a label may close its own brackets', () => {
  expect(
    parseSingleLink('[Demo: [M+H]⁺ of caffeine](/mf?mf=C8H10N4O2)'),
  ).toStrictEqual({
    label: 'Demo: [M+H]⁺ of caffeine',
    href: '/mf?mf=C8H10N4O2',
  });
});

test('a URL may hold balanced parentheses', () => {
  expect(parseSingleLink('[PEG](/?mf=H(OCH2CH2)10OH)')).toStrictEqual({
    label: 'PEG',
    href: '/?mf=H(OCH2CH2)10OH',
  });
});

test('the angle-bracket form takes the URL as written', () => {
  expect(parseSingleLink('[PEG](</?mf=H(OCH2CH2)10>)')).toStrictEqual({
    label: 'PEG',
    href: '/?mf=H(OCH2CH2)10',
  });
});

test('an unclosed angle-bracket URL is not a link', () => {
  expect(parseSingleLink('[PEG](</?mf=H)')).toBeNull();
});

test('a paragraph that is more than the link is not a link', () => {
  expect(parseSingleLink('See [PEG](/?mf=H2O)')).toBeNull();
  expect(parseSingleLink('[PEG](/?mf=H2O) — try it')).toBeNull();
});

test('an unclosed label or URL is not a link', () => {
  expect(parseSingleLink('[PEG(/?mf=H2O)')).toBeNull();
  expect(parseSingleLink('[PEG](/?mf=H2O')).toBeNull();
});

test('the trailing run of internal links leaves the body', () => {
  const { body, demos } = splitDemoLinks(
    '## Mass\n\n- one\n\n[Demo: A](/a)\n\n[Demo: B](/b?x=1)',
  );

  expect(body).toBe('## Mass\n\n- one');
  expect(demos).toStrictEqual([
    { label: 'Demo: A', href: '/a' },
    { label: 'Demo: B', href: '/b?x=1' },
  ]);
});

test('an external link stays in the body', () => {
  const { body, demos } = splitDemoLinks(
    '## Mass\n\n[Spec](https://example.org)',
  );

  expect(body).toBe('## Mass\n\n[Spec](https://example.org)');
  expect(demos).toStrictEqual([]);
});

test('a link above a paragraph is body, not a demo', () => {
  const { body, demos } = splitDemoLinks('[Demo: A](/a)\n\nthen a sentence');

  expect(body).toBe('[Demo: A](/a)\n\nthen a sentence');
  expect(demos).toStrictEqual([]);
});

test('a body that is nothing but demo links leaves an empty body', () => {
  expect(splitDemoLinks('[Demo: A](/a)')).toStrictEqual({
    body: '',
    demos: [{ label: 'Demo: A', href: '/a' }],
  });
});

test('the Demo prefix is dropped and the first letter uppercased', () => {
  expect(demoLabel('Demo: caffeine C8H10N4O2')).toBe('Caffeine C8H10N4O2');
  expect(demoLabel('Demo: the tripeptide HAlaGlyProOH')).toBe(
    'The tripeptide HAlaGlyProOH',
  );
});

test('a label that is already uppercase is left alone', () => {
  expect(demoLabel('Demo: C{80,20}10')).toBe('C{80,20}10');
});

test('a label without the prefix is still uppercased', () => {
  expect(demoLabel('formula finder')).toBe('Formula finder');
});

test('an empty label stays empty', () => {
  expect(demoLabel('')).toBe('');
});
