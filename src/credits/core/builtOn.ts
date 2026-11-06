import type { BundledPackage } from '../../build/core/bundledPackages.ts';

import type { CreditEntry } from './credits.ts';

/** One package of a build, written once whatever versions it ships. */
export interface BuiltOnPackage {
  /** Its name on npm. */
  name: string;
  /** Where it is published. */
  href: string;
  /** The versions in the bundle, as they are read: `1.0.1, 2.1.0`. */
  versions: string;
  /**
   * The licence its manifest declares.
   * @default undefined — the manifest declares none
   */
  license?: string;
}

/** The works of one side of the Built on section. */
export interface BuiltOnGroup {
  /** The works a site credits by name, each with a sentence. */
  works: CreditEntry[];
  /** The rest of what the build bundled, by name alone. */
  packages: BuiltOnPackage[];
}

/** The Built on section: what the family maintains, and everything else. */
export interface BuiltOnGroups {
  /** What the family maintains. */
  own: BuiltOnGroup;
  /** What comes from elsewhere. */
  others: BuiltOnGroup;
}

/**
 * Split what a site credits and what its build bundled into ours and others.
 * A package the site already credits by name is not written a second time.
 * @param credited - The works the site names, in its order.
 * @param bundled - The packages the build bundled, in the order of the list.
 * @returns The two groups.
 */
export function builtOnGroups(
  credited: readonly CreditEntry[],
  bundled: readonly BundledPackage[],
): BuiltOnGroups {
  const namedAlready = new Set<string>();
  const own: BuiltOnGroup = { works: [], packages: [] };
  const others: BuiltOnGroup = { works: [], packages: [] };

  for (const entry of credited) {
    namedAlready.add(entry.packageName ?? entry.id);
    (entry.own === true ? own : others).works.push(entry);
  }

  const listed = new Map<string, BuiltOnPackage>();
  for (const { name, version, license, own: isOwn } of bundled) {
    if (namedAlready.has(name)) continue;
    const known = listed.get(name);
    if (known !== undefined) {
      known.versions = `${known.versions}, ${version}`;
      continue;
    }
    const row: BuiltOnPackage = {
      name,
      href: `https://www.npmjs.com/package/${name}`,
      versions: version,
      ...(license === undefined ? {} : { license }),
    };
    listed.set(name, row);
    (isOwn ? own : others).packages.push(row);
  }

  return { own, others };
}
