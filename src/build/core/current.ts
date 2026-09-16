import type { BuildInfo } from './buildInfo.ts';

/**
 * Which build of the site is running, or `undefined` when nothing filled it in.
 *
 * The module is replaced at build time by `cheminfoBuildInfo`, which is what
 * puts the real version, instant and commit here. It stays a real module rather
 * than a virtual one so that a test, a Playwright spec or a backend can import
 * the About record in plain Node: outside a build there is simply no record,
 * and the About page leaves the line out.
 */
export const BUILD_INFO: BuildInfo | undefined = undefined;
