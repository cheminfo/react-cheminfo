/**
 * The marks of the pictures of a drawing: a dashed frame around each one
 * selected or under the pointer, turned with it, and the handles of a picture
 * selected on its own.
 */

import type { ReactElement } from 'react';

import { pictureHandles } from '../core/pictureHandles.ts';
import type { DrawPicture } from '../core/pictures.ts';
import { pictureCorners, pictureToDrawing } from '../core/pictures.ts';

import { DashedOutline, HandleMark } from './DashedOutline.tsx';

/** Props of {@link PictureMarks}. */
export interface PictureMarksProps {
  /** Every picture of the drawing shown. */
  pictures: readonly DrawPicture[];
  /** The identifiers of the objects selected. */
  selected: readonly string[];
  /**
   * The identifier of the picture under the pointer.
   * @default undefined — none
   */
  hovered?: string;
  /**
   * The picture whose handles are drawn: one selected on its own.
   * @default undefined — no handles
   */
  handled?: DrawPicture;
  /** Points per screen pixel, so marks keep their size when zoomed. */
  pixel: number;
  /** The group holding each grouped object, by the object's identifier. */
  parents: ReadonlyMap<string, string>;
}

/**
 * The frame around each selected or hovered picture, and the handles of the
 * picture selected on its own: eight that resize it, and one above it, on a
 * stem, that turns it.
 * @param props - See {@link PictureMarksProps}.
 * @returns The marks.
 */
export function PictureMarks(props: PictureMarksProps): ReactElement {
  const { pictures, hovered, handled, pixel, parents } = props;
  const selected = new Set(props.selected);
  const stem =
    handled && pictureToDrawing(handled, { x: 0, y: -handled.height / 2 });
  return (
    <>
      {pictures.map((picture) => {
        if (!selected.has(picture.id) && hovered !== picture.id) return null;
        return (
          <DashedOutline
            key={picture.id}
            points={pictureCorners(picture)}
            pixel={pixel}
            hovered={!selected.has(picture.id)}
            grouped={parents.has(picture.id)}
          />
        );
      })}
      {handled && stem
        ? pictureHandles(handled, pixel).map(({ handle, point }) => (
            <HandleMark
              key={handle}
              handle={handle}
              point={point}
              pixel={pixel}
              rotation={handled.rotation ?? 0}
              stem={stem}
            />
          ))
        : null}
    </>
  );
}
