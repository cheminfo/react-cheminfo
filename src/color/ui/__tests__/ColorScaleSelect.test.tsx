import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ColorScaleSelect } from '../ColorScaleSelect.tsx';

function noop(): void {
  // The picker is read here, never clicked.
}

test('the button carries the name of the scale in force, and draws it', () => {
  const html = renderToStaticMarkup(
    <ColorScaleSelect value="plasma" onChange={noop} label="Colour scale" />,
  );

  expect(html).toContain('Plasma');
  expect(html).toContain('Colour scale');
  expect(html).toContain('#0d0887 0.00%');
});

test('a scale of the reader’s own is named as one', () => {
  const html = renderToStaticMarkup(
    <ColorScaleSelect value="hsv-long,0-0000ff,1-ff0000" onChange={noop} />,
  );

  expect(html).toContain('Custom');
  expect(html).toContain('#0000ff 0.00%');
  expect(html).toContain('#ff0000 100.00%');
});

test('a link naming a scale nobody offers still draws the default', () => {
  const html = renderToStaticMarkup(
    <ColorScaleSelect value="nonsense" onChange={noop} />,
  );

  expect(html).toContain('Viridis');
  expect(html).toContain('#440154 0.00%');
});

test('the button is reachable by the test id and named for a screen reader', () => {
  const html = renderToStaticMarkup(
    <ColorScaleSelect value="viridis" onChange={noop} testId="color-scale" />,
  );

  expect(html).toContain('data-testid="color-scale"');
  expect(html).toContain('aria-label="Colour scale"');
});
