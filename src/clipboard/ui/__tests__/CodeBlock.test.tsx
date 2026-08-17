import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CodeBlock } from '../CodeBlock.tsx';

test('the code is the text of a pre, under the class every site styles', () => {
  const html = renderToStaticMarkup(
    <CodeBlock code="https://smiles.cheminfo.org/?q=CCO" />,
  );

  expect(html).toContain('class="code-block"');
  expect(html).toContain('<pre style=');
  expect(html).toContain('>https://smiles.cheminfo.org/?q=CCO</pre>');
});

test('a plain block offers no copy button', () => {
  const html = renderToStaticMarkup(<CodeBlock code="CCO" />);

  expect(html).not.toContain('<button');
});

test('a copyable block carries one button, in the corner', () => {
  const html = renderToStaticMarkup(<CodeBlock code="CCO" copyable />);

  expect(html.match(/<button/g)).toHaveLength(1);
  expect(html).toContain('title="Copy to clipboard"');
  expect(html).toContain('position:absolute;top:4px;right:4px');
});

test('the text stops before the button rather than running under it', () => {
  const html = renderToStaticMarkup(<CodeBlock code="CCO" copyable />);

  expect(html).toContain('padding-right:42px');
});

test('each tone paints the block and names itself in a class', () => {
  const muted = renderToStaticMarkup(<CodeBlock code="CCO" tone="muted" />);
  const dark = renderToStaticMarkup(<CodeBlock code="CCO" tone="dark" />);

  expect(muted).toContain('class="code-block code-block--muted"');
  expect(muted).toContain('background:#f6f7f9');
  expect(dark).toContain('class="code-block code-block--dark"');
  expect(dark).toContain('color:#e2e8f0');
});

test('the default tone paints nothing of its own', () => {
  const html = renderToStaticMarkup(<CodeBlock code="CCO" />);

  expect(html).not.toContain('background');
  expect(html).not.toContain('code-block--');
});

test('a long block scrolls on itself rather than growing', () => {
  const html = renderToStaticMarkup(<CodeBlock code="CCO" maxHeight={84} />);

  expect(html).toContain('max-height:84px;overflow-y:auto');
});

test('a height given as a string is written as it is', () => {
  const html = renderToStaticMarkup(<CodeBlock code="CCO" maxHeight="12rem" />);

  expect(html).toContain('max-height:12rem');
});

test('rendered children replace the text, and the code is what is copied', () => {
  const html = renderToStaticMarkup(
    <CodeBlock code="load 1CRN" tone="dark" copyable className="help-code">
      <span className="tok-keyword">load</span>
    </CodeBlock>,
  );

  expect(html).toContain('class="code-block code-block--dark help-code"');
  expect(html).toContain('<span class="tok-keyword">load</span>');
  expect(html).not.toContain('>load 1CRN<');
});
