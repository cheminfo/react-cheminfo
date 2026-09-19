import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ClickToCopy } from '../ClickToCopy.tsx';

test('the value is a focusable button whose title names what a click copies', () => {
  const html = renderToStaticMarkup(
    <ClickToCopy value="C=CC=O" label="SMILES">
      C=CC=O
    </ClickToCopy>,
  );

  expect(html).toMatch(
    /^<span class="click-to-copy click-to-copy--inline" role="button" tabindex="0" title="Copy the SMILES \(C=CC=O\)">C=CC=O<span aria-hidden="true" class="bp6-icon bp6-icon-standard bp6-icon-clipboard click-to-copy__icon"/,
  );
  expect(html).toContain(
    '<span class="click-to-copy__status" role="status"></span></span>',
  );
});

test('a value beside its own copy button is neither a tab stop nor a button', () => {
  const html = renderToStaticMarkup(
    <ClickToCopy value="CCO" focusable={false}>
      CCO
    </ClickToCopy>,
  );

  expect(html).toMatch(
    /^<span class="click-to-copy click-to-copy--inline" title="Copy CCO">CCO</,
  );
  expect(html).not.toContain('tabindex');
  expect(html).not.toContain('role="button"');
  expect(html).not.toContain('click-to-copy__icon');
});

test('an empty title keeps the hover to a tooltip the value sits in', () => {
  const html = renderToStaticMarkup(
    <ClickToCopy value="[a-z]+" label="syntax" title="">
      [a-z]+
    </ClickToCopy>,
  );

  expect(html).toContain('title=""');
});

test('with no label the title is the value itself', () => {
  const html = renderToStaticMarkup(
    <ClickToCopy value="LFQSCWFLJHTTHZ-UHFFFAOYSA-N">ethanol</ClickToCopy>,
  );

  expect(html).toContain('title="Copy LFQSCWFLJHTTHZ-UHFFFAOYSA-N"');
});

test('a formula copied with its HTML is titled by its text', () => {
  const html = renderToStaticMarkup(
    <ClickToCopy
      value={{ text: 'C3H4O', html: 'C<sub>3</sub>H<sub>4</sub>O' }}
      label="molecular formula"
    >
      C<sub>3</sub>H<sub>4</sub>O
    </ClickToCopy>,
  );

  expect(html).toContain('title="Copy the molecular formula (C3H4O)"');
  expect(html).toContain('>C<sub>3</sub>H<sub>4</sub>O<span');
});

test('a long value is left out of the title', () => {
  const molfile = `\n  OCL\n\n${'  0  0  0  0  0  0  0  0  0  0999 V2000\n'.repeat(4)}M  END`;
  const html = renderToStaticMarkup(
    <ClickToCopy value={molfile} label="molfile">
      molfile
    </ClickToCopy>,
  );

  expect(html).toContain('title="Copy the molfile"');
});

test('the title a caller writes replaces the built one', () => {
  const html = renderToStaticMarkup(
    <ClickToCopy value="CCO" label="SMILES" title="CCO, click to copy">
      CCO
    </ClickToCopy>,
  );

  expect(html).toContain('title="CCO, click to copy"');
});

test('a table cell is its own target, keeps its cell role and holds the glyph inside', () => {
  const html = renderToStaticMarkup(
    <table>
      <tbody>
        <tr>
          <ClickToCopy as="td" value="-10.28" label="energy">
            -10.28 eV
          </ClickToCopy>
        </tr>
      </tbody>
    </table>,
  );

  expect(html).toContain(
    '<td class="click-to-copy click-to-copy--block" tabindex="0" title="Copy the energy (-10.28)">-10.28 eV<span',
  );
  expect(html).not.toContain('role="button"');
});

test('the class and style a caller gives reach the element', () => {
  const html = renderToStaticMarkup(
    <ClickToCopy
      as="code"
      value="CCO"
      className="smiles"
      style={{ fontSize: 12 }}
    >
      CCO
    </ClickToCopy>,
  );

  expect(html).toContain(
    '<code class="click-to-copy click-to-copy--inline smiles" style="font-size:12px"',
  );
});

test('a lazy value is not read while the page renders, and stays out of the title', () => {
  let reads = 0;
  const html = renderToStaticMarkup(
    <ClickToCopy
      value={() => {
        reads++;
        return 'CCO';
      }}
      label="SMILES"
    >
      ethanol
    </ClickToCopy>,
  );

  expect(reads).toBe(0);
  expect(html).toContain('title="Copy the SMILES"');
});

test('a disabled value is plain content, with nothing announcing a copy', () => {
  const html = renderToStaticMarkup(
    <ClickToCopy value="" disabled className="smiles">
      –
    </ClickToCopy>,
  );

  expect(html).toBe('<span class="smiles">–</span>');
});
