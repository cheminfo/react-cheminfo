import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { CurveShape } from '../../core/curveShape.ts';
import { curveHandleMarks } from '../curveHandleMarks.tsx';

const ARC: CurveShape = {
  points: [
    { x: 0, y: 0 },
    { x: 10, y: -10 },
    { x: 20, y: 0 },
  ],
  controls: [
    null,
    { before: { x: 6, y: -10 }, after: { x: 14, y: -10 } },
    null,
  ],
  closed: false,
};

test('each point is a square, each control point a ring on an arm', () => {
  const markup = renderToStaticMarkup(<svg>{curveHandleMarks(ARC, 1)}</svg>);

  expect(markup.match(/<rect /g)).toHaveLength(3);
  expect(markup.match(/<circle /g)).toHaveLength(4);
  expect(markup.match(/class="draw-tangent"/g)).toHaveLength(4);
  expect(markup).toContain(
    '<g data-vertex="1" data-control="set"><line class="draw-tangent" x1="10" y1="-10" x2="6" y2="-10" stroke-width="1"></line>',
  );
  expect(markup).toContain('<g data-vertex="0" data-control="auto">');
});

test('a mark keeps its size on screen and carries the name it is given', () => {
  const markup = renderToStaticMarkup(
    <svg>
      {curveHandleMarks(
        ARC,
        0.5,
        (handle) => `${handle.vertex}-${handle.part}`,
      )}
    </svg>,
  );

  expect(markup).toContain(
    '<rect data-handle="1-point" class="draw-handle draw-handle--point" x="8.25" y="-11.75" width="3.5" height="3.5" stroke-width="0.75"></rect>',
  );
  expect(markup).toContain(
    '<circle data-handle="1-before" class="draw-handle" cx="6" cy="-10" r="2" stroke-width="0.75"></circle>',
  );
});
