import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { HiddenPartsProvider } from '../../../share/ui/HiddenPartsProvider.tsx';
import { CalculatorTable } from '../CalculatorTable.tsx';
import { PracticePage } from '../PracticePage.tsx';

test('a French page heads its calculator in French', async () => {
  await CHROME_CATALOG.load('fr');
  const html = renderToStaticMarkup(
    <SiteLanguage value="fr">
      <PracticePage
        title="Électrons"
        lead="Comptez-les."
        playground={<p>box</p>}
        exercises={<p>series</p>}
      />
    </SiteLanguage>,
  );

  expect(html).toContain(
    '<h2 class="panel__title" id="calculator-heading">Calculatrice</h2>',
  );
});

test('a practice page draws its calculator, then its series', () => {
  const html = renderToStaticMarkup(
    <PracticePage
      title="Electrons"
      lead="Count them."
      playground={<p>box</p>}
      exercises={<p>series</p>}
    />,
  );

  expect(html).toContain('<h1 class="page__title">Electrons</h1>');
  expect(html.indexOf('Calculator')).toBeLessThan(html.indexOf('series'));
  expect(html).toContain('<p>box</p>');
});

test('a page with no calculator is its series alone', () => {
  const html = renderToStaticMarkup(
    <PracticePage title="Name it" lead="Name the compound." exercises="x" />,
  );

  expect(html).not.toContain('Calculator');
  expect(html).toContain('aria-labelledby="questions-heading"');
});

test('a link hides the calculator as the part playground', () => {
  const html = renderToStaticMarkup(
    <HiddenPartsProvider hidden={['playground']}>
      <PracticePage
        title="Electrons"
        lead="Count them."
        playground={<p>box</p>}
        exercises={<p>series</p>}
      />
    </HiddenPartsProvider>,
  );

  expect(html).not.toContain('<p>box</p>');
  expect(html).toContain('<p>series</p>');
});

test('the working of a calculator ends on its totals', () => {
  const html = renderToStaticMarkup(
    <CalculatorTable
      headers={['Atom', 'Z']}
      footer={
        <tr>
          <td>Total</td>
        </tr>
      }
    >
      <tr>
        <td>C</td>
      </tr>
    </CalculatorTable>,
  );

  expect(html).toContain('<th>Atom</th><th>Z</th>');
  expect(html).toContain('<tfoot><tr><td>Total</td></tr></tfoot>');
});
