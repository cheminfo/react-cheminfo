/**
 * The frames and handles of the pictures of a drawing.
 */

import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { pictureHandles } from '../../core/pictureHandles.ts';
import { centredPicture, pictureCorners } from '../../core/pictures.ts';
import { DashedOutline, HandleMark } from '../DashedOutline.tsx';
import { PictureMarks } from '../PictureMarks.tsx';

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const FIRST = centredPicture('i1', PNG, 40, 20);
const SECOND = { ...centredPicture('i2', PNG, 10, 10), x: 50 };
const NO_GROUPS = new Map<string, string>();

test('nothing is drawn round a picture neither selected nor under the pointer', () => {
  expect(
    renderToStaticMarkup(
      <PictureMarks
        pictures={[FIRST, SECOND]}
        selected={[]}
        pixel={1}
        parents={NO_GROUPS}
      />,
    ),
  ).toBe('');
});

test('a hovered picture is framed as hovered, a selected one as selected, in its group', () => {
  const html = renderToStaticMarkup(
    <PictureMarks
      pictures={[FIRST, SECOND]}
      selected={['i2']}
      hovered="i1"
      pixel={0.5}
      parents={new Map([['i2', 'g1']])}
    />,
  );

  expect(html).toBe(
    renderToStaticMarkup(
      <>
        <DashedOutline
          points={pictureCorners(FIRST)}
          pixel={0.5}
          hovered
          grouped={false}
        />
        <DashedOutline
          points={pictureCorners(SECOND)}
          pixel={0.5}
          hovered={false}
          grouped
        />
      </>,
    ),
  );
});

test('the picture selected on its own carries its nine handles, the turning one on a stem', () => {
  const html = renderToStaticMarkup(
    <PictureMarks
      pictures={[FIRST]}
      selected={['i1']}
      handled={FIRST}
      pixel={1}
      parents={NO_GROUPS}
    />,
  );
  const handles = pictureHandles(FIRST, 1);

  expect(handles).toHaveLength(9);
  expect(html).toBe(
    renderToStaticMarkup(
      <>
        <DashedOutline
          points={pictureCorners(FIRST)}
          pixel={1}
          hovered={false}
          grouped={false}
        />
        {handles.map(({ handle, point }) => (
          <HandleMark
            key={handle}
            handle={handle}
            point={point}
            pixel={1}
            rotation={0}
            stem={{ x: 0, y: -10 }}
          />
        ))}
      </>,
    ),
  );
});
