import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PrincipalComponentSelect } from '../PrincipalComponentSelect.tsx';

test('both axes offer every component the decomposition produced', () => {
  const html = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={4}
      onChange={() => null}
    />,
  );

  expect(html.match(/<option /g)).toHaveLength(8);
  expect(html.match(/<select>/g)).toHaveLength(2);
  expect(html).toContain('Horizontal axis');
  expect(html).toContain('Vertical axis');
});

test('an option is valued with the zero-based column while its label says PC1', () => {
  const html = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={3}
      explainedVariance={[0.742, 0.183, 0.045]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('<option value="0" selected="">PC1 — 74.2 %</option>');
  expect(html).toContain('<option value="1">PC2 — 18.3 %</option>');
  expect(html).toContain('<option value="2">PC3 — 4.5 %</option>');
});

test('the shares of the two picked components are added up in one line', () => {
  const html = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={3}
      explainedVariance={[0.742, 0.183, 0.045]}
      onChange={() => null}
    />,
  );

  expect(html).toContain('Together they carry 92.5 % of the variance.');
});

test('nothing is said about the variance when none was handed in', () => {
  const html = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={3}
      onChange={() => null}
    />,
  );

  expect(html).not.toContain('Together they carry');
  expect(html).not.toContain('NaN');
  expect(html).toContain('<option value="0" selected="">PC1</option>');
});

test('a pair naming a component the decomposition never produced is drawn clamped', () => {
  const html = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 9, y: 9 }}
      count={3}
      onChange={() => null}
    />,
  );
  const [horizontal, vertical] = html.split('Vertical axis');

  expect(horizontal).toContain('<option value="2" selected="">PC3</option>');
  expect(vertical).toContain('<option value="1" selected="">PC2</option>');
  expect(html.match(/selected=""/g)).toHaveLength(2);
});

test('the decomposition options stay hidden until both settings props are given', () => {
  const html = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={3}
      settings={{ method: 'NIPALS' }}
      onChange={() => null}
    />,
  );

  expect(html.match(/<select>/g)).toHaveLength(2);
  expect(html).not.toContain('Method');
  expect(html).not.toContain('Singular value decomposition');
  expect(html).not.toContain('Centre the columns');
  expect(html).not.toContain('Scale the columns');
  expect(html).not.toContain('Ignore flat columns');
  expect(html).not.toContain('Components to compute');
});

test('the four decomposition options are drawn once both settings props are given', () => {
  const html = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={3}
      settings={{}}
      onChange={() => null}
      onSettingsChange={() => null}
    />,
  );

  expect(html).toContain('Method');
  expect(html).toContain('<option value="SVD" selected="">');
  expect(html).toContain('Centre the columns (on unless turned off)');
  expect(html).toContain('Scale the columns (off unless turned on)');
  expect(html).toContain('Ignore flat columns (only matters while scaling)');
  expect(html.match(/type="checkbox"/g)).toHaveLength(3);
});

test('centring reads as on and scaling as off while the settings say nothing', () => {
  const html = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={3}
      settings={{}}
      onChange={() => null}
      onSettingsChange={() => null}
    />,
  );

  expect(html.match(/type="checkbox" checked=""/g)).toHaveLength(1);
});

test('the NIPALS component count is drawn only under NIPALS', () => {
  const underSvd = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={3}
      settings={{ method: 'SVD' }}
      onChange={() => null}
      onSettingsChange={() => null}
    />,
  );
  const underNipals = renderToStaticMarkup(
    <PrincipalComponentSelect
      value={{ x: 0, y: 1 }}
      count={3}
      settings={{ method: 'NIPALS', nCompNIPALS: 5 }}
      onChange={() => null}
      onSettingsChange={() => null}
    />,
  );

  expect(underSvd).toContain('<option value="SVD" selected="">');
  expect(underSvd).not.toContain('Components to compute');
  expect(underNipals).toContain('Components to compute');
  expect(underNipals).toContain('placeholder="2"');
  expect(underNipals).toContain('value="5"');
  expect(underNipals).toContain(
    'NIPALS stops once it has this many components.',
  );
});
