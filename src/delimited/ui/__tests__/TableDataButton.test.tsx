import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { DelimitedTextPanel } from '../DelimitedTextPanel.tsx';
import { TableDataButton } from '../TableDataButton.tsx';

const ROWS: ReadonlyArray<readonly string[]> = [
  ['H2O', '18.015'],
  ['NH3', '17.031'],
];

test('the button is named after what it does, not after a separator', () => {
  const html = renderToStaticMarkup(<TableDataButton rows={ROWS} />);

  expect(html).toContain('Copy or download data');
  expect(html).not.toContain('TSV');
  expect(html).not.toContain('CSV');
});

test('a table with no rows cannot be opened', () => {
  const html = renderToStaticMarkup(<TableDataButton rows={[]} />);

  expect(html).toContain('disabled');
});

test('a table with rows can be', () => {
  const html = renderToStaticMarkup(<TableDataButton rows={ROWS} />);

  expect(html).not.toContain('disabled');
});

test('the caller can grey it although there are rows', () => {
  const html = renderToStaticMarkup(<TableDataButton rows={ROWS} disabled />);

  expect(html).toContain('disabled');
});

test('the dialog is shut until the button is pressed', () => {
  const html = renderToStaticMarkup(<TableDataButton rows={ROWS} />);

  expect(html).not.toContain('18.015');
});

test('a label beside the glyph is what the button reads', () => {
  const html = renderToStaticMarkup(
    <TableDataButton rows={ROWS} text="Peak list" />,
  );

  expect(html).toContain('Peak list');
  expect(html).toContain('aria-label="Peak list"');
});

test('a preview replaces the text area, and the text is still serialized', () => {
  const html = renderToStaticMarkup(
    <DelimitedTextPanel rows={ROWS} preview={<b>two rows</b>} />,
  );

  expect(html).toContain('<b>two rows</b>');
  expect(html).not.toContain('<textarea');
});

test('without a preview the text area holds the table', () => {
  const html = renderToStaticMarkup(<DelimitedTextPanel rows={ROWS} />);

  expect(html).toContain('<textarea');
  expect(html).toContain('H2O\t18.015');
});

test('a rows function is not called while the button is only showing', () => {
  let calls = 0;

  renderToStaticMarkup(
    <TableDataButton
      rows={() => {
        calls++;
        return ROWS;
      }}
    />,
  );

  expect(calls).toBe(0);
});

test('a rows function leaves the button pressable without being called', () => {
  const html = renderToStaticMarkup(<TableDataButton rows={() => []} />);

  expect(html).not.toContain('disabled');
});

test('the dialog heading names the table while the button names the deed', () => {
  const html = renderToStaticMarkup(
    <TableDataButton rows={ROWS} title="Titration curve as a table" />,
  );

  expect(html).toContain('aria-label="Copy or download data"');
  expect(html).not.toContain('Titration curve');
});

test('a caller whose chrome is not Blueprint supplies the trigger instead', () => {
  const html = renderToStaticMarkup(
    <TableDataButton
      rows={ROWS}
      trigger={(open) => <a onClick={open}>Take the table</a>}
    />,
  );

  expect(html).toContain('Take the table');
  expect(html).not.toContain('<button');
});
