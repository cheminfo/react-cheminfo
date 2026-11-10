import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import type { PixelBox } from '../../../molecule3d/core/figureFrame.ts';

/** Where the quick render finds the molecule, as fractions of the frame. */
export const MOLECULE_CROP = { x: 0.25, y: 0.1, width: 0.5, height: 0.8 };

export interface StandInOptions {
  /** Whether reading the picture back fails. */
  failRead?: boolean;
}

/**
 * A plugin whose screenshot helper writes down, in order, what it is asked.
 * The quick render moves the crop onto {@link MOLECULE_CROP}, as molstar's
 * does once it has found the molecule.
 * @param options - See {@link StandInOptions}.
 * @returns The plugin and the log of its calls.
 */
export function standInPlugin(options: StandInOptions = {}) {
  const log: string[] = [];
  const multiSample = { mode: 'temporal', sampleLevel: 4 };
  const pass = {
    props: { multiSample },
    setProps(props: { multiSample: { sampleLevel: number } }) {
      log.push(`sample level ${props.multiSample.sampleLevel}`);
    },
    async updateBackground() {
      log.push('background');
    },
    async getImageData(
      _runtime: unknown,
      width: number,
      height: number,
      viewport: PixelBox,
    ) {
      if (options.failRead) throw new Error('the GPU is gone');
      log.push(
        `read ${width}x${height} at ${viewport.x},${viewport.y} ${viewport.width}x${viewport.height}`,
      );
      return { width: viewport.width, height: viewport.height };
    },
  };
  const helper = {
    values: { axes: { name: 'on' }, transparent: true },
    cropParams: { auto: true, relativePadding: 0.1 },
    // What the last picture of the scene left: a whole frame must not read it.
    relativeCrop: { x: 0.4, y: 0.4, width: 0.2, height: 0.2 },
    imagePass: pass,
    behaviors: {
      values: {
        next(values: {
          resolution: { params: { width: number; height: number } };
          axes: { name: string };
          transparent: boolean;
        }) {
          const { width, height } = values.resolution.params;
          const opacity = values.transparent ? 'transparent' : 'opaque';
          log.push(
            `values ${width}x${height}, axes ${values.axes.name}, ${opacity}`,
          );
        },
      },
      cropParams: {
        next(params: { auto: boolean; relativePadding: number }) {
          log.push(
            `crop auto=${params.auto} padding=${params.relativePadding}`,
          );
        },
      },
    },
    async getPreview(_runtime: unknown, side: number) {
      log.push(`preview ${side}`);
      helper.relativeCrop = MOLECULE_CROP;
    },
    resetCrop() {
      log.push('reset crop');
    },
  };
  const plugin = {
    helpers: { viewportScreenshot: helper },
    runTask: (task: { run: () => Promise<unknown> }) => task.run(),
    animationLoop: {
      stop(options: unknown) {
        log.push(`loop stop ${JSON.stringify(options)}`);
      },
      start(options: unknown) {
        log.push(`loop start ${JSON.stringify(options)}`);
      },
    },
  } as unknown as PluginContext;
  return { plugin, log };
}
