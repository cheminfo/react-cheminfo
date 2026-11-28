/**
 * The key numbers a card leads with: a value a student quotes is copied by a
 * click, named after its label; a count is not; and a card with none draws
 * nothing. A line while the answer is computed says what is done.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CardFacts } from '../CardFacts.tsx';
import { CardStatus } from '../CardStatus.tsx';
import { CardWaiting } from '../CardWaiting.tsx';

test('a quoted value is copied by a click, its title naming it after its label', () => {
  const html = renderToStaticMarkup(
    <CardFacts facts={[{ label: 'HOMO', value: '−12.18 eV', detail: 'b1' }]} />,
  );

  expect(html).toMatch(
    /^<div class="card-facts"><span class="card-fact"><span class="card-fact__label">HOMO<\/span><span class="click-to-copy click-to-copy--inline card-fact__value" role="button" tabindex="0" title="Copy the homo \(−12.18 eV\)">−12.18 eV/,
  );
  expect(html).toContain(
    '<span class="card-fact__detail">b1</span></span></div>',
  );
});

test('a count is written, not copied, and has no qualifier unless given one', () => {
  const html = renderToStaticMarkup(
    <CardFacts facts={[{ label: 'σ bonds', value: '11', copy: false }]} />,
  );

  expect(html).toBe(
    '<div class="card-facts"><span class="card-fact"><span class="card-fact__label">σ bonds</span><span class="card-fact__value">11</span></span></div>',
  );
});

test('the values keep the order they are given in', () => {
  const html = renderToStaticMarkup(
    <CardFacts
      facts={[
        { label: 'Atomic weight', value: '55.845' },
        { label: 'Unpaired electrons', value: '4', copy: false },
      ]}
    />,
  );

  expect(html.indexOf('Atomic weight')).toBeLessThan(
    html.indexOf('Unpaired electrons'),
  );
  expect(html.match(/class="card-fact"/g)).toHaveLength(2);
});

test('a card with no value to give draws no line at all', () => {
  expect(renderToStaticMarkup(<CardFacts facts={[]} />)).toBe('');
});

test('a waiting line is a small spinner beside what is being done', () => {
  const html = renderToStaticMarkup(<CardWaiting>Converting…</CardWaiting>);

  expect(html).toMatch(/^<div class="card__wait"><div aria-label="loading"/);
  expect(html).toMatch(
    /class="bp6-spinner" role="progressbar" aria-hidden="true"/,
  );
  expect(html).toMatch(/<\/div><\/div>Converting…<\/div>$/);
});

test('a card waiting on its answer may say what it is doing', () => {
  const html = renderToStaticMarkup(
    <CardStatus waiting="Searching the list…" />,
  );

  expect(html).toContain('<div class="card__wait">');
  expect(html).toContain('Searching the list…');
  expect(html).not.toContain('aria-label="Reading the answer"');
  expect(html).toContain('data-testid="card-details"');
});

test('a failure is said even when the card was told what it was doing', () => {
  const html = renderToStaticMarkup(
    <CardStatus waiting="Converting…" failure="Open Babel refused it." />,
  );

  expect(html).toContain('Open Babel refused it.');
  expect(html).not.toContain('Converting…');
  expect(html).not.toContain('bp6-spinner');
});
