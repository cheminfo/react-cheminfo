import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { SlideView } from '../Slide.tsx';
import { SlideBody } from '../SlideBody.tsx';

function render(body: string): string {
  return renderToStaticMarkup(<SlideBody body={body} />);
}

test('a script tag is removed together with its content', () => {
  const html = render('Before\n\n<script>alert(1)</script>\n\nAfter');

  expect(html).toBe('<p>Before</p>\n\n<p>After</p>');
});

test('an onerror attribute is removed and the image kept', () => {
  const html = render(
    '<img src="/spectrum.png" alt="Spectrum" onerror="alert(1)">',
  );

  expect(html).toContain('<img src="/spectrum.png" alt="Spectrum"/>');
  expect(html).not.toContain('onerror');
  expect(html).not.toContain('alert');
});

test('a javascript: URL is removed from raw and Markdown links', () => {
  const html = render(
    '<a href="javascript:alert(1)">raw</a> [markdown](javascript:alert(1))',
  );

  expect(html).toBe(
    '<p><a target="_blank" rel="noreferrer">raw</a> <a target="_blank" rel="noreferrer">markdown</a></p>',
  );
});

test('a frame to a host outside the family, or to a script, is dropped', () => {
  const html = render(
    [
      '<iframe src="https://example.com/"></iframe>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<iframe src="//example.com/"></iframe>',
      '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    ].join('\n\n'),
  );

  expect(html).not.toContain('<iframe');
  expect(html).not.toContain('alert');
});

test('a frame to a cheminfo host survives in the prose', () => {
  const html = render(
    '<iframe src="https://www.chemcalc.org/?embed=1&mf=C6H12O6" title="ChemCalc" width="800" onload="alert(1)"></iframe>',
  );

  expect(html).toBe(
    '<iframe src="https://www.chemcalc.org/?embed=1&amp;mf=C6H12O6" title="ChemCalc" width="800"></iframe>',
  );
});

test('what decks write in raw HTML is kept', () => {
  const html = render(
    [
      'Water is H<sub>2</sub>O, the radical cation M<sup>+•</sup><br>',
      '<figure><img src="https://example.com/figure.png" alt="Pattern" width="400"><figcaption>An isotopic pattern</figcaption></figure>',
      '<table><thead><tr><th>Ion</th></tr></thead><tbody><tr><td><code>[M+H]+</code></td></tr></tbody></table>',
      '<div class="poster-note"><strong>Poster</strong> <a href="https://aga2s.cheminfo.org">aga2s</a></div>',
    ].join('\n\n'),
  );

  expect(html).toContain(
    '<p>Water is H<sub>2</sub>O, the radical cation M<sup>+•</sup><br/></p>',
  );
  expect(html).toContain(
    '<figure><img src="https://example.com/figure.png" alt="Pattern" width="400"/><figcaption>An isotopic pattern</figcaption></figure>',
  );
  expect(html).toContain(
    '<table><thead><tr><th>Ion</th></tr></thead><tbody><tr><td><code>[M+H]+</code></td></tr></tbody></table>',
  );
  expect(html).toContain(
    '<div class="poster-note"><strong>Poster</strong> <a href="https://aga2s.cheminfo.org" target="_blank" rel="noreferrer">aga2s</a></div>',
  );
});

test('the embed layout still frames its tool under sanitised prose', () => {
  const html = renderToStaticMarkup(
    <SlideView
      slide={{
        layout: 'embed',
        body: '# Compute it while I talk\n\nType C6H12O6<script>alert(1)</script>\n\nhttps://www.chemcalc.org/?embed=1&mf=C6H12O6',
      }}
      talkId="reading-a-molecular-formula"
      slideIndex={3}
      meta={{ title: 'From a formula to a mass' }}
    />,
  );

  expect(html).toBe(
    '<div class="slide slide--embed"><div class="slide-content"><h1>Compute it while I talk</h1>\n<p>Type C6H12O6</p><iframe class="slide-embed-frame" src="https://www.chemcalc.org/?embed=1&amp;mf=C6H12O6" title="www.chemcalc.org, embedded" allow="clipboard-write; fullscreen"></iframe></div></div>',
  );
});
