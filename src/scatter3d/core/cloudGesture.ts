/**
 * What a drag over a cloud does.
 *
 * Two gestures want the same drag. Turning the box is the one a reader reaches
 * for first and must stay a plain drag; drawing a lasso is the one the flat map
 * has already taught them. Neither can be given a modifier without taking one
 * that already means "add to the selection" or "take out of it", so the choice
 * is a control the reader can see rather than a shortcut somebody has to tell
 * them about — and inside a lasso the modifiers keep exactly the meaning they
 * have on the map.
 */
export type CloudGesture =
  /** Turn the box. A tap still picks the sample under it. */
  | 'turn'
  /** Draw a lasso, exactly as on the map. */
  | 'select';
