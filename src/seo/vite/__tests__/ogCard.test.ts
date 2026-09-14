// tokens-ok: file — a card is a document with no stylesheet, so its colours are literals.
import { expect, test } from 'vitest';

import { siteById } from '../../../ecosystem/core/lookup.ts';
import { ogCardHtml } from '../ogCard.ts';

test('the card colours the name the way the wordmark does', async () => {
  const derepflow = siteById('derepflow');
  const html = await ogCardHtml({ site: 'derepflow' });

  expect(derepflow.name.ink).toBe('lead');
  expect(html).toContain('.lead { color: #16202c; }');
  expect(html).toContain(`.alt { color: ${derepflow.brand}; }`);
});

test('an address-shaped name keeps its faint dot and its two colours', async () => {
  const smiles = siteById('smiles');
  const html = await ogCardHtml({ site: smiles });

  expect(html).toContain(`.lead { color: ${smiles.brand}; }`);
  expect(html).toContain(`.alt { color: ${smiles.brandAlt}; }`);
  expect(html).toContain('.dot { color: #8a96a3; }');
  expect(html).toContain('<span class="dot">.</span>');
});
