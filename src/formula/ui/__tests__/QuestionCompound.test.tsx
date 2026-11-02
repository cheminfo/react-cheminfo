import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { QuestionCompound } from '../QuestionCompound.tsx';

test('a compound is named before its formula', () => {
  const html = renderToStaticMarkup(
    <QuestionCompound formula="H2SO4" name="sulfuric acid" />,
  );

  expect(html).toContain(
    '<span class="question-compound__name">sulfuric acid</span>',
  );
  expect(html.indexOf('sulfuric acid')).toBeLessThan(html.indexOf('<sub>'));
});

test('a compound with no name is its formula alone', () => {
  const html = renderToStaticMarkup(<QuestionCompound formula="NaCl" />);

  expect(html).not.toContain('question-compound__name');
  expect(html).toContain('Copy the formula (NaCl)');
});
