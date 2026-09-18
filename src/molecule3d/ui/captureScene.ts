/**
 * A picture of the scene, rendered off screen at a size of its own.
 */

import type { PluginContext } from 'molstar/lib/mol-plugin/context.js';

import type { ImageSize } from '../core/exportImage.ts';

/**
 * Render the scene without its selection highlights or its axes.
 * @param plugin - The molstar context.
 * @param size - Pixel size of the picture.
 * @returns The PNG as a data URI.
 * @throws {Error} When the plugin has no screenshot helper.
 */
export async function captureScene(
  plugin: PluginContext,
  size: ImageSize,
): Promise<string> {
  const helper = plugin.helpers.viewportScreenshot;
  if (helper === undefined) {
    throw new Error('This viewer cannot take a picture of its scene.');
  }
  helper.behaviors.values.next({
    ...helper.values,
    resolution: { name: 'custom', params: size },
    axes: { name: 'off', params: {} },
    transparent: false,
  });
  return helper.getImageDataUri();
}
