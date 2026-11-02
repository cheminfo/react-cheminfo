/**
 * Until its answer comes a card says where it stands — reading, or why it
 * could not — and a page with no card says so; the way to the site's page is
 * offered in every case.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CardMissing } from '../CardMissing.tsx';
import { CardStatus } from '../CardStatus.tsx';

test('a card waiting on its answer spins, and offers the page', () => {
  const html = renderToStaticMarkup(<CardStatus />);

  expect(html).toContain('aria-label="Reading the answer"');
  expect(html).toContain('bp6-spinner');
  expect(html).toContain('data-testid="card-details"');
  expect(html).not.toContain('bp6-callout');
});

test('a card whose answer failed says why, from an error or from words', () => {
  const fromError = renderToStaticMarkup(
    <CardStatus failure={new Error('No molecule 42.')} />,
  );
  const fromWords = renderToStaticMarkup(
    <CardStatus failure="The search did not run." />,
  );

  expect(fromError).toContain('No molecule 42.');
  expect(fromWords).toContain('The search did not run.');

  for (const html of [fromError, fromWords]) {
    expect(html).toContain('bp6-intent-warning');
    expect(html).toContain('data-testid="card-details"');
    expect(html).not.toContain('bp6-spinner');
  }
});

test('a card nested in another one leaves the way to the page to it', () => {
  const html = renderToStaticMarkup(
    <CardStatus failure="No compound 5." details={false} />,
  );

  expect(html).toContain('No compound 5.');
  expect(html).not.toContain('card__end');
  expect(html).not.toContain('data-testid="card-details"');
});

test('a page with no card says so, and leads to the page', () => {
  const html = renderToStaticMarkup(<CardMissing />);

  expect(html).toContain(
    '<p class="card__note">This page has no card: open it in a new tab.</p>',
  );
  expect(html).toContain('data-testid="card-details"');
});
