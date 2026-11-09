import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { StepsSlide } from '../StepsSlide.tsx';

const BODY = `## A reflux

1. Double-click the **flask**
2. Click the condenser
3. Click the mantle

https://glassware.cheminfo.org/?embed=1&demo=reflux`;

test('the step on show is lit, the ones before are done, and the tool is framed', () => {
  const html = renderToStaticMarkup(
    <StepsSlide
      slide={{ layout: 'steps', body: BODY }}
      talkId="reflux"
      slideIndex={4}
      meta={{ title: 'Reflux' }}
      step={1}
      onStep={() => undefined}
    />,
  );

  expect(html).toContain('<h2>A reflux</h2>');
  expect(html).toContain(
    '<li class="slide-step slide-step--done"><button type="button" class="slide-step-button"><span class="slide-step-number">1</span><span class="slide-step-text">Double-click the <strong>flask</strong></span></button></li>',
  );
  expect(html).toContain(
    '<li class="slide-step slide-step--current" aria-current="step">',
  );
  expect(html).toContain(
    '<li class="slide-step"><button type="button" class="slide-step-button"><span class="slide-step-number">3</span>',
  );
  expect(html).toContain(
    'src="https://glassware.cheminfo.org/?embed=1&amp;demo=reflux"',
  );
});

test('without an address, the slide is the walked list alone', () => {
  const html = renderToStaticMarkup(
    <StepsSlide
      slide={{ layout: 'steps', body: '- one\n- two' }}
      talkId="t"
      slideIndex={0}
      meta={{ title: 'T' }}
    />,
  );

  expect(html).toContain('class="slide slide--steps slide--steps-alone"');
  expect(html).not.toContain('<iframe');
  expect(html).toContain('disabled=""');
});
