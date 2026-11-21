import { expect, test } from 'vitest';

import { markdownOfHtml } from '../citationMarkup.ts';

test('italics and bold become Markdown, raised runs stay HTML, entities read', () => {
  expect(
    markdownOfHtml(
      'Patiny, L. &#38; Borel, A. <i>J. Chem. Inf. Model.</i> <b>53</b>, 1223 (2013); CO<sub>2</sub> at 10<sup>5</sup> Pa.',
    ),
  ).toBe(
    'Patiny, L. & Borel, A. *J. Chem. Inf. Model.* **53**, 1223 (2013); CO<sub>2</sub> at 10<sup>5</sup> Pa.',
  );
});

test('every other element is dropped and its text kept', () => {
  expect(
    markdownOfHtml(
      '<div class="csl-entry"><span style="font-variant:small-caps;">Smith</span>, J.</div>',
    ),
  ).toBe('Smith, J.');
});
