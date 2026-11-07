import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { providers } from '../../core/providers.ts';
import { AboutProvidedBy } from '../AboutProvidedBy.tsx';

test('each affiliation is a lockup of its own: its logo, its people, then where it is', () => {
  const html = renderToStaticMarkup(
    <AboutProvidedBy
      people={[
        { name: 'Mara Schilling-Wilhelmi', affiliation: 'fsu-jena' },
        { name: 'Kevin Maik Jablonka', affiliation: 'fsu-jena' },
        { name: 'Luc Patiny', affiliation: 'zakodium' },
        { name: 'Sarthak Kapoor', affiliation: 'hu-berlin' },
        { name: 'Boris Bulgakov', affiliation: 'fsu-jena' },
      ]}
      team={[]}
      providers={providers(['fsu-jena', 'zakodium', 'hu-berlin'])}
    />,
  );

  const order = [
    'aria-label="University of Jena — Friedrich Schiller University Jena"',
    'Mara Schilling-Wilhelmi, Kevin Maik Jablonka and Boris Bulgakov',
    'Friedrich Schiller University Jena<span',
    'aria-label="Zakodium — Zakodium Sàrl"',
    '>Luc Patiny<',
    'Zakodium Sàrl<span',
    '<span>HU Berlin</span>',
    '>Sarthak Kapoor<',
    'Humboldt-Universität zu Berlin<span',
  ].map((text) => html.indexOf(text));

  expect(order).not.toContain(-1);
  expect(order).toStrictEqual(order.toSorted((a, b) => a - b));
});

test('a single institution draws the tile at the width of its own logo', () => {
  const html = renderToStaticMarkup(
    <AboutProvidedBy
      people={[{ name: 'Luc Patiny' }]}
      team={[]}
      providers={providers(['epfl'])}
    />,
  );

  expect(html).toContain('>Luc Patiny<');
  expect(html).toContain('École polytechnique fédérale de Lausanne<span');
  expect(html).not.toContain('width:176px');
});
