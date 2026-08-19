import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { Talk } from '../../core/index.ts';
import { Slideshow } from '../Slideshow.tsx';

function talkOf(slideCount: number): Talk {
  const slides = [];
  for (let index = 0; index < slideCount; index++) {
    slides.push({ layout: 'content', body: `## Slide ${index + 1}` });
  }
  return { meta: { title: 'Mass spectrometry' }, slides };
}

test('the counter reads the slide showing out of the whole talk', () => {
  const html = renderToStaticMarkup(
    <Slideshow talk={talkOf(12)} index={2} onIndex={() => undefined} />,
  );

  expect(html).toContain('<span class="slideshow-counter">3 / 12</span>');
  expect(html).toContain('<h2>Slide 3</h2>');
});

test('the bar reads the talk title, and the site may override it', () => {
  const talk = talkOf(3);

  expect(
    renderToStaticMarkup(
      <Slideshow talk={talk} index={0} onIndex={() => undefined} />,
    ),
  ).toContain('<div class="slideshow-title">Mass spectrometry</div>');

  expect(
    renderToStaticMarkup(
      <Slideshow
        talk={talk}
        index={0}
        onIndex={() => undefined}
        title="ChemCalc at ASMS"
      />,
    ),
  ).toContain('<div class="slideshow-title">ChemCalc at ASMS</div>');
});

test('an index a link carried past the end lands on the last slide', () => {
  const html = renderToStaticMarkup(
    <Slideshow talk={talkOf(4)} index={99} onIndex={() => undefined} />,
  );

  expect(html).toContain('<span class="slideshow-counter">4 / 4</span>');
  expect(html).toContain('<h2>Slide 4</h2>');
});

test('the progress bar stands where the talk stands', () => {
  const html = renderToStaticMarkup(
    <Slideshow talk={talkOf(5)} index={1} onIndex={() => undefined} />,
  );

  expect(html).toContain(
    '<div class="slideshow-progress" style="--progress:25%"></div>',
  );
});

test('the Exit button appears only for a site that offers a way out', () => {
  const talk = talkOf(2);

  expect(
    renderToStaticMarkup(
      <Slideshow talk={talk} index={0} onIndex={() => undefined} />,
    ),
  ).not.toContain('Exit');

  expect(
    renderToStaticMarkup(
      <Slideshow
        talk={talk}
        index={0}
        onIndex={() => undefined}
        onExit={() => undefined}
      />,
    ),
  ).toContain('Exit');
});

test('the notes are the presenter’s, and are never on the slide', () => {
  const talk: Talk = {
    meta: { title: 'Talk' },
    slides: [{ layout: 'content', body: '## One', notes: 'Say the numbers.' }],
  };

  const html = renderToStaticMarkup(
    <Slideshow talk={talk} index={0} onIndex={() => undefined} />,
  );

  expect(html).not.toContain('Say the numbers.');
});

test('the class a site gives reaches the player', () => {
  const html = renderToStaticMarkup(
    <Slideshow
      talk={talkOf(1)}
      index={0}
      onIndex={() => undefined}
      className="talk-page-player"
    />,
  );

  expect(html).toContain('class="slideshow talk-page-player"');
});

test('a talk with no slides still draws its player', () => {
  const html = renderToStaticMarkup(
    <Slideshow
      talk={{ meta: { title: 'Empty' }, slides: [] }}
      index={0}
      onIndex={() => undefined}
    />,
  );

  expect(html).toContain('<span class="slideshow-counter">0 / 0</span>');
  expect(html).toContain(
    '<div class="slide-canvas" style="transform:scale(1)">',
  );
});
