import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, test, vi } from 'vitest';

import {
  PeriodicTableGestures,
  PeriodicTableHelp,
} from '../PeriodicTableHelp.tsx';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('the question mark is named after what its card explains', () => {
  const html = renderToStaticMarkup(<PeriodicTableHelp />);

  expect(html).toContain('aria-label="Picking elements"');
  expect(html).toContain('data-testid="periodic-table-help"');
  // The card names it on hover; the browser's own tooltip would stack on it.
  expect(html).not.toContain('title="Picking elements"');
});

test('each target says what a click and a modified click do to it', () => {
  vi.stubGlobal('navigator', { platform: 'Win32' });
  const html = renderToStaticMarkup(<PeriodicTableGestures />);

  // The modifier once, in its column's heading, and the four arrows.
  expect(html.match(/<kbd/gu)).toHaveLength(5);
  expect(html.match(/<th scope="row"/gu)).toHaveLength(5);
  expect(html).toContain(
    's, p, d or f, under the table</th><td style="padding:6px 8px;vertical-align:top;width:33%">Picks that block</td>',
  );
  // The corner has nothing more to give with a key held.
  expect(html).toContain('Picks every element</td>');
  expect(html.match(/>—</gu)).toHaveLength(2);
  expect(html).toContain('What is not picked is dimmed.');
  expect(html).toContain('>Ctrl</kbd>');
});

test('a Mac is shown the key it actually holds', () => {
  vi.stubGlobal('navigator', { platform: 'MacIntel' });
  const html = renderToStaticMarkup(<PeriodicTableGestures />);

  expect(html).toContain('>⌘</kbd>');
  expect(html).not.toContain('Ctrl');
});
