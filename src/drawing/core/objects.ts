/**
 * The objects of a drawing, kept in one list in the order they are drawn,
 * each saying what it is by its `type`. Which types there are is the site's:
 * every function here takes the site's union of objects and narrows it by
 * `type`, so `objectsOf(drawing, 'picture')` returns the site's pictures.
 */

/** What every object of a drawing carries. */
export interface DrawingObject {
  /** What it is. */
  type: string;
  /** Its identifier, unique in the whole drawing. */
  id: string;
}

/** Anything holding a drawing's objects, in the order they are drawn. */
export interface ObjectList<O extends DrawingObject> {
  /** The objects. */
  objects: readonly O[];
}

/**
 * What a selection holds, by identifier: the objects, and whatever else the
 * site selects (atoms, bonds…), each in a list of its own.
 */
export interface ObjectSelection {
  /** Selected objects, whatever their type. */
  readonly objects: readonly string[];
}

/** The union of the objects a drawing holds. */
export type ObjectIn<D extends { objects: readonly DrawingObject[] }> =
  D['objects'][number];

/** The objects of a union that are of one type. */
export type ObjectOfType<O extends DrawingObject, T extends string> = Extract<
  O,
  { type: T }
>;

/**
 * Whether an object is of one type.
 * @param object - The object, or undefined.
 * @param type - The type.
 * @returns True when the object is one of that type.
 */
export function isObjectOf<O extends DrawingObject, T extends O['type']>(
  object: O | undefined,
  type: T,
): object is ObjectOfType<O, T> {
  return object?.type === type;
}

/**
 * The objects of one type, in the order they are drawn.
 * @param document - The drawing.
 * @param type - The type.
 * @returns The objects.
 */
export function objectsOf<O extends DrawingObject, T extends O['type']>(
  document: ObjectList<O>,
  type: T,
): Array<ObjectOfType<O, T>> {
  const found: Array<ObjectOfType<O, T>> = [];
  for (const object of document.objects) {
    if (isObjectOf(object, type)) found.push(object);
  }
  return found;
}

/**
 * The object of one type that carries an identifier.
 * @param document - The drawing.
 * @param type - The type.
 * @param id - The identifier.
 * @returns The object, or undefined when the drawing has none of that type
 * by that identifier.
 */
export function objectOf<O extends DrawingObject, T extends O['type']>(
  document: ObjectList<O>,
  type: T,
  id: string,
): ObjectOfType<O, T> | undefined {
  for (const object of document.objects) {
    if (object.id === id) return isObjectOf(object, type) ? object : undefined;
  }
  return undefined;
}

/**
 * The selected objects of one type, in the order they are drawn.
 * @param document - The drawing.
 * @param selection - The selection.
 * @param type - The type.
 * @returns The objects.
 */
export function selectedOf<O extends DrawingObject, T extends O['type']>(
  document: ObjectList<O>,
  selection: ObjectSelection,
  type: T,
): Array<ObjectOfType<O, T>> {
  if (selection.objects.length === 0) return [];
  const ids = new Set(selection.objects);
  return objectsOf(document, type).filter((object) => ids.has(object.id));
}

/**
 * The identifiers of the selected objects of one type, in the order they are
 * drawn.
 * @param document - The drawing.
 * @param selection - The selection.
 * @param type - The type.
 * @returns The identifiers.
 */
export function selectedIdsOf<O extends DrawingObject>(
  document: ObjectList<O>,
  selection: ObjectSelection,
  type: O['type'],
): string[] {
  return selectedOf(document, selection, type).map((object) => object.id);
}

/**
 * The one object of a type the selection holds, when it holds nothing else:
 * no other object, and nothing in any other list the selection keeps.
 * @param document - The drawing.
 * @param selection - The selection.
 * @param type - The type.
 * @returns The object, or undefined when the selection holds anything more,
 * or anything else.
 */
export function onlySelectedOf<O extends DrawingObject, T extends O['type']>(
  document: ObjectList<O>,
  selection: ObjectSelection,
  type: T,
): ObjectOfType<O, T> | undefined {
  let held = 0;
  for (const list of Object.values(selection) as unknown[]) {
    if (Array.isArray(list)) held += list.length;
  }
  const [id] = selection.objects;
  if (held !== 1 || id === undefined) return undefined;
  return objectOf(document, type, id);
}

/**
 * A drawing with one object put in the place of the one of the same type and
 * identifier.
 * @param document - The drawing.
 * @param object - The new object.
 * @returns The new drawing; the same objects when none has that identifier.
 */
export function replaceObject<D extends { objects: DrawingObject[] }>(
  document: D,
  object: ObjectIn<D>,
): D {
  return {
    ...document,
    objects: document.objects.map((current) =>
      current.id === object.id && current.type === object.type
        ? object
        : current,
    ),
  };
}

/**
 * A drawing whose objects of one type are replaced by others: they take the
 * places the old ones held in the drawing order, in their own order, and
 * those beyond go on top.
 * @param document - The drawing.
 * @param type - The type replaced.
 * @param objects - The new objects of that type.
 * @returns The new drawing.
 */
export function withObjectsOf<
  D extends { objects: DrawingObject[] },
  T extends ObjectIn<D>['type'],
>(
  document: D,
  type: T,
  objects: ReadonlyArray<ObjectOfType<ObjectIn<D>, T>>,
): D {
  const next: Array<ObjectIn<D>> = [];
  let index = 0;
  for (const object of document.objects) {
    if (object.type !== type) next.push(object);
    else if (index < objects.length) next.push(objects[index++] as ObjectIn<D>);
  }
  for (; index < objects.length; index++) {
    next.push(objects[index] as ObjectIn<D>);
  }
  return { ...document, objects: next };
}

/**
 * A drawing whose objects of one type are each changed.
 * @param document - The drawing.
 * @param type - The type changed.
 * @param map - The change; it returns the object itself to keep it.
 * @returns The new drawing.
 */
export function mapObjects<
  D extends { objects: DrawingObject[] },
  T extends ObjectIn<D>['type'],
>(
  document: D,
  type: T,
  map: (object: ObjectOfType<ObjectIn<D>, T>) => ObjectOfType<ObjectIn<D>, T>,
): D {
  return {
    ...document,
    objects: document.objects.map((object: ObjectIn<D>) =>
      isObjectOf(object, type) ? (map(object) as ObjectIn<D>) : object,
    ),
  };
}

/**
 * A drawing with one object changed.
 * @param document - The drawing.
 * @param type - The type of the object.
 * @param id - Its identifier.
 * @param change - The change.
 * @returns The new drawing.
 */
export function updateObject<
  D extends { objects: DrawingObject[] },
  T extends ObjectIn<D>['type'],
>(
  document: D,
  type: T,
  id: string,
  change: (
    object: ObjectOfType<ObjectIn<D>, T>,
  ) => ObjectOfType<ObjectIn<D>, T>,
): D {
  return mapObjects(document, type, (object) =>
    object.id === id ? change(object) : object,
  );
}
