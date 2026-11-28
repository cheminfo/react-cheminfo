/**
 * A caption on an editor's canvas, drawn by the family's caption code so it
 * looks there as it does on draw and in a saved figure, with a wider invisible
 * outline it is picked up by. Memoised: it is laid out again only when it
 * changes, not each time the canvas is drawn.
 */

import type { PointerEvent, ReactElement } from 'react';
import { memo } from 'react';

import { pointsAttribute } from '../core/boxes.ts';
import type { DrawText } from '../core/captions.ts';
import { captionMarkup } from '../render/captionMarkup.ts';
import { captionCorners, captionPrimitive } from '../render/captions.ts';
import type { DrawingStyle } from '../render/style.ts';

/** Props of {@link CaptionView}. */
export interface CaptionViewProps {
  /** The caption. */
  caption: DrawText;
  /** The site's drawing style: the font, the size and the ink of a caption. */
  style: DrawingStyle;
  /** Whether it is in hand, which adds `is-selected` to its class. */
  selected: boolean;
  /** The class of an item of the canvas, such as `bench-item`. */
  className: string;
  /**
   * How far around its words the caption is picked up, in points.
   * @default 3
   */
  reach?: number;
  /**
   * The `data-testid` the end-to-end suites find it by.
   * @default 'caption'
   */
  testId?: string;
  /**
   * Whether the group carries `data-x` and `data-y`, where the caption
   * stands, for the end-to-end suites.
   * @default true
   */
  position?: boolean;
  /**
   * Whether it is left out, such as while it is typed into.
   * @default false
   */
  hidden?: boolean;
  /** Called when it is pressed. */
  onGrab: (event: PointerEvent<SVGElement>, id: string) => void;
  /** Called when it is double-clicked. */
  onOpen: (id: string) => void;
}

/** A caption on the canvas: see {@link CaptionViewProps}. */
export const CaptionView = memo(CaptionDrawing);

function CaptionDrawing(props: CaptionViewProps): ReactElement | null {
  const { caption, style, selected, className, onGrab, onOpen } = props;
  const { reach = 3, testId = 'caption', position = true, hidden } = props;
  if (hidden) return null;
  const primitive = captionPrimitive(caption, style);
  return (
    <g
      className={selected ? `${className} is-selected` : className}
      data-testid={testId}
      data-id={caption.id}
      data-x={position ? caption.x : undefined}
      data-y={position ? caption.y : undefined}
      onPointerDown={(event) => {
        onGrab(event, caption.id);
      }}
      onDoubleClick={() => {
        onOpen(caption.id);
      }}
    >
      <polygon
        points={pointsAttribute(captionCorners(primitive, reach))}
        fill="transparent"
        stroke="none"
      />
      <g
        dangerouslySetInnerHTML={{
          __html: captionMarkup(primitive, caption.color ?? style.color),
        }}
      />
    </g>
  );
}
