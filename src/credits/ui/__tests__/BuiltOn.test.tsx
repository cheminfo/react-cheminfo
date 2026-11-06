import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { credits } from '../../core/credits.ts';
import { BuiltOn } from '../BuiltOn.tsx';

test('ours is shown and counted, and the others are folded away', () => {
  const html = renderToStaticMarkup(
    <BuiltOn entries={credits(['react', 'openchemlib', 'react-cheminfo'])} />,
  );

  expect(html).toContain('Our packages (2)');
  expect(html.indexOf('OpenChemLib')).toBeLessThan(html.indexOf('<details'));
  expect(html.indexOf('<details')).toBeLessThan(html.indexOf('>React<'));
  expect(html).not.toContain('<details class="no-print" open');
  expect(html).toContain('Other packages');
});

test('a site crediting nothing of ours opens the others', () => {
  const html = renderToStaticMarkup(<BuiltOn entries={credits(['react'])} />);

  expect(html).not.toContain('Our packages');
  expect(html).toContain('<details class="no-print" open');
});

test('a site crediting only ours draws no fold', () => {
  const html = renderToStaticMarkup(
    <BuiltOn entries={credits(['openchemlib'])} />,
  );

  expect(html).toContain('Our packages (1)');
  expect(html).not.toContain('<details');
});

test('no list means no link to the licence texts', () => {
  const html = renderToStaticMarkup(
    <BuiltOn entries={credits(['openchemlib'])} />,
  );

  expect(html).not.toContain('licenses.txt');
});
