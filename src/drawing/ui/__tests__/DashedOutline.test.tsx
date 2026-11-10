/**
 * The dashed line around what is selected or under the pointer, and the
 * handles of a selection frame, both kept at their screen size when zoomed.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { DashedOutline, HandleMark } from '../DashedOutline.tsx';

test('an outline through corners is a polygon dashed at its screen size', () => {
  expect(
    renderToStaticMarkup(
      <DashedOutline
        pixel={0.5}
        points={[
          { x: 0, y: 0 },
          { x: 10, y: 0 },
          { x: 5, y: 5 },
        ]}
        box={{ x: 0, y: 0, width: 1, height: 1 }}
      />,
    ),
  ).toBe(
    '<polygon class="draw-frame" stroke-width="0.75" stroke-dasharray="2 1.5" points="0,0 10,0 5,5"></polygon>',
  );
});

test('an outline around a box stands off it by the pad', () => {
  expect(
    renderToStaticMarkup(
      <DashedOutline
        pixel={1}
        box={{ x: 10, y: 20, width: 30, height: 40 }}
        pad={2}
        weight={2}
        className="draw-lasso"
      />,
    ),
  ).toBe(
    '<rect class="draw-frame draw-lasso" stroke-width="2" stroke-dasharray="4 3" x="8" y="18" width="34" height="44"></rect>',
  );
  expect(renderToStaticMarkup(<DashedOutline pixel={1} />)).toBe('');
});

test('an outline under the pointer is muted, and one a group holds is faint', () => {
  const box = { x: 0, y: 0, width: 1, height: 1 };

  expect(
    renderToStaticMarkup(<DashedOutline pixel={1} box={box} hovered grouped />),
  ).toContain('class="draw-frame draw-frame--hover"');
  expect(
    renderToStaticMarkup(<DashedOutline pixel={1} box={box} grouped />),
  ).toContain('class="draw-frame draw-frame--grouped"');
});

test('a resize handle is a square, turned with what it resizes', () => {
  const stem = { x: 0, y: 0 };

  expect(
    renderToStaticMarkup(
      <HandleMark
        handle="se"
        point={{ x: 10, y: 20 }}
        pixel={0.5}
        stem={stem}
      />,
    ),
  ).toBe(
    '<rect class="draw-handle" data-handle="se" x="8" y="18" width="4" height="4" stroke-width="0.75"></rect>',
  );
  expect(
    renderToStaticMarkup(
      <HandleMark
        handle="n"
        point={{ x: 10, y: 20 }}
        pixel={1}
        stem={stem}
        rotation={30}
      />,
    ),
  ).toBe(
    '<rect class="draw-handle" data-handle="n" x="6" y="16" width="8" height="8" stroke-width="1.5" transform="rotate(30 10 20)"></rect>',
  );
});

test('the rotate handle is a ring on a stem', () => {
  expect(
    renderToStaticMarkup(
      <HandleMark
        handle="rotate"
        point={{ x: 10, y: -20 }}
        pixel={1}
        stem={{ x: 10, y: 0 }}
      />,
    ),
  ).toBe(
    '<g data-handle="rotate"><line class="draw-frame" x1="10" y1="0" x2="10" y2="-20" stroke-width="1.5"></line><circle class="draw-handle" cx="10" cy="-20" r="4.8" stroke-width="1.5"></circle></g>',
  );
});
