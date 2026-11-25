import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { OverlayToggle } from '../OverlayToggle.tsx';

test('a toggle drawn as a button says its name in the type of the bar it sits on, not in Blueprint’s', () => {
  const html = renderToStaticMarkup(
    <OverlayToggle
      label="Workflow"
      icon="fork"
      checked={false}
      onChange={() => null}
    />,
  );

  expect(/<button[^>]*style="(?<style>[^"]*)"/.exec(html)?.groups?.style).toBe(
    'font-size:12px',
  );
});
