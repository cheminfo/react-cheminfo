/**
 * What a site imports to show an atomic orbital.
 *
 * **Nothing exported here may pull molstar in statically.** `AtomicOrbitalCanvas`
 * and `createOrbitalViewer` are deliberately absent: re-exporting either would
 * make molstar reachable from this barrel, the `React.lazy` boundary inside
 * `AtomicOrbitalViewer` would be defeated, and every consumer would carry four
 * megabytes it may never render. Type-only re-exports are erased and so are
 * safe.
 */

export type { AtomicOrbitalViewerProps } from './AtomicOrbitalViewer.tsx';
export { AtomicOrbitalViewer } from './AtomicOrbitalViewer.tsx';
export type { ViewerCapability } from './capability.ts';
export { probeViewerCapability } from './capability.ts';
export type { VolumeStyle } from './renderVolume.ts';
export type { OrbitalViewerOptions } from './viewer.ts';
