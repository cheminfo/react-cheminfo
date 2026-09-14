import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { Glossary } from '../../core/glossary.ts';
import { GlossaryIndex } from '../GlossaryIndex.tsx';
import { GlossaryProvider } from '../GlossaryProvider.tsx';

const GLOSSARY: Glossary = {
  'ring closure': {
    title: 'Ring closure',
    summary: 'A digit that joins two atoms.',
    examples: [{ code: 'c1ccccc1' }],
  },
  anchor: {
    title: 'Anchor',
    summary: 'Matches a position.',
    examples: [],
  },
};

test('every term is listed by title, each under an id a link can reach', () => {
  const html = renderToStaticMarkup(
    <GlossaryIndex glossary={GLOSSARY} className="help" />,
  );

  expect(html).toContain('class="glossary-index help"');
  expect(html).toContain('id="glossary-anchor"');
  expect(html).toContain('id="glossary-ring-closure"');
  expect(html.indexOf('Anchor')).toBeLessThan(html.indexOf('Ring closure'));
  expect(html.match(/class="glossary-index-entry"/g)).toHaveLength(2);
  expect(html).toContain('placeholder="Filter terms…"');
  expect(html).toContain('class="no-print"');
});

test('the filter box can be left out and the ids prefixed differently', () => {
  const html = renderToStaticMarkup(
    <GlossaryIndex glossary={GLOSSARY} searchable={false} idPrefix="term-" />,
  );

  expect(html).not.toContain('<input');
  expect(html).toContain('id="term-ring-closure"');
});

test('the terms come from the surrounding provider when none is passed', () => {
  const html = renderToStaticMarkup(
    <GlossaryProvider glossary={GLOSSARY}>
      <GlossaryIndex searchable={false} />
    </GlossaryProvider>,
  );

  expect(html.match(/class="glossary-index-entry"/g)).toHaveLength(2);
});

test('an empty glossary says that no term is defined yet', () => {
  const html = renderToStaticMarkup(<GlossaryIndex glossary={{}} />);

  expect(html).toContain('No term is defined yet.');
  expect(html).not.toContain('glossary-index-entry');
});
