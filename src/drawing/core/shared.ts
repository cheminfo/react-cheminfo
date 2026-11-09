/**
 * Several objects changed together: what they have in common, so a panel
 * shows one value for all of them and says when they differ, and a change
 * that is the same for each or worked out from each.
 */

/** A change to objects: the same for each, or worked out from each. */
export type Patching<P, T> = P | ((object: T) => P);

/**
 * The value every object has, read the same way from each.
 * @param objects - The objects.
 * @param read - What is read from each, its default filled in, so that
 * undefined is never a value.
 * @returns The value they all have, or undefined when they differ or there
 * are none.
 */
export function sharedValue<T, V>(
  objects: readonly T[],
  read: (object: T) => V,
): V | undefined {
  const [first] = objects;
  if (first === undefined) return undefined;
  const value = read(first);
  for (let index = 1; index < objects.length; index++) {
    if (read(objects[index] as T) !== value) return undefined;
  }
  return value;
}

/**
 * The ids of objects, to change them together.
 * @param objects - The objects.
 * @returns Their ids, in their order.
 */
export function idsOf(objects: ReadonlyArray<{ id: string }>): string[] {
  return objects.map((object) => object.id);
}

/**
 * The change one object takes.
 * @param patch - The change, the same for each or worked out from each.
 * @param object - The object.
 * @returns The change.
 */
export function patchOf<P extends object, T>(
  patch: Patching<P, T>,
  object: T,
): P {
  return typeof patch === 'function' ? patch(object) : patch;
}
