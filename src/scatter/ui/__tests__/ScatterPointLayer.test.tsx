import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ScatterPointLayer } from '../ScatterPointLayer.tsx';

const POINTS = {
  x: new Float64Array([10, 20, 30]),
  y: new Float64Array([10, 20, 30]),
};

test('a shaped point is drawn as its shape, filled with its group colour', () => {
  const html = renderToStaticMarkup(
    <svg>
      <ScatterPointLayer
        points={POINTS}
        groupOf={[0, 0, 0]}
        colors={['#0072b2']}
        shapeOf={[1, 0, 7]}
        shapes={['dot', 'square']}
      />
    </svg>,
  );

  expect(html).toContain(
    '<path d="M6.9 6.9L13.1 6.9L13.1 13.1L6.9 13.1Z" fill="#0072b2"',
  );
  // The first shape is a disc, and an index past the shapes falls back to one.
  expect(html.split('<circle').length - 1).toBe(2);
});

test('a shaped point placed after fitting keeps its shape, drawn hollow', () => {
  const html = renderToStaticMarkup(
    <svg>
      <ScatterPointLayer
        points={POINTS}
        groupOf={[0, 0, 0]}
        colors={['#0072b2']}
        shapeOf={[1, 1, 1]}
        shapes={['dot', 'square']}
        outlinedFrom={2}
      />
    </svg>,
  );

  expect(html).toContain(
    'fill="none" stroke="#0072b2" stroke-width="1.5"></path>',
  );
  expect(html.split('fill="#0072b2"').length - 1).toBe(2);
});
