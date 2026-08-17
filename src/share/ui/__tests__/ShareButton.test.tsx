import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ShareButton } from '../ShareButton.tsx';

const TITLE = 'Share a link to this page, or embed it in your own site';

test('the button of a site bar is a nav link: the glyph, then the label', () => {
  const html = renderToStaticMarkup(<ShareButton onClick={() => undefined} />);

  expect(html).toBe(
    `<button type="button" class="nav-link" title="${TITLE}" aria-label="Share">` +
      '<span aria-hidden="true" class="bp6-icon bp6-icon-share" data-icon="share"></span>' +
      'Share</button>',
  );
});

test('the Blueprint variant is a minimal button, not a nav link', () => {
  const html = renderToStaticMarkup(
    <ShareButton variant="blueprint" onClick={() => undefined} />,
  );

  expect(html).toContain('bp6-button');
  expect(html).toContain('bp6-minimal');
  expect(html).toContain('bp6-icon-share');
  expect(html).not.toContain('class="nav-link"');
});

test('a compact button drops its text and keeps its name', () => {
  const html = renderToStaticMarkup(
    <ShareButton compact onClick={() => undefined} />,
  );

  expect(html).toContain('aria-label="Share"');
  expect(html).toContain(`title="${TITLE}"`);
  expect(html).not.toContain('>Share<');
});

test('the label and the title a caller writes replace the defaults', () => {
  const html = renderToStaticMarkup(
    <ShareButton
      label="Partager"
      title="Partager cette page"
      onClick={() => undefined}
    />,
  );

  expect(html).toContain('Partager');
  expect(html).toContain('title="Partager cette page"');
  expect(html).not.toContain(TITLE);
});

test('the class a site gives reaches both variants', () => {
  const navLink = renderToStaticMarkup(
    <ShareButton className="share-entry" onClick={() => undefined} />,
  );
  const blueprint = renderToStaticMarkup(
    <ShareButton
      variant="blueprint"
      className="share-entry"
      onClick={() => undefined}
    />,
  );

  expect(navLink).toContain('class="nav-link share-entry"');
  expect(blueprint).toContain('share-entry');
});
