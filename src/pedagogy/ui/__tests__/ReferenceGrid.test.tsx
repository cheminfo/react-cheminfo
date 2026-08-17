import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ReferenceGrid } from '../ReferenceGrid.tsx';
import type { ReferenceSection } from '../ReferenceSectionBlock.tsx';
import { ReferenceSectionBlock } from '../ReferenceSectionBlock.tsx';

const SECTION: ReferenceSection = {
  id: 'anchors',
  title: 'Anchors',
  color: '#1c6e42',
  rows: [
    {
      syntax: String.raw`\b`,
      description: 'Word boundary',
      tooltip: {
        syntax: String.raw`\b`,
        name: 'Word boundary',
        summary: 'Between a word character and a non-word one.',
        detail: 'It consumes nothing.',
        example: { code: String.raw`\bcat\b`, input: 'a category' },
      },
    },
    { syntax: '^', description: 'Start of the input' },
  ],
};

test('the rows are spans in a column, never a table', () => {
  const html = renderToStaticMarkup(
    <ReferenceSectionBlock section={SECTION} />,
  );

  expect(html).not.toContain('<table');
  expect(html).not.toContain('<tr');
  expect(html).toContain('id="anchors"');
  expect(html).toContain('class="reference-section"');
  expect(html).toContain('break-inside:avoid');
  expect(html).toContain('Word boundary');
  expect(html).toContain('Start of the input');
});

test('the heading takes the colour of its section, and the rule under it', () => {
  const coloured = renderToStaticMarkup(
    <ReferenceSectionBlock section={SECTION} />,
  );
  const plain = renderToStaticMarkup(
    <ReferenceSectionBlock section={{ ...SECTION, color: undefined }} />,
  );

  expect(coloured).toContain('color:#1c6e42');
  expect(coloured).toContain('border-bottom:2px solid #1c6e42');
  expect(plain).not.toContain('border-bottom:2px solid');
});

test('only a row that carries the longer story is drawn as interactive', () => {
  const html = renderToStaticMarkup(
    <ReferenceSectionBlock section={SECTION} syntaxWidth={120} />,
  );

  expect(html).toContain('cursor:help');
  expect(html).toContain('flex:0 0 120px');
  expect(html.split('border-bottom:1px dotted').length - 1).toBe(1);
});

test('a section kept off the paper carries the print escape', () => {
  const html = renderToStaticMarkup(
    <ReferenceSectionBlock
      section={{ ...SECTION, noPrint: true, intro: 'Hover a row.' }}
      className="tight"
    />,
  );

  expect(html).toContain('class="reference-section no-print tight"');
  expect(html).toContain('Hover a row.');
});

test('the grid reflows to the width it is given', () => {
  const html = renderToStaticMarkup(
    <ReferenceGrid
      sections={[SECTION, { ...SECTION, id: 'classes', title: 'Classes' }]}
      minColumnWidth={280}
    />,
  );

  expect(html).toContain('repeat(auto-fit, minmax(280px, 1fr))');
  expect(html).toContain('class="reference-grid"');
  expect(html).toContain('id="anchors"');
  expect(html).toContain('id="classes"');
});
