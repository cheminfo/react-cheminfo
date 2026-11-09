import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SlideView } from '../Slide.tsx';

test('a title slide ending with an address frames the tool beside the title', () => {
  const html = renderToStaticMarkup(
    <SlideView
      slide={{
        layout: 'title',
        body: '# Build a reflux\n\n## glassware.cheminfo.org\n\nhttps://glassware.cheminfo.org/?embed=1&setup=reflux',
      }}
      talkId="reflux"
      slideIndex={0}
      meta={{ title: 'Build a reflux' }}
    />,
  );

  expect(html).toContain('class="slide slide--title slide--title-tool"');
  expect(html).toContain('<h1>Build a reflux</h1>');
  expect(html).toContain(
    'src="https://glassware.cheminfo.org/?embed=1&amp;setup=reflux"',
  );
  expect(html).not.toContain(
    'glassware.cheminfo.org/?embed=1&amp;setup=reflux</a>',
  );
});

test('a title slide without an address stays the centred title', () => {
  const html = renderToStaticMarkup(
    <SlideView
      slide={{ layout: 'title', body: '# Build a reflux' }}
      talkId="reflux"
      slideIndex={0}
      meta={{ title: 'Build a reflux' }}
    />,
  );

  expect(html).toContain('class="slide slide--title"');
  expect(html).not.toContain('<iframe');
});
