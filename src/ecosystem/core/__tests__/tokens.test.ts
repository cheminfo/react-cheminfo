import { expect, test } from 'vitest';

import { ECOSYSTEM_SITES } from '../sites.ts';
import { siteThemeColor, siteTokensCss } from '../tokens.ts';

test('a site whose answering colour is too light for text carries both forms', () => {
  expect(siteTokensCss('inchi')).toBe(
    `:root {
  --brand: #5b21b6;
  --brand-alt: #fcd34d;
  --brand-alt-text: #a16207;
  --accent: var(--brand);
}
`,
  );
});

test('a site whose answering colour is already readable carries one form', () => {
  expect(siteTokensCss('lcao')).toBe(
    `:root {
  --brand: #1565c0;
  --brand-alt: #c62828;
  --accent: var(--brand);
}
`,
  );
});

test('a mark that gives the plate the answering colour still reads right', () => {
  // NMRium's mark is its own logo: the plate is the plum, and the orange it
  // leads with is the accent on top of it.
  expect(siteTokensCss('nmrium')).toBe(
    `:root {
  --brand: #ea580c;
  --brand-alt: #2b143e;
  --accent: var(--brand);
}
`,
  );
});

test('every site declares its palette and binds the accent to the lead', () => {
  for (const site of ECOSYSTEM_SITES) {
    const css = siteTokensCss(site.id);

    expect(css).toContain(`--brand: ${site.brand};`);
    expect(css).toContain('--accent: var(--brand);');
    expect(css.startsWith(':root {\n')).toBe(true);
    expect(css.endsWith('}\n')).toBe(true);
    expect(css).not.toContain('undefined');
  }
});

test('the browser chrome takes the leading colour', () => {
  expect(siteThemeColor('vcl')).toBe('#2d72d2');
  expect(siteThemeColor('regexp')).toBe('#1e3a8a');

  for (const site of ECOSYSTEM_SITES) {
    expect(siteThemeColor(site.id)).toBe(site.brand);
  }
});
