import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { InlineText } from '../InlineText.tsx';

test('code, strong and emphasis are drawn, and markers stay as typed', () => {
  const html = renderToStaticMarkup(
    <InlineText text="Use `[C]` for **bare** *carbon*, see [[atom]]." />,
  );

  expect(html).toBe(
    'Use <code>[C]</code> for <strong>bare</strong> <em>carbon</em>, see [[atom]].',
  );
});

test('a code span is drawn by renderCode when one is given', () => {
  const html = renderToStaticMarkup(
    <InlineText
      text="Write `\frac{a}{b}` here"
      renderCode={(code) => <span className="latex">{code}</span>}
    />,
  );

  expect(html).toBe(
    String.raw`Write <span class="latex">\frac{a}{b}</span> here`,
  );
});
