/**
 * Identifiers for what is added to a drawing: a prefix per kind and the next
 * number nothing in the drawing carries yet. Every identifier is unique in the
 * whole drawing, whatever it names, so every list of it is read.
 */

/**
 * Everything in a drawing that carries an identifier: the members of every
 * list it holds — objects, groups, and the site's own (atoms, bonds…).
 * @param document - The drawing.
 * @returns The identified members.
 */
export function identified(document: object): Array<{ id: string }> {
  const found: Array<{ id: string }> = [];
  for (const value of Object.values(document) as unknown[]) {
    if (!Array.isArray(value)) continue;
    for (const item of value as unknown[]) {
      if (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { id?: unknown }).id === 'string'
      ) {
        found.push(item as { id: string });
      }
    }
  }
  return found;
}

/**
 * Identifiers for things about to be added to a drawing, one allocator per
 * kind.
 * @param document - The drawing they will be added to.
 * @param prefixes - The prefix of each kind's identifiers.
 * @returns An allocator per kind that never repeats itself or the drawing.
 */
export function createIdAllocator<K extends string>(
  document: object,
  prefixes: Readonly<Record<K, string>>,
): Record<K, () => string> {
  const taken = identified(document);
  const allocator = {} as Record<K, () => string>;
  for (const [kind, prefix] of Object.entries(prefixes) as Array<[K, string]>) {
    let counter = highestNumber(taken, prefix);
    allocator[kind] = () => `${prefix}${++counter}`;
  }
  return allocator;
}

/**
 * The next identifier of one kind a drawing has not used.
 * @param document - The drawing.
 * @param prefix - The kind's prefix.
 * @returns The identifier.
 */
export function nextId(document: object, prefix: string): string {
  return createIdAllocator(document, { next: prefix }).next();
}

function highestNumber(
  items: ReadonlyArray<{ id: string }>,
  prefix: string,
): number {
  const pattern = new RegExp(String.raw`^${prefix}(\d+)$`);
  let highest = 0;
  for (const item of items) {
    const value = Number(pattern.exec(item.id)?.[1] ?? 0);
    if (value > highest) highest = value;
  }
  return highest;
}
