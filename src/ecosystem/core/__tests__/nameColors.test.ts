// tokens-ok: file — the expected colours are the family's literal values.
import { expect, test } from 'vitest';

import { siteById } from '../lookup.ts';
import { siteNameColors } from '../nameColors.ts';

test('a site with no ink half writes its two colours, and reads the dot from the page', () => {
  expect(siteNameColors(siteById('chemcalc'))).toStrictEqual({
    lead: '#5b52e0',
    alt: '#d63384',
    dot: 'var(--text-faint, #8a96a3)',
  });
});

test('the half a logo leaves uncoloured takes the ink, and the brand moves to the other', () => {
  expect(siteNameColors(siteById('derepflow'))).toStrictEqual({
    lead: 'var(--text, #16202c)',
    alt: '#127ba3',
    dot: 'var(--text-faint, #8a96a3)',
  });
});

test('a card with no stylesheet of ours gets the same colours written out', () => {
  expect(
    siteNameColors(siteById('derepflow'), { colors: 'literal' }),
  ).toStrictEqual({ lead: '#16202c', alt: '#127ba3', dot: '#8a96a3' });
  expect(
    siteNameColors(siteById('chemcalc'), { colors: 'literal' }),
  ).toStrictEqual({ lead: '#5b52e0', alt: '#d63384', dot: '#8a96a3' });
});
