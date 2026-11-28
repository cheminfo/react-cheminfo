import { expect, test } from 'vitest';

import {
  practiceShareParts,
  practiceSharePresets,
  seriesShareParts,
} from '../practiceShare.ts';

test('a page of exercises shares its calculator, questions and solutions', () => {
  expect(practiceShareParts()).toStrictEqual([
    {
      key: 'playground',
      label: 'Calculator',
      description:
        'Hiding it removes the box that works out any formula typed into it, leaving the questions alone.',
    },
    {
      key: 'exercises',
      label: 'Questions',
      description:
        'Hiding it removes the graded series, leaving the calculator alone.',
    },
    {
      key: 'solutions',
      label: 'Solutions',
      description:
        'Hiding it removes the Reveal solution button; the hints stay.',
    },
  ]);
});

test('a calculator that reads something else says so, and may start hidden', () => {
  const [playground] = practiceShareParts({
    calculatorDescription:
      'Hiding it removes the box that reads any nuclide typed into it, leaving the questions alone.',
    calculatorHiddenByDefault: true,
  });

  expect(playground).toStrictEqual({
    key: 'playground',
    label: 'Calculator',
    description:
      'Hiding it removes the box that reads any nuclide typed into it, leaving the questions alone.',
    hiddenByDefault: true,
  });
});

test('the presets are the questions alone and the calculator alone', () => {
  expect(practiceSharePresets()).toStrictEqual([
    {
      key: 'questions',
      label: 'Questions',
      description:
        'The graded series alone, framed: the one the link names, for every student who opens it.',
      hidden: ['playground'],
    },
    {
      key: 'calculator',
      label: 'Calculator',
      description:
        'The calculator alone, framed: any formula typed in is worked out step by step.',
      hidden: ['exercises'],
    },
  ]);
});

test('a Test preset drops the solutions, between the two others', () => {
  const presets = practiceSharePresets({
    test: true,
    calculatorPreset:
      'The calculator alone, framed: any nuclide typed in is read off the shell model.',
  });

  expect(presets.map(({ key }) => key)).toStrictEqual([
    'questions',
    'test',
    'calculator',
  ]);
  expect(presets[1]).toStrictEqual({
    key: 'test',
    label: 'Test',
    description:
      'The series alone, without its solutions: the hints stay, the answers do not.',
    hidden: ['playground', 'solutions'],
  });
  expect(presets[2]?.description).toBe(
    'The calculator alone, framed: any nuclide typed in is read off the shell model.',
  );
});

test('a listed series shares its list, hints and solution', () => {
  expect(seriesShareParts()).toStrictEqual([
    {
      key: 'list',
      label: 'List of exercises',
      description:
        'Hiding it leaves the one exercise the link names, with nothing to move on to.',
    },
    {
      key: 'hints',
      label: 'Hints',
      description: 'Hiding it removes the hint ladder; the solution stays.',
    },
    {
      key: 'solution',
      label: 'Solution',
      description:
        'Hiding it removes the Reveal solution button; the hints stay.',
    },
  ]);
});
