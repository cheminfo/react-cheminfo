import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { credits } from '../../core/credits.ts';
import { CreditsList } from '../CreditsList.tsx';

test('each work is a link, followed by its licence and its sentence', () => {
  const html = renderToStaticMarkup(
    <CreditsList entries={credits(['openchemlib', 'molstar'])} />,
  );

  expect(html).toContain('href="https://github.com/cheminfo/openchemlib-js"');
  expect(html).toContain('OpenChemLib');
  expect(html).toContain('BSD-3-Clause');
  expect(html).toContain('href="https://molstar.org/"');
  expect(html).toContain('Mol*');
  expect(html).toContain(
    'the 3D viewer, its representations and its surfaces.',
  );
});

test('the works are listed in the order they were asked for', () => {
  const html = renderToStaticMarkup(
    <CreditsList entries={credits(['nivo', 'react', 'blueprint'])} />,
  );

  expect(html.indexOf('nivo')).toBeLessThan(html.indexOf('>React<'));
  expect(html.indexOf('>React<')).toBeLessThan(html.indexOf('Blueprint'));
});

test('every link leaves the site safely', () => {
  const html = renderToStaticMarkup(
    <CreditsList entries={credits(['vite'])} />,
  );

  expect(html).toContain('target="_blank"');
  expect(html).toContain('rel="noopener noreferrer"');
});

test('a site may leave the licences out', () => {
  const html = renderToStaticMarkup(
    <CreditsList entries={credits(['openchemlib'])} showLicense={false} />,
  );

  expect(html).toContain('OpenChemLib');
  expect(html).not.toContain('BSD-3-Clause');
});

test('a work with no licence of its own is still listed', () => {
  const html = renderToStaticMarkup(
    <CreditsList
      entries={[
        {
          id: 'eht-parameters',
          name: 'yaehmop',
          href: 'https://github.com/greglandrum/yaehmop',
          description: 'the Extended Hückel parameters.',
        },
      ]}
    />,
  );

  expect(html).toContain('yaehmop');
  expect(html).toContain('the Extended Hückel parameters.');
});

test('a list with nothing to credit renders an empty list', () => {
  const html = renderToStaticMarkup(<CreditsList entries={[]} />);

  expect(html).toContain('class="credits-list"');
  expect(html).not.toContain('<li');
});

test('the class a site gives reaches the list', () => {
  const html = renderToStaticMarkup(
    <CreditsList entries={credits(['react'])} className="about-credits" />,
  );

  expect(html).toContain('class="credits-list about-credits"');
});
