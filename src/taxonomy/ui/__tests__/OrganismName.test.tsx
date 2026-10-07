import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { OrganismName } from '../OrganismName.tsx';

test('the genus and the epithets are italic, the authority upright', () => {
  expect(
    renderToStaticMarkup(
      <OrganismName name="Astilbe odontophylla Miq. var. congesta" />,
    ),
  ).toBe(
    '<span class="organism-name"><i>Astilbe odontophylla</i> Miq. var. <i>congesta</i></span>',
  );
});

test('a strain after sp. stays upright, and the text is escaped', () => {
  expect(
    renderToStaticMarkup(
      <OrganismName name="Streptomyces sp. <CHQ-64>" className="cell" />,
    ),
  ).toBe(
    '<span class="organism-name cell"><i>Streptomyces</i> sp. &lt;CHQ-64&gt;</span>',
  );
});

test('a name ranked above the genus is upright whatever its shape', () => {
  expect(
    renderToStaticMarkup(<OrganismName name="Aspergillaceae" rank="family" />),
  ).toBe('<span class="organism-name">Aspergillaceae</span>');
  expect(
    renderToStaticMarkup(<OrganismName name="Embryophyta" rank="clade" />),
  ).toBe('<span class="organism-name"><i>Embryophyta</i></span>');
});
