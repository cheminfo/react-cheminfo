import { expect, test } from 'vitest';

import { contactFormUrl, contactUrl } from '../contactUrl.ts';

const TEMPLATE =
  'https://docs.google.com/forms/d/e/FORM/viewform?usp=pp_url&entry.1={site}&entry.2={page}';

test('the site and the page are written into the form address, encoded', () => {
  expect(
    contactUrl(TEMPLATE, {
      site: 'equilibrium',
      page: 'https://equilibrium.cheminfo.org/titration?acid=HCl&base=NaOH',
    }),
  ).toBe(
    'https://docs.google.com/forms/d/e/FORM/viewform?usp=pp_url&entry.1=equilibrium&entry.2=https%3A%2F%2Fequilibrium.cheminfo.org%2Ftitration%3Facid%3DHCl%26base%3DNaOH',
  );
});

test('a missing page leaves its field empty', () => {
  expect(contactUrl(TEMPLATE, { site: 'surge' })).toBe(
    'https://docs.google.com/forms/d/e/FORM/viewform?usp=pp_url&entry.1=surge&entry.2=',
  );
});

test('a template without placeholders is returned unchanged', () => {
  expect(
    contactUrl('https://example.org/contact', { site: 'surge', page: '/x' }),
  ).toBe('https://example.org/contact');
});

test('the form is the one in the language of the page, or else the English one', () => {
  const urls = {
    en: 'https://forms.example.org/en',
    fr: 'https://forms.example.org/fr',
  };

  expect(contactFormUrl('fr', urls)).toBe('https://forms.example.org/fr');
  expect(contactFormUrl('es', urls)).toBe('https://forms.example.org/en');
  expect(contactFormUrl('de', {})).toBe('');
});
