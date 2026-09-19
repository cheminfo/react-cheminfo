import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CopyableValue } from '../CopyableValue.tsx';

const INCHI_KEY = 'LFQSCWFLJHTTHZ-UHFFFAOYSA-N';

test('the label, the value and one copy button named after the label', () => {
  const html = renderToStaticMarkup(
    <CopyableValue label="InChIKey" value={INCHI_KEY} />,
  );

  expect(html).toContain('class="copyable-value"');
  expect(html).toContain('>InChIKey</span>');
  expect(html).toContain(`>${INCHI_KEY}<span`);
  expect(html.match(/<button/g)).toHaveLength(1);
  expect(html.match(/tabindex/g)).toBeNull();
  expect(html).toContain('title="Copy the InChIKey"');
  expect(html).toContain(`title="Copy the InChIKey (${INCHI_KEY})"`);
  expect(html).toContain(
    'class="click-to-copy click-to-copy--inline copyable-value__value"',
  );
  expect(html).not.toContain('disabled=""');
});

test('a hint is read on hover over the label', () => {
  const html = renderToStaticMarkup(
    <CopyableValue
      label="SMILES"
      value="CCO"
      hint="Simplified molecular-input line-entry system"
    />,
  );

  expect(html).toContain(
    'title="Simplified molecular-input line-entry system"',
  );
  expect(html).toContain('cursor:help');
});

test('a block value keeps its line breaks and scrolls past its height', () => {
  const html = renderToStaticMarkup(
    <CopyableValue
      label="Molfile"
      value={'\n  RDKit\n\n'}
      block
      maxHeight={90}
    />,
  );

  expect(html).toContain('white-space:pre');
  expect(html).toContain('max-height:90px');
  expect(html).toContain('overflow:auto');
});

test('an empty value reads as the missing marker and offers nothing to copy', () => {
  const html = renderToStaticMarkup(<CopyableValue label="InChI" value="" />);

  expect(html).toContain('>–</code>');
  expect(html).toContain('disabled=""');
  expect(html).not.toContain('click-to-copy');
});

test('what the caller puts under the value follows it, and its class joins ours', () => {
  const html = renderToStaticMarkup(
    <CopyableValue
      label="Accession"
      value="G00055MO"
      copyTitle="Copy the GlyTouCan accession"
      className="notation-row"
    >
      <a href="https://glytoucan.org/Structures/Glycans/G00055MO">GlyTouCan</a>
    </CopyableValue>,
  );

  expect(html).toContain('class="copyable-value notation-row"');
  expect(html).toContain('title="Copy the GlyTouCan accession"');
  expect(html).toMatch(
    /G00055MO<span class="click-to-copy__status" role="status"><\/span><\/code><a href="https:\/\/glytoucan\.org\/Structures\/Glycans\/G00055MO">/,
  );
});
