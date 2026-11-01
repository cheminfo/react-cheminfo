import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ConformerShareNote } from '../ConformerShareNote.tsx';

test('force-field shares are called an ordering, with the factor they are good to', () => {
  const html = renderToStaticMarkup(<ConformerShareNote />);

  expect(html).toContain(
    'Shares at 300 K, from MMFF94 energies alone: no entropy, no solvent. ' +
      'On drug-like molecules MMFF94 is off by 3.6 kcal/mol, which places a ' +
      'share only within a factor of 420: read the column as an ordering.',
  );
  expect(html).toContain('data-testid="conformer-share-note"');
});

test('refined shares quote the GFN2-xTB error instead', () => {
  const html = renderToStaticMarkup(<ConformerShareNote ranking="refined" />);

  expect(html).toContain(
    'Shares at 300 K, from GFN2-xTB energies alone: no entropy, no solvent. ' +
      'GFN2-xTB is typically off by 1.5 kcal/mol, which places a share within ' +
      'a factor of 12.',
  );
});

test('the temperature the table uses is the one the note quotes', () => {
  const html = renderToStaticMarkup(<ConformerShareNote temperature={600} />);

  expect(html).toContain('Shares at 600 K');
  expect(html).toContain('within a factor of 20:');
});
