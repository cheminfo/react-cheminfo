/**
 * Blueprint draws an icon from its SVG paths, and by default fetches the paths
 * of every icon it has, at both sizes, the first time any icon is drawn: some
 * 600 kB of script for the few dozen icons a page shows. Each icon is fetched
 * on its own instead, the first time it is drawn at that size.
 *
 * The site lists the path modules, because only its own build can expand an
 * `import.meta.glob`: two calls over the package's `esnext` copy, without its
 * index, which nothing else imports — a module two chunks share is split off,
 * so an icon also reached through Blueprint's own loaders, or through the
 * index that lists them all, would cost two requests.
 *
 * ```ts
 * loadIconsOneByOne({
 *   standard: import.meta.glob<IconPaths>(
 *     ['/node_modules/@blueprintjs/icons/lib/esnext/generated/16px/paths/*.js', '!**\/index.js'],
 *     { import: 'default', base: '/node_modules/@blueprintjs/icons/lib/esnext/generated/16px/paths' },
 *   ),
 *   large: import.meta.glob<IconPaths>(…the same, under 20px…),
 * });
 * ```
 */

import type { IconName, IconPaths } from '@blueprintjs/icons';
import { IconSize, Icons } from '@blueprintjs/icons';

/** The path module of each icon, keyed `./<name>.js`, as a glob lists them. */
export type IconPathModules = Readonly<
  Record<string, () => Promise<IconPaths>>
>;

/** The path modules at Blueprint's two sizes, its 16 and 20 pixel grids. */
export interface IconPathSets {
  /** The 16-pixel paths, `IconSize.STANDARD`. */
  standard: IconPathModules;
  /** The 20-pixel paths, `IconSize.LARGE`. */
  large: IconPathModules;
}

/**
 * Make Blueprint fetch each icon's paths on their own, when first drawn.
 * @param paths - The site's globs of the path modules, one per size.
 */
export function loadIconsOneByOne(paths: IconPathSets): void {
  Icons.setLoaderOptions({
    loader: (name, size) => iconPaths(paths, name, size),
  });
}

/**
 * The paths of one icon at one size.
 * @param paths - The path modules at both sizes.
 * @param name - The icon.
 * @param size - Blueprint's 16 or 20 pixel grid.
 * @returns Its paths.
 * @throws {Error} When Blueprint has no icon of that name at that size.
 */
export async function iconPaths(
  paths: IconPathSets,
  name: IconName,
  size: IconSize,
): Promise<IconPaths> {
  const modules = size === IconSize.LARGE ? paths.large : paths.standard;
  const load = modules[`./${name}.js`];
  if (load === undefined) {
    throw new Error(`Blueprint has no ${size}px icon named "${name}".`);
  }
  return load();
}
