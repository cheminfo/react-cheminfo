import type { ReactElement } from 'react';

import type { HeaderToggleOption } from '../../chrome/ui/HeaderToggle.tsx';
import { HeaderToggle } from '../../chrome/ui/HeaderToggle.tsx';
import type { Language } from '../core/languages.ts';
import { LANGUAGES, LANGUAGE_LABELS } from '../core/languages.ts';

import { useChromeT } from './useT.ts';

/** Props of {@link LanguageSelect}. */
export interface LanguageSelectProps {
  /** The language the site is written in. */
  value: Language;
  /** Called with the language picked. */
  onChange: (language: Language) => void;
  /**
   * The languages on offer, for a site that is not written in all four yet.
   * @default LANGUAGES
   */
  languages?: readonly Language[];
  /**
   * Whether the bar has run out of room, so the row collapses to the language
   * in force and a click advances to the next.
   * @default false
   */
  compact?: boolean;
  /**
   * `data-testid` of the row; each button carries it suffixed by its tag.
   * @default 'language-select'
   */
  testId?: string;
}

/**
 * The language switch of the site header: the tags themselves, the one in
 * force pressed.
 *
 * A language names itself — `FR` in the bar, `Français` behind it — because a
 * reader looking for their own language would have to know English to find it
 * written any other way.
 * @param props - See {@link LanguageSelectProps}.
 * @returns The row.
 */
export function LanguageSelect(props: LanguageSelectProps): ReactElement {
  const {
    value,
    onChange,
    languages = LANGUAGES,
    compact = false,
    testId = 'language-select',
  } = props;
  const t = useChromeT();

  return (
    <HeaderToggle
      label={t('language.label')}
      options={languages.map(toOption)}
      value={value}
      onChange={onChange}
      compact={compact}
      testId={testId}
    />
  );
}

function toOption(language: Language): HeaderToggleOption<Language> {
  return {
    value: language,
    label: language.toUpperCase(),
    title: LANGUAGE_LABELS[language],
  };
}
