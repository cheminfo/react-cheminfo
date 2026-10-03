import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CopyableValue } from '../CopyableValue.tsx';

const INCHI_KEY = 'LFQSCWFLJHTTHZ-UHFFFAOYSA-N';

test('the label names the value, and the value is the only control', () => {
  const html = renderToStaticMarkup(
    <CopyableValue label="InChIKey" value={INCHI_KEY} />,
  );

  expect(html).toContain('class="copyable-value"');
  expect(html).toContain('>InChIKey</span>');
  expect(html).toContain(`>${INCHI_KEY}<span`);
  expect(html.match(/<button/g)).toBeNull();
  expect(html.match(/tabindex/g)).toHaveLength(1);
  expect(html).toContain(`title="Copy the InChIKey (${INCHI_KEY})"`);
  // The value fills the row, so the glyph keeps its room inside the right
  // edge: past it, it would scroll whatever holds the value sideways.
  expect(html).toContain(
    'class="click-to-copy click-to-copy--block copyable-value__value"',
  );
  expect(html).not.toContain('disabled=""');
});

test('a hint opens as the family help card, not as the browser tooltip', () => {
  const html = renderToStaticMarkup(
    <CopyableValue
      label="SMILES"
      value="CCO"
      hint="Simplified molecular-input line-entry system"
    />,
  );

  // The browser's own tooltip is drawn by the operating system and takes a
  // second to appear, so the label carries no `title` at all.
  expect(html).not.toContain(
    'title="Simplified molecular-input line-entry system"',
  );
  expect(html).toContain('bp6-popover-target');
  // Dotted and taking the help cursor, which is what says the name explains
  // itself — see `OverlayRow`, where the rest of the package reads this way.
  expect(html).toContain('cursor:help');
  expect(html).toContain('underline dotted');
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

test('a clipped block is cut off and faded rather than given scrollbars', () => {
  const html = renderToStaticMarkup(
    <CopyableValue
      label="Molfile"
      value={'\n  RDKit\n\n'}
      block
      clip
      maxHeight={92}
    />,
  );

  expect(html).toContain('overflow:hidden');
  expect(html).toContain('max-height:92px');
  expect(html).toContain('mask-image:linear-gradient(to bottom, #000 72%');
  expect(html).not.toContain('overflow:auto');
});

test('an empty value reads as the missing marker and offers nothing to copy', () => {
  const html = renderToStaticMarkup(<CopyableValue label="InChI" value="" />);

  expect(html).toContain('>–</code>');
  expect(html).not.toContain('click-to-copy');
  expect(html).not.toContain('tabindex');
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
  expect(html).toContain(
    '</code><a href="https://glytoucan.org/Structures/Glycans/G00055MO">',
  );
});
