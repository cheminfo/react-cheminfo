/**
 * The narrowest a tool framed on a slide is laid out, in its own pixels.
 * Narrower, a tool takes the layout it has on a phone: panels stacked under
 * the figure, which a frame of fixed height has no room for.
 */
export const MIN_TOOL_WIDTH = 1024;

/** How a tool is drawn in the room a slide gives its frame. */
export interface ToolFrame {
  /** The tool's own width, in its CSS pixels. */
  width: number;
  /** The tool's own height, in its CSS pixels. */
  height: number;
  /** How much the frame is scaled on the canvas to fill its room. */
  scale: number;
}

/**
 * Size a tool framed on a slide so the player's scale does not shrink it.
 *
 * The player scales the whole canvas to the screen. A tool runs at its own
 * size whenever the screen is smaller than the canvas, and is enlarged with
 * the slide on a screen bigger than it. Only when its room on screen is
 * narrower than {@link MIN_TOOL_WIDTH} is it shrunk, just enough to keep the
 * layout it has on a desktop.
 * @param room - The room the frame has on the canvas, in canvas pixels.
 * @param room.width - Its width.
 * @param room.height - Its height.
 * @param slideScale - How much the player scales the canvas.
 * @returns The tool's own size, and the scale that fits it in its room.
 */
export function toolFrame(
  room: { width: number; height: number },
  slideScale: number,
): ToolFrame {
  const onScreen = room.width * slideScale;
  const zoom = Math.min(Math.max(1, slideScale), onScreen / MIN_TOOL_WIDTH);
  return {
    width: onScreen / zoom,
    height: (room.height * slideScale) / zoom,
    scale: zoom / slideScale,
  };
}
