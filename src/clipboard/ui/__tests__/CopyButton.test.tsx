import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CopyButton } from '../CopyButton.tsx';

test('the button reads its label and carries the copy glyph', () => {
  const html = renderToStaticMarkup(
    <CopyButton content="CCO" label="Copy SMILES" />,
  );

  expect(html).toContain('Copy SMILES');
  expect(html).toContain('bp6-icon-duplicate');
  expect(html).not.toContain('Copied');
});

test('a button with no label is reduced to its glyph, and still named', () => {
  const html = renderToStaticMarkup(<CopyButton content="CCO" />);

  expect(html).toContain('aria-label="Copy to clipboard"');
  expect(html).toContain('title="Copy to clipboard"');
  expect(html).not.toContain('bp6-button-text');
});

test('the title a caller writes is what the pointer is told', () => {
  const html = renderToStaticMarkup(
    <CopyButton content="InChI=1S/H2O/h1H2" title="Copy InChI to clipboard" />,
  );

  expect(html).toContain('title="Copy InChI to clipboard"');
  expect(html).toContain('aria-label="Copy InChI to clipboard"');
});

test('a lazy content is not read while the page renders', () => {
  let reads = 0;
  const html = renderToStaticMarkup(
    <CopyButton
      content={() => {
        reads++;
        return 'CCO';
      }}
      label="Copy list"
    />,
  );

  expect(reads).toBe(0);
  expect(html).toContain('Copy list');
});

test('the minimal and small button take the classes a dense row needs', () => {
  const html = renderToStaticMarkup(<CopyButton content="CCO" minimal small />);

  expect(html).toContain('bp6-minimal');
  expect(html).toContain('bp6-small');
});

test('a full-size button is neither minimal nor small', () => {
  const html = renderToStaticMarkup(<CopyButton content="CCO" label="Copy" />);

  expect(html).not.toContain('bp6-minimal');
  expect(html).not.toContain('bp6-small');
});

test('a button with nothing to copy is disabled', () => {
  const html = renderToStaticMarkup(
    <CopyButton content="" label="Copy" disabled />,
  );

  expect(html).toContain('disabled=""');
});

test('the glyph a caller picks replaces the default one', () => {
  const html = renderToStaticMarkup(
    <CopyButton content="CCO" icon="clipboard" label="Copy" />,
  );

  expect(html).toContain('bp6-icon-clipboard');
  expect(html).not.toContain('bp6-icon-duplicate');
});

test('the class a site gives reaches the button', () => {
  const html = renderToStaticMarkup(
    <CopyButton content="CCO" className="share-copy" />,
  );

  expect(html).toContain('share-copy');
});
