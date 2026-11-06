/** One package a build hands to its visitors, as `packages.json` lists it. */
export interface BundledPackage {
  /** Its name on npm. */
  name: string;
  /** The version in the bundle. */
  version: string;
  /**
   * The licence its manifest declares.
   * @default undefined — the manifest declares none
   */
  license?: string;
  /** Whether it comes from one of the organisations the family maintains. */
  own: boolean;
}

/** Where a build lists the packages it bundled, next to `build-info.json`. */
export const BUNDLED_PACKAGES_FILE = 'packages.json';

/** Where a build gathers the licence texts of those packages. */
export const LICENSE_TEXTS_FILE = 'licenses.txt';

/**
 * Read a package list off what a server answered. The list is fetched, so a
 * proxy's error page or an older build must read as no list rather than throw.
 * @param value - The parsed answer.
 * @returns The packages, or `undefined` when this is not a package list.
 */
export function readBundledPackages(
  value: unknown,
): BundledPackage[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const packages: BundledPackage[] = [];
  for (const candidate of value as unknown[]) {
    if (!isBundledPackage(candidate)) return undefined;
    packages.push(candidate);
  }
  return packages;
}

function isBundledPackage(candidate: unknown): candidate is BundledPackage {
  if (typeof candidate !== 'object' || candidate === null) return false;
  const { name, version, license, own } = candidate as Record<string, unknown>;
  return (
    typeof name === 'string' &&
    typeof version === 'string' &&
    typeof own === 'boolean' &&
    (license === undefined || typeof license === 'string')
  );
}
