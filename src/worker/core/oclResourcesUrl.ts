/** The file OpenChemLib's static resources are served as, at the site's root. */
export const OCL_RESOURCES_FILE = 'openchemlib-resources.json';

/**
 * Where OpenChemLib's static resources sit, as this page is mounted.
 *
 * A worker fetches them, but a worker has no `document` and so cannot read the
 * `<base>` the page carries, and its own script address is no help either: it
 * sits under `assets/` in the build and under `src/` in development. So the
 * page resolves the address and posts it with the job — the argument
 * `registerResources` needs in a worker.
 * @param file - The file, relative to the site's own root.
 * @returns The absolute address, or `undefined` outside a page, where
 * `registerResources` reads the file from the installed package instead.
 */
export function oclResourcesUrl(
  file: string = OCL_RESOURCES_FILE,
): string | undefined {
  const baseUri = globalThis.document?.baseURI;
  return baseUri ? new URL(file, baseUri).href : undefined;
}
