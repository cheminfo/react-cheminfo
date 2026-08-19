import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { BackToSlides } from '../BackToSlides.tsx';

test('a page nobody reached from a slide draws nothing at all', () => {
  const html = renderToStaticMarkup(
    <BackToSlides origin={null} href="/talk/asms-2026?slide=4" />,
  );

  expect(html).toBe('');
});

test('the pill points at the slide the demo was opened from', () => {
  const html = renderToStaticMarkup(
    <BackToSlides
      origin={{ talkId: 'asms-2026', slide: 4 }}
      href="/talk/asms-2026?slide=4"
    />,
  );

  expect(html).toContain(
    '<a class="back-to-slides no-print" href="/talk/asms-2026?slide=4" title="Back to slide 5">',
  );
  expect(html).toContain('Back to slides');
});

test('a talk given by another site is still one click away', () => {
  const html = renderToStaticMarkup(
    <BackToSlides
      origin={{ talkId: 'enumeration', slide: 0, site: 'surge' }}
      href="https://surge.cheminfo.org/talk/enumeration?slide=0"
    />,
  );

  expect(html).toContain(
    'href="https://surge.cheminfo.org/talk/enumeration?slide=0"',
  );
  expect(html).toContain('title="Back to slide 1"');
});
