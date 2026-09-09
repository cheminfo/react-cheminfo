import type { ProjectionVariablesView } from './projectionOptions.ts';
import type { ProjectionLoadings } from './projectionResult.ts';

/**
 * The view that can actually be drawn from what the result carries.
 *
 * Three of the four views need something beyond the weights, and a result is
 * free not to publish it: `effect` walks from the average sample along the
 * component, so it needs both the average and the spread; `rescaled` undoes a
 * scaling, so it needs the scaling; `sample` rebuilds one sample from the
 * components, so it needs the average and a sample to rebuild. What is missing
 * falls back to `weights`, which every result can fill.
 *
 * It is one function because it is one question, asked twice — once by the
 * settings bar deciding which views to offer, and once by the panels deciding
 * what to draw. Two answers is not a tidiness problem: a bar that offers a
 * view the panels refuse leaves a reader picking `sample` and watching the
 * weights redraw, with nothing anywhere saying why.
 *
 * `sampleScores` is what tells the two callers apart, and leaving it out is a
 * third answer rather than a shorthand for none. The bar cannot know what is
 * selected — a selection is not part of a result — so it omits the argument
 * and asks only whether the *result* could support the view at all. The panels
 * always know, so they pass what is selected, and an empty array is a real
 * answer: nothing to rebuild, so nothing to draw.
 * @param view - The view that was asked for.
 * @param loadings - What loads onto each axis, or nothing when the result
 * published none.
 * @param sampleScores - The selected sample's scores; empty for a selection of
 * nothing, omitted by a caller that cannot see the selection.
 * @returns The view to draw, which is the one asked for or `weights`.
 */
export function drawableVariablesView(
  view: ProjectionVariablesView,
  loadings: ProjectionLoadings | undefined,
  sampleScores?: readonly number[],
): ProjectionVariablesView {
  if (loadings === undefined || view === 'weights') return 'weights';
  if (view === 'rescaled') {
    return loadings.scales === undefined ? 'weights' : 'rescaled';
  }
  if (view === 'effect') {
    const walkable =
      loadings.mean !== undefined && loadings.spread !== undefined;
    return walkable ? 'effect' : 'weights';
  }
  // `sample` is rebuilt from the average and the sample's own scores. It never
  // reads the spread, which is what walking to the ends of a component needs
  // and this does not do.
  if (loadings.mean === undefined) return 'weights';
  if (sampleScores === undefined) return 'sample';
  return sampleScores.length > 0 ? 'sample' : 'weights';
}
