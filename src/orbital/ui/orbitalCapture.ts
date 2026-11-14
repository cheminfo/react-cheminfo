/**
 * The picture of an atomic orbital's canvas, made when a page asks for it:
 * the figure a host such as draw or write takes, and the PNG beside it on the
 * clipboard.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import type { ImageSize } from '../../molecule3d/core/exportImage.ts';
import type { SceneCapture } from '../../molecule3d/ui/exportMoleculeImage.ts';
import {
  captureMoleculePng,
  captureMoleculeSvg,
} from '../../molecule3d/ui/exportMoleculeImage.ts';
import type { Molecule3DCapture } from '../../molecule3d/ui/moleculeViewer3DProps.ts';
import { captureFigure, captureScene } from '../../molstar/core/index.ts';

import type { OrbitalViewer } from './viewer.ts';

/** How many frames a picture waits, at most, for the camera to come to rest. */
const SETTLE_FRAMES = 60;

/** What {@link orbitalCapture} reads at the moment a picture is asked for. */
export interface OrbitalCaptureSource {
  /** The element the canvas is drawn in, once mounted. */
  container: () => HTMLElement | null;
  /** The viewer, while there is one. */
  viewer: () => Pick<OrbitalViewer, 'run'> | null;
}

/**
 * Picture an atomic orbital's canvas, as the 3D molecule viewer pictures its
 * own: the part of the scene with the orbital, axes included when they are
 * on screen.
 * @param source - The canvas and its viewer, read when a picture is asked.
 * @returns The capture a site keeps for the figure it hands on.
 */
export function orbitalCapture(
  source: OrbitalCaptureSource,
): Molecule3DCapture {
  const scene = (): [SceneCapture, ImageSize] => {
    const viewer = source.viewer();
    const box = source.container()?.getBoundingClientRect();
    if (viewer === null || box === undefined || box.width <= 0) {
      throw new Error('There is no orbital to picture yet.');
    }
    const pictures: SceneCapture = {
      captureImage: (size) =>
        viewer.run(async (plugin) => {
          await settled(plugin);
          return captureScene(plugin, size);
        }),
      captureFigure: (size, longest) =>
        viewer.run(async (plugin) => {
          await settled(plugin);
          return captureFigure(plugin, size, longest);
        }),
    };
    const size = {
      width: Math.round(box.width),
      height: Math.round(box.height),
    };
    return [pictures, size];
  };
  return {
    svg: async (scale) => {
      const [pictures, size] = scene();
      return captureMoleculeSvg(pictures, scale, size);
    },
    png: async (scale) => {
      const [pictures, size] = scene();
      return captureMoleculePng(pictures, scale, size);
    },
  };
}

/**
 * Wait for the camera to come to rest, then for one frame more to be drawn, so
 * the scene's bounds count the orbital just added: taken earlier, the picture
 * is cut by near and far planes measured on an empty scene, and the lobes come
 * out as hollow rings.
 * @param plugin - The molstar context.
 */
async function settled(plugin: PluginContext): Promise<void> {
  const camera = plugin.canvas3d?.camera;
  for (let frame = 0; frame < SETTLE_FRAMES; frame++) {
    if (camera?.transition.inTransition !== true) break;
    // eslint-disable-next-line no-await-in-loop -- one frame at a time, until the camera rests.
    await nextFrame();
  }
  await nextFrame();
  await nextFrame();
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      resolve();
    });
  });
}
