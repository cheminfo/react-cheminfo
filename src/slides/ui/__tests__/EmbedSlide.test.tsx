import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { EmbedSlide } from '../EmbedSlide.tsx';

test('the tool runs on the slide, under whatever the slide says', () => {
  const html = renderToStaticMarkup(
    <EmbedSlide
      slide={{
        layout: 'embed',
        body: '# Try it while I talk\n\nhttps://smiles.cheminfo.org/?embed=1&smiles=c1ccccc1',
      }}
    />,
  );

  expect(html).toContain('<h1>Try it while I talk</h1>');
  expect(html).toContain(
    'src="https://smiles.cheminfo.org/?embed=1&amp;smiles=c1ccccc1"',
  );
  expect(html).toContain('title="smiles.cheminfo.org, embedded"');
  expect(html).not.toContain('smiles.cheminfo.org</a>');
});

test('a slide that frames nothing says so instead of drawing an empty box', () => {
  const html = renderToStaticMarkup(
    <EmbedSlide slide={{ layout: 'embed', body: '# Nothing here' }} />,
  );

  expect(html).toContain('This slide frames a tool, but carries no address.');
  expect(html).not.toContain('<iframe');
});
