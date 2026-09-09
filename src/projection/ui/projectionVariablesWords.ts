/**
 * What the "what differs" tab says about its own panels: the sentence over
 * them, the key naming their colours, and the name under the horizontal axis.
 *
 * They are separated from what the panels draw because every one of them is a
 * claim about the picture rather than part of it, and a claim is worth reading
 * — and testing — on its own. A caption that promises bars over a panel of
 * lines is a bug nobody sees in a series array.
 */

import type { OverlayLegendEntry } from '../../overlay/ui/OverlayLegend.tsx';
import type { LoadingProfiles } from '../core/loadingProfiles.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import { fillCopy } from '../core/projectionCopy.ts';
import type { VariableAxis } from '../core/variableAxis.ts';

/**
 * The tab's own sentence, which has to describe the view the reader is looking
 * at and the shape it is drawn in.
 *
 * Both matter, and neither can stand in for the other. Two of the four views
 * draw a sample profile as a line whatever the measurements are, so a sentence
 * chosen from the axis alone promises bars over a panel of lines. The other two
 * draw weights, and there the axis decides: named measurements become bars and
 * a number line stays a line.
 * @param built - The panels as they were built, for the view and the axis.
 * @param copy - The words the tab writes.
 * @returns The sentence.
 */
export function variablesCaption(
  built: LoadingProfiles,
  copy: ProjectionCopy,
): string {
  const { axis, view } = built;
  if (view === 'effect') return copy.intro.variablesEffect;
  if (view === 'sample') return copy.intro.variablesSample;
  if (axis.kind === 'named') return copy.intro.variablesNamed;
  return fillCopy(copy.intro.variablesContinuous, { axis: plural(axis.label) });
}

/**
 * The sentence naming what colour and shape mean, which is the view's own.
 * @param built - The panels as they were built.
 * @param copy - The words the tab writes.
 * @param sample - What the one selected sample is called.
 * @returns The sentence.
 */
export function legendTitle(
  built: LoadingProfiles,
  copy: ProjectionCopy,
  sample: string,
): string {
  const { legend } = copy;
  if (built.view === 'effect') return legend.variablesEffect;
  if (built.view === 'rescaled') return legend.variablesRescaled;
  if (built.view === 'sample') {
    return fillCopy(legend.variablesSample, { sample });
  }
  return legend.variablesWeights;
}

/**
 * Every drawn component as a line, and the average as a grey dashed one.
 * @param built - The panels as they were built.
 * @param average - Whether the average sample is drawn.
 * @param copy - The words the tab writes.
 * @returns The entries, in the panels' own order.
 */
export function legendEntries(
  built: LoadingProfiles,
  average: boolean,
  copy: ProjectionCopy,
): OverlayLegendEntry[] {
  const entries: OverlayLegendEntry[] = built.profiles.map((profile) => ({
    id: `component-${profile.index}`,
    label: profile.label,
    color: profile.color,
    shape: 'line',
  }));
  if (average) {
    entries.push({
      id: 'average',
      label: copy.help.showAverage.title,
      color: 'var(--text-faint)',
      shape: 'dashed',
    });
  }
  return entries;
}

/**
 * What the horizontal axis measures, with its unit in brackets.
 * @param axis - How the measurements are laid out.
 * @returns The axis title.
 */
export function axisCaption(axis: VariableAxis): string {
  if (axis.kind === 'named') return axis.label ?? 'Measurement';
  const unit = axis.unit ?? '';
  return unit === '' ? axis.label : `${axis.label} (${unit})`;
}

function plural(word: string): string {
  const lower = word.toLowerCase();
  return lower.endsWith('s') ? lower : `${lower}s`;
}
