import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SourceBadge } from '../SourceBadge.tsx';

test('a source holding an entry links to it, in its colour and with its logo', () => {
  const html = renderToStaticMarkup(
    <SourceBadge
      name="ChEBI"
      color="#18974c"
      logo="https://molecules.cheminfo.org/v1/sources/chebi/logo.svg"
      identifier="CHEBI:15377"
      href="https://www.ebi.ac.uk/chebi/CHEBI:15377"
    />,
  );

  // React's server renderer adds a preload of the logo before the badge.
  expect(html).toContain(
    '<a class="source-badge" style="--source:#18974c" href="https://www.ebi.ac.uk/chebi/CHEBI:15377" target="_blank" rel="noopener noreferrer" title="ChEBI CHEBI:15377">' +
      '<span class="source-badge__logo"><img src="https://molecules.cheminfo.org/v1/sources/chebi/logo.svg" alt=""/></span>' +
      '<span class="source-badge__name">ChEBI</span>' +
      '<span class="source-badge__id">CHEBI:15377</span></a>',
  );
});

test('a compact badge keeps the identifier for its tooltip, and counts the entries', () => {
  const html = renderToStaticMarkup(
    <SourceBadge
      name="COCONUT"
      color="#a07050"
      identifier="CNP0000001"
      count={3}
      compact
    />,
  );

  expect(html).toBe(
    '<span class="source-badge source-badge--compact" style="--source:#a07050" title="COCONUT CNP0000001">' +
      '<span class="source-badge__name">COCONUT</span>' +
      '<span class="source-badge__count">3</span></span>',
  );
});

test('a source with no look is neutral, and one with a null colour is the site', () => {
  expect(renderToStaticMarkup(<SourceBadge name="KEGG" />)).toBe(
    '<span class="source-badge source-badge--neutral" title="KEGG"><span class="source-badge__name">KEGG</span></span>',
  );
  expect(
    renderToStaticMarkup(
      <SourceBadge name="web" label="added here" color={null} />,
    ),
  ).toBe(
    '<span class="source-badge" title="web"><span class="source-badge__name">added here</span></span>',
  );
});
