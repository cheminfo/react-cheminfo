import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { GlossaryProvider } from '../../../pedagogy/ui/GlossaryProvider.tsx';
import { GlossaryText } from '../../../pedagogy/ui/GlossaryText.tsx';
import { renderMf } from '../renderMf.tsx';

test('a formula written in prose is drawn with its subscripts', () => {
  const html = renderToStaticMarkup(
    <GlossaryProvider glossary={{}} renderMf={renderMf}>
      <GlossaryText text="Glucose is {{C6H12O6}}." />
    </GlossaryProvider>,
  );

  expect(html).toBe(
    'Glucose is <span>C<sub>6</sub>H<sub>12</sub>O<sub>6</sub></span>.',
  );
});
