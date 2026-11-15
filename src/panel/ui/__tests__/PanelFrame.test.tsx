import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PanelFrame } from '../PanelFrame.tsx';

test('a panel draws its toolbar off the print, over its body', () => {
  const html = renderToStaticMarkup(
    <PanelFrame toolbar={<button type="button">Add</button>} testId="parts">
      <p>Lens</p>
    </PanelFrame>,
  );

  expect(html).toContain('data-testid="parts"');
  expect(html).toMatch(
    /^<div style="[^"]+" data-testid="parts"><div style="[^"]+" class="no-print"><button type="button">Add<\/button><\/div><div style="[^"]+"><p>Lens<\/p><\/div><\/div>$/,
  );
});

test('a panel with no actions has no toolbar row', () => {
  const html = renderToStaticMarkup(
    <PanelFrame>
      <p>Empty</p>
    </PanelFrame>,
  );

  expect(html).not.toContain('no-print');
  expect(html).toMatch(
    /^<div style="[^"]+"><div style="[^"]+"><p>Empty<\/p><\/div><\/div>$/,
  );
});
