import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { AboutBuildDetails } from '../AboutBuildDetails.tsx';

test('the card names the release, then the instant, the commit and the chrome', () => {
  const html = renderToStaticMarkup(
    <AboutBuildDetails
      version="2.4.0"
      build={{
        version: '2.4.0',
        builtAt: '2026-09-16T09:41:07Z',
        commit: 'a1b2c3d4e5f60718293a4b5c6d7e8f9012345678',
        reactCheminfo: '0.60.0',
      }}
    />,
  );

  expect(html).toBe(
    '<div class="build-tooltip__header">Version 2.4.0</div>' +
      '<dl class="build-tooltip__rows">' +
      '<dt>Built</dt><dd>2026-09-16 09:41:07 UTC</dd>' +
      '<dt>Commit</dt><dd>a1b2c3d</dd>' +
      '<dt>react-cheminfo</dt><dd>0.60.0</dd>' +
      '</dl>',
  );
});

test('a build that knows neither its commit nor its chrome lists only the instant', () => {
  const html = renderToStaticMarkup(
    <AboutBuildDetails
      version="2.4.0"
      build={{ version: '2.4.0', builtAt: '2026-09-16T09:41:07Z' }}
    />,
  );

  expect(html).toBe(
    '<div class="build-tooltip__header">Version 2.4.0</div>' +
      '<dl class="build-tooltip__rows">' +
      '<dt>Built</dt><dd>2026-09-16 09:41:07 UTC</dd>' +
      '</dl>',
  );
});
