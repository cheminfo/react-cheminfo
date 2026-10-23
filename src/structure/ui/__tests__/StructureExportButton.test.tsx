import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { StructureExportButton } from '../StructureExportButton.tsx';

test('the glyph names what it hands over, and its dialog waits closed', () => {
  const html = renderToStaticMarkup(
    <StructureExportButton smiles="CCO" name="ethanol" />,
  );

  expect(html).toContain(
    'aria-label="Copy or save the structure: SMILES, molfile"',
  );
  expect(html).toContain('aria-haspopup="menu"');
  expect(html).toContain('aria-expanded="false"');
  expect(html).toContain('data-testid="card-structure"');
  expect(html).toContain('bp6-icon-export');
  // A closed dialog renders nothing, so no notation is written yet.
  expect(html).not.toContain('structure-export');
});

test('a label and a test id of its own', () => {
  const html = renderToStaticMarkup(
    <StructureExportButton
      idCode="gC`@Dij@@"
      label="The structure as a molfile, an idCode or a picture"
      testId="export-ethanol"
    />,
  );

  expect(html).toContain(
    'aria-label="The structure as a molfile, an idCode or a picture"',
  );
  expect(html).toContain('data-testid="export-ethanol"');
});
