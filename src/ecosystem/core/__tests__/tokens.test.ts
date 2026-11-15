// tokens-ok: file — the token block is asserted literally.
import { expect, test } from 'vitest';

import { ECOSYSTEM_SITES } from '../sites.ts';
import { siteTokensCss } from '../tokens.ts';

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
  // DerepFlow's mark stands on the slate its name answers in, and the cyan it
  // leads with is the accent on top of it.
  expect(siteTokensCss('derepflow')).toBe(
    `:root {
  --brand: #127ba3;
  --brand-alt: #1e293b;
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
