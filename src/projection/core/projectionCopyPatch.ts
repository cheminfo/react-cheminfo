/**
 * Every property of an object made optional, all the way down.
 *
 * It exists for one thing: a site overriding a single sentence of a viewer's
 * copy should not have to restate the other sixty. The name carries its
 * domain because every export of this package shares one flat namespace, and
 * a bare `DeepPartial` there is a collision waiting for the next domain that
 * wants one.
 */
export type ProjectionCopyPatch<T> = {
  [K in keyof T]?: T[K] extends object ? ProjectionCopyPatch<T[K]> : T[K];
};
