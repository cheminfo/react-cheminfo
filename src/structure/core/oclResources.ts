import { Resources } from 'openchemlib';

/**
 * Register OpenChemLib's static resources once, without which
 * `ConformerGenerator` and `ForceFieldMMFF94` throw on construction.
 *
 * Repeated calls share the first call's promise; a failed registration is
 * forgotten so a later call can retry.
 * @param url - Where to fetch `resources.json`. Omit under Node.js to read it
 * from the installed package; in a browser or a worker it is required.
 * @returns A promise that settles once the resources are usable.
 */
export function registerResources(url?: string): Promise<void> {
  registration ??= register(url).catch((error: unknown) => {
    registration = null;
    throw error;
  });
  return registration;
}

let registration: Promise<void> | null = null;

async function register(url?: string): Promise<void> {
  if (url !== undefined) {
    await Resources.registerFromUrl(url);
    return;
  }
  const runtime = globalThis as { process?: { versions?: { node?: string } } };
  if (runtime.process?.versions?.node === undefined) {
    throw new Error(
      'registerResources needs a url outside Node.js: a browser page or worker cannot read resources.json from node_modules',
    );
  }
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  Resources.registerFromNodejs(
    require
      .resolve('openchemlib')
      .replace(/openchemlib\.js$/, 'resources.json'),
  );
}
