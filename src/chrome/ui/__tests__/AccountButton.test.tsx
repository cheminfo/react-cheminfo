import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { AccountButton } from '../AccountButton.tsx';

test('nobody signed in is an invitation written out in words', () => {
  const html = renderToStaticMarkup(
    <AccountButton identity={null} signInHref="/login" />,
  );

  expect(html).toBe(
    '<a class="nav-link account-button account-button--out" href="/login">Sign in</a>',
  );
});

test('the invitation carries no glyph, so the bar cannot reduce it to one', () => {
  const html = renderToStaticMarkup(<AccountButton identity={null} />);

  expect(html).not.toContain('bp6-icon');
  expect(html).not.toContain('nav-link--icon');
});

test('a site names who its accounts are for', () => {
  const html = renderToStaticMarkup(
    <AccountButton identity={null} signInLabel="Teacher sign in" />,
  );

  expect(html).toContain('Teacher sign in');
});

test('somebody signed in is their own initials, and their name on hover', () => {
  const html = renderToStaticMarkup(
    <AccountButton
      identity={{ name: 'Ada Lovelace', detail: 'ada@epfl.ch' }}
    />,
  );

  expect(html).toContain('<span class="account-mark">AL</span>');
  expect(html).toContain('title="Signed in as Ada Lovelace"');
  expect(html).toContain('aria-label="Signed in as Ada Lovelace"');
});

test('the mark a site writes itself is the one drawn', () => {
  const html = renderToStaticMarkup(
    <AccountButton identity={{ name: 'Ada Lovelace', initials: 'LOV' }} />,
  );

  expect(html).toContain('>LOV<');
});

test('a name written as one word keeps two letters, and an address its local part', () => {
  expect(
    renderToStaticMarkup(<AccountButton identity={{ name: 'admin' }} />),
  ).toContain('>AD<');
  expect(
    renderToStaticMarkup(<AccountButton identity={{ name: 'bo@epfl.ch' }} />),
  ).toContain('>BO<');
});

test('neither state is drawn while the site is still asking', () => {
  const html = renderToStaticMarkup(<AccountButton identity={null} loading />);

  expect(html).toBe(
    '<span class="account-button__pending" aria-hidden="true"></span>',
  );
  expect(html).not.toContain('Sign in');
});
