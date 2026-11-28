import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { PLAYER_LAYOUTS } from '../../core/playerLayouts.ts';
import { SlideView } from '../Slide.tsx';

function render(body: string): string {
  return renderToStaticMarkup(
    <SlideView
      slide={{ layout: 'end', body }}
      talkId="20261124_reports"
      slideIndex={8}
      meta={{ title: 'Reports' }}
    />,
  );
}

test('the player draws the closing slide: the recap, then a card per site', () => {
  const html = render(
    '# What you can do now\n\n- Number a molecule\n- Caption a scheme\n\n<!-- sites: write, draw -->',
  );

  expect(html).toContain(
    '<div class="slide slide--end"><div class="slide-content end-slide"><div class="end-slide__recap"><h1>What you can do now</h1>',
  );
  expect(html).not.toContain('sites:');
  expect(html.match(/class="end-slide__site"/g)).toHaveLength(2);
  expect(html).toContain('href="https://write.cheminfo.org/"');
  expect(html).toContain(
    '<span class="end-slide__host">draw.cheminfo.org</span>',
  );
});

test('a site outside the family is skipped rather than breaking the slide', () => {
  const html = render('# Done\n\n<!-- sites: nowhere, draw -->');

  expect(html.match(/class="end-slide__site"/g)).toHaveLength(1);
  expect(html).toContain('href="https://draw.cheminfo.org/"');
});

test('every layout the player draws is listed, the closing slide included', () => {
  expect([...PLAYER_LAYOUTS].toSorted()).toStrictEqual([
    'content',
    'embed',
    'end',
    'quote',
    'section',
    'steps',
    'thanks',
    'title',
  ]);
});
