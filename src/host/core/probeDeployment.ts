/**
 * Why a framed tool is of no use to its host, asked of the server it comes
 * from: a site that cannot be reached is not one whose page is too old to
 * answer, and a reader told which is told what to wait for.
 */

import type { BuildInfo } from '../../build/core/buildInfo.ts';
import { BUILD_INFO_FILE, readBuildInfo } from '../../build/core/buildInfo.ts';

/**
 * How long the server has to answer, in milliseconds, before it counts as
 * unreachable.
 */
export const PROBE_TIMEOUT = 8000;

/** What the server of a framed tool says about the deployment it serves. */
export type Deployment =
  | {
      /** Nothing answered at that address. */
      reachable: false;
    }
  | {
      /** The server answered. */
      reachable: true;
      /**
       * What the deployment says it is, or `undefined` when it publishes no
       * record this page can read.
       */
      build: BuildInfo | undefined;
    };

/**
 * Ask the server of a framed tool what it is serving: its `build-info.json`,
 * which every site of the family publishes to any origin, and failing that
 * whether anything answers at all.
 * @param url - The address the tool is framed at.
 * @param signal - Aborted once the answer is no longer wanted.
 * @returns What the server says; never rejects.
 */
export async function probeDeployment(
  url: string,
  signal?: AbortSignal,
): Promise<Deployment> {
  const origin = new URL(url, globalThis.location?.href).origin;
  const timeout = AbortSignal.timeout(PROBE_TIMEOUT);
  const asked =
    signal === undefined ? timeout : AbortSignal.any([signal, timeout]);
  try {
    const response = await fetch(new URL(`/${BUILD_INFO_FILE}`, origin), {
      cache: 'no-store',
      signal: asked,
    });
    const value: unknown = response.ok
      ? await response.json().catch(() => undefined)
      : undefined;
    return { reachable: true, build: readBuildInfo(value) };
  } catch {
    // Refused across origins, or nothing answered: an opaque request tells.
  }
  try {
    await fetch(origin, { mode: 'no-cors', cache: 'no-store', signal: asked });
    return { reachable: true, build: undefined };
  } catch {
    return { reachable: false };
  }
}
