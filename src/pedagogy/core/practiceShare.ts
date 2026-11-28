/**
 * The parts and the presets of the share dialog of a page of exercises, which
 * every such site wrote out word for word: the keys are the ones
 * `<PracticePage>` and `<QuestionCard>` hide, and the words are the chrome's,
 * in the page's language.
 */

import { CHROME_CATALOG } from '../../i18n/core/chromeCatalog.ts';
import type { Language } from '../../i18n/core/languages.ts';
import { DEFAULT_LANGUAGE } from '../../i18n/core/languages.ts';
import { catalogTranslate } from '../../i18n/core/translate.ts';
import type { SharePreset } from '../../share/core/presets.ts';
import type { HideablePart } from '../../share/core/vocabulary.ts';

/** A part whose key is known, so a site's `HideKey` type stays exact. */
export type KeyedPart<TKey extends string> = HideablePart & { key: TKey };

/** The three parts of a `<PracticePage>`, in the order a vocabulary lists them. */
export type PracticeShareParts = readonly [
  KeyedPart<'playground'>,
  KeyedPart<'exercises'>,
  KeyedPart<'solutions'>,
];

/** What {@link practiceShareParts} and {@link practiceSharePresets} are given. */
export interface PracticeShareOptions {
  /**
   * The language of the words.
   * @default 'en'
   */
  language?: Language;
  /**
   * What hiding the calculator removes, for a calculator that does something
   * else than work out a formula (`Hiding it removes the box that reads any
   * nuclide typed into it, leaving the questions alone.`).
   * @default the chrome's sentence about a formula
   */
  calculatorDescription?: string;
  /**
   * What the Calculator preset hands out, for the same calculator.
   * @default the chrome's sentence about a formula
   */
  calculatorPreset?: string;
  /**
   * Whether the dialog opens with the calculator switched off, because it
   * answers the questions.
   * @default false
   */
  calculatorHiddenByDefault?: boolean;
  /**
   * Whether a Test preset is offered: the series without its solutions.
   * @default false
   */
  test?: boolean;
}

/**
 * The playground, exercises and solutions parts of a page of exercises.
 * @param options - The language and what the site's calculator does.
 * @returns The three parts, to spread into the site's vocabulary.
 */
export function practiceShareParts(
  options: PracticeShareOptions = {},
): PracticeShareParts {
  const t = catalogTranslate(
    CHROME_CATALOG,
    options.language ?? DEFAULT_LANGUAGE,
  );
  const playground: KeyedPart<'playground'> = {
    key: 'playground',
    label: t('practice.share.playground'),
    description:
      options.calculatorDescription ?? t('practice.share.playground.what'),
  };
  if (options.calculatorHiddenByDefault === true) {
    playground.hiddenByDefault = true;
  }
  return [
    playground,
    {
      key: 'exercises',
      label: t('practice.share.exercises'),
      description: t('practice.share.exercises.what'),
    },
    {
      key: 'solutions',
      label: t('practice.share.solutions'),
      description: t('practice.share.solutions.what'),
    },
  ];
}

/**
 * The ways a page of exercises is usually framed: the questions alone, the
 * series without its solutions when asked for, and the calculator alone.
 * @param options - The language, what the calculator does, and whether a Test
 * preset is offered.
 * @returns The presets, in the order the dialog shows them.
 */
export function practiceSharePresets(
  options: PracticeShareOptions = {},
): SharePreset[] {
  const t = catalogTranslate(
    CHROME_CATALOG,
    options.language ?? DEFAULT_LANGUAGE,
  );
  const presets: SharePreset[] = [
    {
      key: 'questions',
      label: t('practice.share.preset.questions'),
      description: t('practice.share.preset.questions.what'),
      hidden: ['playground'],
    },
  ];
  if (options.test === true) {
    presets.push({
      key: 'test',
      label: t('practice.share.preset.test'),
      description: t('practice.share.preset.test.what'),
      hidden: ['playground', 'solutions'],
    });
  }
  presets.push({
    key: 'calculator',
    label: t('practice.share.preset.calculator'),
    description:
      options.calculatorPreset ?? t('practice.share.preset.calculator.what'),
    hidden: ['exercises'],
  });
  return presets;
}

/** The three parts of a series of exercises listed beside the one on screen. */
export type SeriesShareParts = readonly [
  KeyedPart<'list'>,
  KeyedPart<'hints'>,
  KeyedPart<'solution'>,
];

/**
 * The list, hints and solution parts of a series whose exercises are listed
 * beside the one on screen.
 * @param language - The language of the words.
 * @returns The three parts, to spread into the site's vocabulary.
 */
export function seriesShareParts(
  language: Language = DEFAULT_LANGUAGE,
): SeriesShareParts {
  const t = catalogTranslate(CHROME_CATALOG, language);
  return [
    {
      key: 'list',
      label: t('practice.share.list'),
      description: t('practice.share.list.what'),
    },
    {
      key: 'hints',
      label: t('practice.share.hints'),
      description: t('practice.share.hints.what'),
    },
    {
      key: 'solution',
      label: t('practice.share.solutions.one'),
      description: t('practice.share.solutions.what'),
    },
  ];
}
