/**
 * Marks the box one pane of a chart stack is drawn in.
 *
 * A stack is laid out in `chartStackLevel.tsx` and read again, from the outside,
 * by whatever takes a picture of the editor the stack sits in — `drawingIn` has
 * to know that a box holding a chromatogram over a spectrum holds two drawings
 * rather than one, and this mark is how it tells. It sits in a file of its own
 * so that neither of them has to import the other's React.
 */
export const CHART_PANE_ATTRIBUTE = 'data-chart-pane';
