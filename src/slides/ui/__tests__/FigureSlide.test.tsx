import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { FigureLoading, FigureMessage, FigureSlide } from '../FigureSlide.tsx';

const SLIDE_PROPS = {
  talkId: '20261113_proton_nmr',
  slideIndex: 4,
  meta: { title: '¹H NMR in a few slides' },
};

test('the heading is pinned and the text sits beside the figure', () => {
  const body = '## Electrons shield the nucleus\n\n- They oppose B₀';
  const html = renderToStaticMarkup(
    <FigureSlide
      {...SLIDE_PROPS}
      slide={{ layout: 'shielding', body }}
      body={body}
      figure={<svg aria-label="Shielding" />}
    />,
  );

  expect(html).toBe(
    '<div class="slide slide--content figure-slide figure-slide--side" data-layout="shielding"><div class="slide-content"><h2>Electrons shield the nucleus</h2><div class="figure-slide__body"><div class="figure-slide__text"><ul>\n<li>They oppose B₀</li>\n</ul></div><div class="figure-slide__figure"><svg aria-label="Shielding"></svg></div></div></div></div>',
  );
});

test('a demo link is lifted under the figure and carries the slide', () => {
  const body = '## The viewer\n\n[Open it](/)';
  const html = renderToStaticMarkup(
    <FigureSlide
      {...SLIDE_PROPS}
      slide={{ layout: 'molecules', body }}
      body={body}
      figure={<svg />}
      placement="below"
    />,
  );

  expect(html).toContain('figure-slide--below');
  expect(html).not.toContain('figure-slide__text');
  expect(html).toContain(
    '<div class="slide-demos"><span class="slide-demos-label">Live demos:</span><a class="slide-demo" href="/?from=talk:20261113_proton_nmr:4">',
  );
});

test('a figure slide played on another site opens its demo on the site that published it', () => {
  const body = '## The viewer\n\n[Open it](/pulse)';
  const html = renderToStaticMarkup(
    <FigureSlide
      {...SLIDE_PROPS}
      site="nmr"
      talkOrigin="https://nmr.cheminfo.org"
      slide={{ layout: 'molecules', body }}
      body={body}
      figure={<svg />}
    />,
  );

  expect(html).toContain(
    'href="https://nmr.cheminfo.org/pulse?from=talk:nmr:20261113_proton_nmr:4"',
  );
});

test('a figure that cannot be drawn says so, and one loading keeps its room', () => {
  expect(
    renderToStaticMarkup(<FigureMessage>No such dataset</FigureMessage>),
  ).toBe('<p class="chem-figure-message">No such dataset</p>');
  expect(renderToStaticMarkup(<FigureLoading />)).toBe(
    '<div class="chem-figure-loading" aria-busy="true"></div>',
  );
});
