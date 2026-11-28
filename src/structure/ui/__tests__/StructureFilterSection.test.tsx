import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { StructureFilterSection } from '../StructureFilterSection.tsx';

test('nothing drawn offers to draw a structure', () => {
  const html = renderToStaticMarkup(
    <StructureFilterSection
      idCode=""
      onOpen={() => undefined}
      onClear={() => undefined}
    >
      <input aria-label="SMILES" />
    </StructureFilterSection>,
  );

  expect(html).toContain('data-testid="structure-filter"');
  expect(html).toContain(
    '<span class="filter-column__legend">Structure</span>',
  );
  expect(html).toContain('Draw a structure');
  expect(html).not.toContain('structure-filter__preview');
  expect(html).not.toContain('>Clear<');
  expect(html).toContain('aria-label="SMILES"');
});

test('a drawn structure is shown, with the site’s controls, Edit and Clear', () => {
  const html = renderToStaticMarkup(
    <StructureFilterSection
      idCode="gFp@DiTt@@@"
      onOpen={() => undefined}
      onClear={() => undefined}
      actions={<select aria-label="Mode" />}
      status={<p>12 matches</p>}
      previewHeight={130}
    />,
  );

  expect(html).toContain('title="Edit the structure"');
  expect(html).toContain('aria-label="Mode"');
  expect(html).toContain('>Edit<');
  expect(html).toContain('>Clear<');
  expect(html).toContain('<p>12 matches</p>');
  expect(html).not.toContain('Draw a structure');
});

test('a section with no Clear offers only Edit', () => {
  const html = renderToStaticMarkup(
    <StructureFilterSection idCode="gFp@DiTt@@@" onOpen={() => undefined} />,
  );

  expect(html).toContain('>Edit<');
  expect(html).not.toContain('>Clear<');
});
