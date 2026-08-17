import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { Glossary } from '../../core/glossary.ts';
import { GlossaryProvider } from '../GlossaryProvider.tsx';
import { GlossaryText, GlossaryTooltipBody } from '../GlossaryText.tsx';

const ANCHOR = {
  title: 'Anchor',
  summary: 'Matches a position rather than a character.',
  examples: [
    { code: '^cat', input: 'cat food', note: 'only at the start' },
    { code: 'cat$' },
  ],
};

const GLOSSARY: Glossary = { anchor: ANCHOR };

test('a known term becomes an underlined chip, an unknown one stays prose', () => {
  const html = renderToStaticMarkup(
    <GlossaryProvider glossary={GLOSSARY}>
      <GlossaryText text="An [[anchor]] is not a [[quantifier]]." />
    </GlossaryProvider>,
  );

  expect(html).toContain('class="glossary-term"');
  expect(html).toContain('border-bottom:1px dotted currentColor');
  expect(html).toContain('>anchor</span>');
  expect(html).toContain('quantifier');
  expect(html).not.toContain('[[');
  expect(html).not.toContain(']]');
});

test('the marker never shows its brackets when no provider wraps the tree', () => {
  const html = renderToStaticMarkup(
    <GlossaryText text="An [[anchor]] holds." />,
  );

  expect(html).toBe('An anchor holds.');
});

test('a marker renders its displayed text and resolves on the term', () => {
  const html = renderToStaticMarkup(
    <GlossaryText
      glossary={GLOSSARY}
      text="Two [[anchor|anchors]] here."
      className="term"
    />,
  );

  expect(html).toContain('class="term"');
  expect(html).toContain('>anchors</span>');
  expect(html).not.toContain('anchor|');
});

test('a glossary passed as a prop wins over the surrounding provider', () => {
  const html = renderToStaticMarkup(
    <GlossaryProvider glossary={{}}>
      <GlossaryText glossary={GLOSSARY} text="An [[anchor]]." />
    </GlossaryProvider>,
  );

  expect(html).toContain('class="glossary-term"');
});

test('the same term twice in one sentence keeps both chips', () => {
  const html = renderToStaticMarkup(
    <GlossaryText glossary={GLOSSARY} text="[[anchor]] and [[anchor]]" />,
  );

  expect(html.split('class="glossary-term"')).toHaveLength(3);
});

test('the body shows the title, the summary and every example', () => {
  const html = renderToStaticMarkup(<GlossaryTooltipBody entry={ANCHOR} />);

  expect(html).toContain('Anchor');
  expect(html).toContain('Matches a position rather than a character.');
  expect(html).toContain('^cat');
  expect(html).toContain(' on cat food');
  expect(html).toContain('only at the start');
  expect(html).toContain('cat$');
});

test('an entry with no example renders no list at all', () => {
  const html = renderToStaticMarkup(
    <GlossaryTooltipBody
      entry={{
        title: 'Layer',
        summary: 'One slash-separated part.',
        examples: [],
      }}
    />,
  );

  expect(html).not.toContain('<ul');
});
