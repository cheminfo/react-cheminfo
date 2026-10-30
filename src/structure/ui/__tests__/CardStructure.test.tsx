import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CardStructure } from '../CardStructure.tsx';

test('a structure carries the glyph that hands it over, beside its corner', () => {
  const html = renderToStaticMarkup(
    <CardStructure smiles="CCO" name="ethanol" width={120} height={90} />,
  );

  expect(html).toMatch(/^<div class="card-figure card-structure">/);
  expect(html).toContain('class="card-figure__drawing"');
  expect(html).toContain('data-testid="figure-tools"');
  expect(html).toContain(
    'aria-label="Copy or save the structure: SMILES, molfile"',
  );
  expect(html).toContain('data-testid="card-structure"');
  // The drawing loads lazily into a box of the size asked for.
  expect(html).toContain('width:120px');
  expect(html).toContain('height:90px');
});

test('a drawing of the site’s own is kept, and the glyph still reads the notations', () => {
  const html = renderToStaticMarkup(
    <CardStructure idCode="gC`@Dij@@" label="Export the fragment" fragment>
      <svg data-testid="own-drawing" />
    </CardStructure>,
  );

  expect(html).toContain('<svg data-testid="own-drawing"></svg>');
  expect(html).toContain('aria-label="Export the fragment"');
});

test('nothing to read is the placeholder alone, with no glyph', () => {
  const html = renderToStaticMarkup(
    <CardStructure molfile="" fallback="no structure" />,
  );

  expect(html).toContain('no structure');
  expect(html).not.toContain('card-figure');
  expect(html).not.toContain('aria-haspopup');
});
