/**
 * How an axis is read: linearly or logarithmically, who decided, where it
 * starts and ends, and where its marks land.
 *
 * It is a domain of its own rather than part of any chart, because the library
 * draws figures with three different renderers and the sites draw more with
 * libraries of their own — and the two things that go wrong on a logarithmic
 * axis go wrong the same way in all of them.
 */

export type {
  AxisMarkPositions,
  AxisMarkPositionsOptions,
  AxisPoint,
} from './axisMarks.ts';
export { axisMarkPositions } from './axisMarks.ts';
export type { AxisScale, AxisScaleChoice } from './axisScale.ts';
export { isAxisScale, resolveAxisScale } from './axisScale.ts';
export type { LogAxisBounds, LogAxisBoundsOptions } from './logAxisBounds.ts';
export { logAxisBounds } from './logAxisBounds.ts';
