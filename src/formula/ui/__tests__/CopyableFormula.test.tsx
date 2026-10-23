import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CopyableFormula } from '../CopyableFormula.tsx';
import { QuestionFormula } from '../QuestionFormula.tsx';

test('a formula is drawn with its charge read the way a student types it', () => {
  const html = renderToStaticMarkup(<QuestionFormula formula="SO4--" />);

  // The charge stacked over the count, as `SO4(-2)` is drawn: read without the
  // rewrite, the two minus signs would be lost and the ion drawn neutral.
  expect(html).toBe(
    '<span>SO<span style="flex-direction:column;display:inline-flex;justify-content:center;text-align:left;vertical-align:middle"><span style="line-height:0.8;font-size:80%">-2</span><span style="line-height:0.8;font-size:80%">4</span></span></span>',
  );
});

test('a copyable formula is named as one and drawn in its cell', () => {
  const html = renderToStaticMarkup(
    <table>
      <tbody>
        <tr>
          <CopyableFormula formula="CuSO4.5H2O" as="td" />
        </tr>
      </tbody>
    </table>,
  );

  expect(html).toContain('<td');
  expect(html).toContain('Copy the formula (CuSO4.5H2O)');
  expect(html).toContain('<sub>4</sub>');
});
