import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, expect, test } from 'vitest';

import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { SiteLanguage } from '../../../language/ui/SiteLanguage.tsx';
import { AxisScaleControl } from '../AxisScaleControl.tsx';

beforeAll(async () => {
  // A language is a chunk of its own, so a page reading in it pays once.
  await CHROME_CATALOG.load('fr');
});

function noop(): void {
  // The control is rendered, never driven, in these tests.
}

test('both scales are named, and the one in force is the checked one', () => {
  const html = renderToStaticMarkup(
    <AxisScaleControl value="log" onChange={noop} />,
  );

  expect(html).toContain('Linear');
  expect(html).toContain('Log');
  expect(html).toContain('Scale');
});

test('an axis names itself, so two of them on one card are told apart', () => {
  const x = renderToStaticMarkup(
    <AxisScaleControl axis="x" value="linear" onChange={noop} />,
  );
  const y = renderToStaticMarkup(
    <AxisScaleControl axis="y" value="linear" onChange={noop} />,
  );

  expect(x).toContain('X scale');
  expect(y).toContain('Y scale');
});

test('a figure whose single axis offers the choice does not name the axis', () => {
  const html = renderToStaticMarkup(
    <AxisScaleControl value="linear" onChange={noop} />,
  );

  expect(html).not.toContain('Y scale');
  expect(html).toContain('Scale');
});

test('a site may call the axis what its readers call it', () => {
  const html = renderToStaticMarkup(
    <AxisScaleControl label="Concentration" value="log" onChange={noop} />,
  );

  expect(html).toContain('Concentration');
});

test('the segments are the chrome, so a translated page gets them translated', () => {
  const html = renderToStaticMarkup(
    <SiteLanguage value="fr">
      <AxisScaleControl value="log" onChange={noop} />
    </SiteLanguage>,
  );

  expect(html).toContain('Linéaire');
  expect(html).toContain('Échelle');
});
