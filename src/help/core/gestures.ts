/**
 * The vocabulary a help panel lists gestures in: the keys, drawn as caps, the
 * mouse words between them, and what the gesture does.
 */

/** A key, drawn as a key cap. */
export interface GestureKey {
  key: string;
}

/** One gesture and what it does. */
export interface Gesture {
  /** How the help's catalog names it, unique within its list. */
  id: string;
  /** Keys, and plain text for the mouse part; unique within one gesture. */
  input: ReadonlyArray<string | GestureKey>;
  /** What it does, in English; the catalog answers for the other languages. */
  action: string;
}

/**
 * A key for the row of one gesture, unique in a list where the ids repeat
 * across sections.
 * @param gesture - The gesture.
 * @returns Its input and its action, written out.
 */
export function gestureRowKey(gesture: Gesture): string {
  const parts: string[] = [];
  for (const part of gesture.input) {
    parts.push(typeof part === 'string' ? part : part.key);
  }
  return `${parts.join(' ')} ${gesture.action}`;
}
