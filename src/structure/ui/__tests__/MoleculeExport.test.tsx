import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { MoleculeExport } from '../MoleculeExport.tsx';

async function* nothing() {
  // No page is read until somebody asks for a file.
}

test('it says how many a file holds at most, while the matches are not counted', () => {
  const html = renderToStaticMarkup(
    <MoleculeExport read={nothing} fileName="matches" />,
  );

  expect(html).toContain('Export up to 10,000');
  expect(html).toContain('>SDF<');
  expect(html).toContain('>TXT<');
  expect(html).not.toContain('disabled');
});

test('it says the same when more match than a file holds', () => {
  const html = renderToStaticMarkup(
    <MoleculeExport read={nothing} fileName="matches" total={10_001} />,
  );

  expect(html).toContain('Export up to 10,000');
});

test('every match fits, so no cap is mentioned', () => {
  const html = renderToStaticMarkup(
    <MoleculeExport read={nothing} fileName="matches" total={10_000} />,
  );

  expect(html).toContain('>Export<');
  expect(html).not.toContain('up to');
});

test('a smaller limit is the one it names', () => {
  const html = renderToStaticMarkup(
    <MoleculeExport read={nothing} fileName="matches" limit={500} />,
  );

  expect(html).toContain('Export up to 500');
});

test('nothing to save cannot be asked for', () => {
  const html = renderToStaticMarkup(
    <MoleculeExport read={nothing} fileName="matches" total={0} />,
  );

  expect(html.match(/disabled=""/g)).toHaveLength(2);
});

test('the control stays off a print', () => {
  const html = renderToStaticMarkup(
    <MoleculeExport read={nothing} fileName="matches" />,
  );

  expect(html).toContain('no-print');
});
