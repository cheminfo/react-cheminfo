import { expect, test } from 'vitest';

import { parseSectionHeading } from '../sectionHeading.ts';

test('reads a colon-separated heading and keeps the rest', () => {
  expect(
    parseSectionHeading(
      '# 1: MF → isotopic distribution\n\n## Super generic\n\nBut… learn the syntax',
    ),
  ).toStrictEqual({
    number: '1',
    title: 'MF → isotopic distribution',
    rest: '## Super generic\n\nBut… learn the syntax',
  });
});

test('every accepted separator splits number from title', () => {
  for (const separator of ['·', '.', ':', '—', '-']) {
    expect(parseSectionHeading(`# 4 ${separator} OctoChemDB`)).toStrictEqual({
      number: '4',
      title: 'OctoChemDB',
      rest: '',
    });
  }
});

test('an unnumbered heading stays in the body', () => {
  expect(parseSectionHeading('# Thank you\n\nQuestions?')).toStrictEqual({
    number: '',
    title: '',
    rest: '# Thank you\n\nQuestions?',
  });
});

test('an empty body parses to three empty strings', () => {
  expect(parseSectionHeading('')).toStrictEqual({
    number: '',
    title: '',
    rest: '',
  });
});
