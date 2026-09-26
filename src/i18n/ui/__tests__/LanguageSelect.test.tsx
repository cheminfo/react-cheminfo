import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { LanguageSelect } from '../LanguageSelect.tsx';

function markup(language: string | undefined): string {
  return renderToStaticMarkup(
    <SiteLanguage value={language}>
      <LanguageSelect value="en" onChange={() => undefined} />
    </SiteLanguage>,
  );
}

test('every language names itself, in its own words', () => {
  const html = markup(undefined);

  expect(html).toContain('English');
  expect(html).toContain('Français');
  expect(html).toContain('Deutsch');
  expect(html).toContain('Español');
});

test('the row is named in the language the page declares', () => {
  expect(markup(undefined)).toContain('Language');
  // Only English is part of the page; another language arrives as a chunk, so
  // the first render of a French page is still the English word.
  expect(markup('fr')).toContain('Language');
});

test('only the languages offered are drawn', () => {
  const html = renderToStaticMarkup(
    <LanguageSelect
      value="en"
      languages={['en', 'fr']}
      onChange={() => undefined}
    />,
  );

  expect(html).toContain('Français');
  expect(html).not.toContain('Deutsch');
});
