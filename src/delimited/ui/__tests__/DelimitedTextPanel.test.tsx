import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { DelimitedTextDialog } from '../DelimitedTextDialog.tsx';
import { DelimitedTextPanel } from '../DelimitedTextPanel.tsx';

const ROWS: ReadonlyArray<readonly string[]> = [
  ['H2O', '18.015'],
  ['acetic acid, glacial', '60.052'],
];
const HEADER: readonly string[] = ['name', 'mass'];

test('the whole table is written out, tab separated, header first', () => {
  const html = renderToStaticMarkup(
    <DelimitedTextPanel rows={ROWS} header={HEADER} />,
  );

  expect(html).toContain(
    'name\tmass\nH2O\t18.015\nacetic acid, glacial\t60.052',
  );
});

test('the comma separator quotes the cell that holds a comma', () => {
  const html = renderToStaticMarkup(
    <DelimitedTextPanel rows={ROWS} header={HEADER} defaultDelimiter="comma" />,
  );

  expect(html).toContain('&quot;acetic acid, glacial&quot;,60.052');
});

test('an unknown separator falls back to the tab rather than failing', () => {
  const html = renderToStaticMarkup(
    // @ts-expect-error a stored preference may name a separator we dropped.
    <DelimitedTextPanel rows={ROWS} header={HEADER} defaultDelimiter="pipe" />,
  );

  expect(html).toContain('name\tmass');
});

test('the three separators are all offered', () => {
  const html = renderToStaticMarkup(<DelimitedTextPanel rows={ROWS} />);

  expect(html).toContain('Tab');
  expect(html).toContain('Comma');
  expect(html).toContain('Semicolon');
});

test('the default sentence counts the rows', () => {
  const html = renderToStaticMarkup(<DelimitedTextPanel rows={ROWS} />);

  expect(html).toContain('2 rows, one per line.');
});

test('a single row is counted in the singular', () => {
  const html = renderToStaticMarkup(<DelimitedTextPanel rows={[['H2O']]} />);

  expect(html).toContain('1 row, one per line.');
});

test('a site may say what its table holds instead', () => {
  const html = renderToStaticMarkup(
    <DelimitedTextPanel
      rows={ROWS}
      description="Every equilibrium, sources included."
    />,
  );

  expect(html).toContain('Every equilibrium, sources included.');
  expect(html).not.toContain('one per line');
});

test('the text can be copied and saved', () => {
  const html = renderToStaticMarkup(<DelimitedTextPanel rows={ROWS} />);

  expect(html).toContain('Copy');
  expect(html).toContain('Save');
  expect(html).toContain('bp6-icon-clipboard');
  expect(html).toContain('bp6-icon-download');
});

test('a framed page may drop the save button', () => {
  const html = renderToStaticMarkup(
    <DelimitedTextPanel rows={ROWS} downloadable={false} />,
  );

  expect(html).toContain('Copy');
  expect(html).not.toContain('bp6-icon-download');
});

test('the text area is read only, named, and as tall as asked', () => {
  const html = renderToStaticMarkup(
    <DelimitedTextPanel rows={ROWS} label="Equilibria as text" height={200} />,
  );

  expect(html).toContain('<textarea readOnly=""');
  expect(html).toContain('aria-label="Equilibria as text"');
  expect(html).toContain('height:200px');
});

test('a table with nothing in it still offers its header', () => {
  const html = renderToStaticMarkup(
    <DelimitedTextPanel rows={[]} header={HEADER} />,
  );

  expect(html).toContain('0 rows, one per line.');
  expect(html).toContain('>name\tmass</textarea>');
});

test('the dialog draws nothing while it is closed', () => {
  const html = renderToStaticMarkup(
    <DelimitedTextDialog
      isOpen={false}
      onClose={() => null}
      rows={ROWS}
      header={HEADER}
    />,
  );

  expect(html).toBe('');
});
