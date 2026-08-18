import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { siteTokensCss } from '../../core/tokens.ts';
import { SiteTheme } from '../SiteTheme.tsx';

test('the site palette lands on the page as a :root rule', () => {
  const html = renderToStaticMarkup(<SiteTheme siteId="surge" />);

  expect(html).toBe(`<style>${siteTokensCss('surge')}</style>`);
  expect(html).toContain('--brand: #4338ca;');
  expect(html).toContain('--brand-alt: #e11d48;');
  expect(html).toContain('--brand-alt-text: #be123c;');
});

test('nothing in the rule is escaped into something a browser cannot read', () => {
  const html = renderToStaticMarkup(<SiteTheme siteId="polycarp" />);

  expect(html).not.toContain('&');
  expect(html).toBe(
    `<style>:root {
  --brand: #701a75;
  --brand-alt: #a3e635;
  --brand-alt-text: #4d7c0f;
  --accent: var(--brand);
}
</style>`,
  );
});
