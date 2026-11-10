/**
 * A figure of the scene: the part of it holding the molecule — or the whole
 * pane as the viewer shows it — rendered no larger than a figure needs and
 * encoded to travel.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';
import { Task } from 'molstar/lib/mol-task/index.js';

import type { ImageSize } from '../../molecule3d/core/exportImage.ts';
import type { RenderedFigure } from '../../molecule3d/core/figureFrame.ts';
import {
  FIGURE_IMAGE_QUALITY,
  FIGURE_IMAGE_TYPE,
  figureFrame,
} from '../../molecule3d/core/figureFrame.ts';

import { pictureHelper } from './captureScene.ts';

/** The longest side of the quick render that finds the molecule, in pixels. */
const PREVIEW_SIDE = 512;

/** The margin left around the molecule, as a fraction of its own size. */
const FIGURE_PADDING = 0.04;

/**
 * How many times the figure is drawn to smooth its edges, as molstar counts
 * them: level 2 is 4 draws. molstar's own screenshots take 16, which costs four
 * times as long and changes nothing to see at a figure's size.
 */
const FIGURE_SAMPLE_LEVEL = 2;

/** The whole frame, as a crop. */
const WHOLE_FRAME = { x: 0, y: 0, width: 1, height: 1 };

/** How {@link captureFigure} frames the figure. */
export interface CaptureFigureOptions {
  /**
   * Keep the whole frame, background included, exactly as the viewer shows
   * it, rather than the part holding the molecule.
   * @default false
   */
  wholeFrame?: boolean;
}

/**
 * Render the part of the scene holding the molecule, as the viewer frames it,
 * no larger than `longest` on its longer side, as a JPEG.
 *
 * A quick render finds where the molecule stands; the frame is then rendered
 * at the size that brings that part to `longest` at most, and only that part
 * is read back and encoded. With `wholeFrame`, nothing is looked for and the
 * whole frame is kept.
 * @param plugin - The molstar context.
 * @param size - The frame asked for, in pixels: the viewer times a scale.
 * @param longest - The longest side the figure may have, in pixels.
 * @param options - See {@link CaptureFigureOptions}.
 * @returns The figure.
 * @throws {Error} When the plugin has no screenshot helper.
 */
export async function captureFigure(
  plugin: PluginContext,
  size: ImageSize,
  longest: number,
  options: CaptureFigureOptions = {},
): Promise<RenderedFigure> {
  const { wholeFrame = false } = options;
  const helper = pictureHelper(plugin, size);
  const cropParams = helper.cropParams;
  helper.behaviors.cropParams.next({
    auto: !wholeFrame,
    relativePadding: FIGURE_PADDING,
  });
  try {
    return await plugin.runTask(
      Task.create('Render a figure', async (runtime) => {
        let crop = WHOLE_FRAME;
        if (!wholeFrame) {
          await helper.getPreview(runtime, PREVIEW_SIDE);
          crop = helper.relativeCrop;
        }
        const frame = figureFrame(size, crop, longest);
        const pass = helper.imagePass;
        const { multiSample } = pass.props;
        pass.setProps({
          multiSample: { ...multiSample, sampleLevel: FIGURE_SAMPLE_LEVEL },
        });
        const loop = plugin.animationLoop;
        loop.stop({ noDraw: true });
        try {
          await pass.updateBackground();
          const image = await pass.getImageData(
            runtime,
            frame.width,
            frame.height,
            frame.viewport,
          );
          return {
            dataUri: encoded(image),
            width: image.width,
            height: image.height,
          };
        } finally {
          loop.start({ immediate: true });
          pass.setProps({ multiSample });
        }
      }),
    );
  } finally {
    // Every other picture of the scene is the whole frame.
    helper.behaviors.cropParams.next(cropParams);
    helper.resetCrop();
  }
}

function encoded(image: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext('2d');
  if (context === null) {
    throw new Error('This browser cannot encode the picture.');
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL(FIGURE_IMAGE_TYPE, FIGURE_IMAGE_QUALITY);
}
