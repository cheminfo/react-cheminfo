import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CopyTableButton } from '../CopyTableButton.tsx';

test('the action reads Copy as table, with the table glyph and no native title', () => {
  let writes = 0;
  const html = renderToStaticMarkup(
    <CopyTableButton
      table={() => {
        writes++;
        return 'pH\tcolour\n7\tgreen';
      }}
    />,
  );

  expect(writes).toBe(0);
  expect(html).toContain('>Copy as table<');
  expect(html).toContain('aria-label="Copy as table"');
  expect(html).toContain('bp6-icon-th');
  expect(html).toContain('no-print card__copy-table');
  expect(html).toContain('data-testid="card-copy-table"');
  expect(html).toContain('title=""');
  expect(html).not.toContain('card__copy-table--glyph');
});

test('a glyph alone keeps the label as its accessible name', () => {
  const html = renderToStaticMarkup(
    <CopyTableButton
      table={() => ''}
      tooltip="Copy the bond angles as a table, to paste into a spreadsheet"
      glyphOnly
      testId="copy-angles"
    />,
  );

  expect(html).toContain('card__copy-table card__copy-table--glyph');
  expect(html).toContain('aria-label="Copy as table"');
  expect(html).toContain('data-testid="copy-angles"');
});
