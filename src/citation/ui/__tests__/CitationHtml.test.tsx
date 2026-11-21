// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CitationHtml } from '../CitationHtml.tsx';

test('the emphasis of the style is drawn, and nothing else of the markup', () => {
  expect(
    renderToStaticMarkup(
      <CitationHtml html='Patiny, L. &#38; Borel, A. <i>J. Chem. Inf. Model.</i> <b>53</b>, CO<sub>2</sub>; <a href="https://example.org" onclick="alert(1)">link</a><script>alert(1)</script>' />,
    ),
  ).toBe(
    'Patiny, L. &amp; Borel, A. <em>J. Chem. Inf. Model.</em> <strong>53</strong>, CO<sub>2</sub>; <span>link</span><span>alert(1)</span>',
  );
});
