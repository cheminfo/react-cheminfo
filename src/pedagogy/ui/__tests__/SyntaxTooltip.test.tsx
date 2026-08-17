import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { SyntaxTooltipContent } from '../SyntaxTooltip.tsx';
import { SyntaxTooltip, SyntaxTooltipBody } from '../SyntaxTooltip.tsx';

const CONTENT: SyntaxTooltipContent = {
  syntax: String.raw`\b`,
  name: 'Word boundary',
  tag: 'RegExp',
  summary: 'Matches between a word character and a non-word one.',
  detail: 'It consumes nothing, so it can sit at either end of a pattern.',
  example: {
    code: String.raw`\bcat\b`,
    input: 'a cat in a category',
    note: 'matches the animal, not the word category',
  },
};

test('the body writes the five fields and the labelled example', () => {
  const html = renderToStaticMarkup(<SyntaxTooltipBody content={CONTENT} />);

  expect(html).toContain(String.raw`\b<`);
  expect(html).toContain('Word boundary');
  expect(html).toContain('RegExp');
  expect(html).toContain(
    'Matches between a word character and a non-word one.',
  );
  expect(html).toContain('It consumes nothing');
  expect(html).toContain('>Example</span>');
  expect(html).toContain('>Input</span>');
  expect(html).toContain('a cat in a category');
  expect(html).toContain('matches the animal, not the word category');
});

test('the example labels are the ones the tool uses for its own domain', () => {
  const html = renderToStaticMarkup(
    <SyntaxTooltipBody
      content={CONTENT}
      codeLabel="Molecule"
      inputLabel="Observation"
    />,
  );

  expect(html).toContain('>Molecule</span>');
  expect(html).toContain('>Observation</span>');
  expect(html).not.toContain('>Input</span>');
});

test('an example with no input and no note shows only its code', () => {
  const html = renderToStaticMarkup(
    <SyntaxTooltipBody
      content={{ ...CONTENT, tag: undefined, example: { code: 'C1=CC=CC=C1' } }}
    />,
  );

  expect(html).toContain('C1=CC=CC=C1');
  expect(html).not.toContain('>Input</span>');
  expect(html).not.toContain('RegExp');
});

test('the tooltip renders what it wraps and nothing more until hovered', () => {
  const html = renderToStaticMarkup(
    <SyntaxTooltip content={CONTENT} placement="right">
      <span>row</span>
    </SyntaxTooltip>,
  );

  expect(html).toContain('>row</span>');
  expect(html).not.toContain('Word boundary');
});
