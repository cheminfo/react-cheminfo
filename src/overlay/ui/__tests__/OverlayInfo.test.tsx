import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { OverlayInfo } from '../OverlayInfo.tsx';
import { OverlayLayer } from '../OverlayLayer.tsx';

test('the explanation waits behind one glyph the reader can reach by keyboard', () => {
  const html = renderToStaticMarkup(
    <OverlayInfo testId="map-info">Each dot is one sample.</OverlayInfo>,
  );

  expect(html.split('<button')).toHaveLength(2);
  expect(html).toContain('bp6-icon-help');
  expect(html).toContain('aria-label="What am I looking at?"');
  expect(html).toContain('data-testid="map-info"');
  expect(html).not.toContain('Each dot is one sample.');
});

test('the glyph is named as the question the reader has', () => {
  const html = renderToStaticMarkup(
    <OverlayInfo label="What is a principal component?">
      A component is a direction.
    </OverlayInfo>,
  );

  expect(html).toContain('aria-label="What is a principal component?"');
  expect(html).toContain('title="What is a principal component?"');
});

test('the glyph shrinks with the chrome around it', () => {
  const compact = renderToStaticMarkup(
    <OverlayLayer density="compact">
      <OverlayInfo>Each dot is one sample.</OverlayInfo>
    </OverlayLayer>,
  );
  const comfortable = renderToStaticMarkup(
    <OverlayLayer>
      <OverlayInfo>Each dot is one sample.</OverlayInfo>
    </OverlayLayer>,
  );

  expect(compact).toContain('min-width:24px;height:24px');
  expect(comfortable).toContain('min-width:30px;height:30px');
});

test('the glyph says whether the explanation it holds is open', () => {
  const html = renderToStaticMarkup(
    <OverlayInfo>Each dot is one sample.</OverlayInfo>,
  );

  expect(html).toContain('aria-haspopup="menu"');
  expect(html).toContain('aria-expanded="false"');
});
