import { enumParam, integerParam, stringParam } from '../params.ts';
import type { ShareVocabulary } from '../vocabulary.ts';

/** The largest series a link may ask for, so an embed cannot hang the page. */
export const MAX_EXERCISE_COUNT = 100;

const PARAMS = {
  count: integerParam({ min: 1, max: MAX_EXERCISE_COUNT, default: null }),
  zoom: integerParam({ min: 1, max: 3, default: 2 }),
  level: enumParam(['easy', 'hard'] as const, 'easy'),
  set: stringParam({ maxLength: 8 }),
};

/** A vocabulary with the four shapes a real site puts in one: parts and three kinds of parameter. */
export const VOCABULARY: ShareVocabulary<typeof PARAMS> = {
  parts: [
    { key: 'menu', label: 'The menu', description: 'The tab strip.' },
    {
      key: 'examples',
      label: 'Examples',
      description: 'The ready-to-load formulas.',
    },
    {
      key: 'hints',
      label: 'Hints',
      description: 'The hint ladder, one rung at a time.',
      hiddenByDefault: true,
    },
    {
      key: 'answers',
      label: 'Reveal the answer',
      description: 'The correction.',
    },
  ],
  params: PARAMS,
};

/** A vocabulary of parts alone, as a tool with nothing of its own to carry has. */
export const BARE_VOCABULARY: ShareVocabulary = {
  parts: [
    { key: 'menu', label: 'The menu', description: 'The tab strip.' },
    { key: 'about', label: 'About', description: 'The About page link.' },
  ],
};
