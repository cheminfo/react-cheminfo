import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { evenScale } from '../../core/interpolate.ts';
import { ColorScaleBar } from '../ColorScaleBar.tsx';

test('a strip with nothing to say is hidden from a screen reader', () => {
  const html = renderToStaticMarkup(
    <ColorScaleBar scale={evenScale(['#000000', '#ffffff'])} samples={3} />,
  );

  expect(html).toContain('aria-hidden="true"');
  expect(html).not.toContain('role="img"');
  expect(html).toContain('#808080 50.00%');
});

test('a strip that stands on its own says what it shows', () => {
  const html = renderToStaticMarkup(
    <ColorScaleBar
      scale={evenScale(['#000000', '#ffffff'])}
      label="Viridis"
      height={20}
    />,
  );

  expect(html).toContain('role="img"');
  expect(html).toContain('aria-label="Viridis"');
  expect(html).toContain('height:20px');
});
