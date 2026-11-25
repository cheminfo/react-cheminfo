import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PUBLIC_DOMAIN, ccBy } from '../../core/exampleCredit.ts';
import { ExampleCreditLine } from '../ExampleCreditLine.tsx';

test('a picture of Wikimedia Commons is credited the way Commons asks', () => {
  const html = renderToStaticMarkup(
    <ExampleCreditLine
      credit={{
        author: 'Xiaojun Wang et al.',
        ...ccBy('3.0'),
        page: 'https://commons.wikimedia.org/wiki/File:PP_cells_in_Pancreatic_Islet.png',
      }}
    />,
  );

  expect(html).toBe(
    '<span class="example-credit">Image: ' +
      '<a href="https://commons.wikimedia.org/wiki/File:PP_cells_in_Pancreatic_Islet.png" target="_blank" rel="noopener noreferrer">Xiaojun Wang et al.</a>, ' +
      '<a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">CC BY 3.0</a>' +
      ', via Wikimedia Commons</span>',
  );
});

test('a licence with no page of its own is written without a link', () => {
  const html = renderToStaticMarkup(
    <ExampleCreditLine
      credit={{
        author: 'Wilson Bentley',
        ...PUBLIC_DOMAIN,
        page: 'https://www.loc.gov/item/2002695024/',
      }}
      className="example-card__credit"
    />,
  );

  expect(html).toBe(
    '<span class="example-credit example-card__credit">Image: ' +
      '<a href="https://www.loc.gov/item/2002695024/" target="_blank" rel="noopener noreferrer">Wilson Bentley</a>' +
      ', public domain</span>',
  );
});

test("plate's credits, whose licence always has a page, are read as they are", () => {
  const plate = {
    author: 'Lizzy1074!',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/',
    page: 'https://commons.wikimedia.org/wiki/File:TLC_of_flower_petals.jpg',
  };
  const html = renderToStaticMarkup(<ExampleCreditLine credit={plate} />);

  expect(html).toContain('>Lizzy1074!</a>, <a href="');
  expect(html).toContain('>CC BY 4.0</a>, via Wikimedia Commons</span>');
});
