import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ExternalLink } from '../../../about/ui/ExternalLink.tsx';
import {
  copyStateIcon,
  copyStateLabel,
} from '../../../clipboard/ui/copyState.ts';
import { CHROME_CATALOG } from '../../../i18n/core/chromeCatalog.ts';
import { catalogTranslate } from '../../../i18n/core/translate.ts';
import { readOutcome } from '../../core/readOutcome.ts';
import { PracticeCheatsheet } from '../PracticeCheatsheet.tsx';
import { ProblemCallout } from '../ProblemCallout.tsx';

test('a cheatsheet is a heading and its lead over the reference grid', () => {
  const html = renderToStaticMarkup(
    <PracticeCheatsheet
      title="The rules on one page"
      lead="What each tool applies. Print it: the chrome is left out."
      sections={[]}
    />,
  );

  expect(html).toContain(
    '<header class="page-head"><h1 class="page__title">The rules on one page</h1><p class="page__lead">What each tool applies. Print it: the chrome is left out.</p></header>',
  );
  expect(html.startsWith('<div class="cheatsheet">')).toBe(true);
});

test('a problem is said in the words the chemistry threw', () => {
  const outcome = readOutcome(() => {
    throw new Error('The bracket after N is never closed.');
  }) as { ok: false; error: unknown };

  expect(outcome.ok).toBe(false);

  const html = renderToStaticMarkup(<ProblemCallout error={outcome.error} />);

  expect(html).toContain('bp6-intent-warning');
  expect(html).toContain('formula-problem');
  expect(html).toContain('The bracket after N is never closed.');
  expect(readOutcome(() => 42)).toStrictEqual({ ok: true, value: 42 });
});

test('a copy button shows how the copy went, in the chrome’s words', () => {
  const t = catalogTranslate(CHROME_CATALOG, 'en');
  const idle = { copied: false, failed: false };

  expect(copyStateIcon(idle)).toBe('clipboard');
  expect(copyStateIcon(idle, 'duplicate')).toBe('duplicate');
  expect(copyStateIcon({ copied: true, failed: false })).toBe('tick');
  expect(copyStateIcon({ copied: false, failed: true })).toBe('cross');
  expect(copyStateLabel(idle, t, 'Copy the SMILES')).toBe('Copy the SMILES');
  expect(copyStateLabel({ copied: true, failed: false }, t, 'x')).toBe(
    'Copied',
  );
  expect(copyStateLabel({ copied: false, failed: true }, t, 'x')).toBe(
    'Copy failed',
  );
});

test('a link to another site opens in a tab of its own', () => {
  expect(
    renderToStaticMarkup(
      <ExternalLink href="https://www.inchi-trust.org">
        The InChI Trust
      </ExternalLink>,
    ),
  ).toBe(
    '<a href="https://www.inchi-trust.org" target="_blank" rel="noopener noreferrer">The InChI Trust</a>',
  );
});
