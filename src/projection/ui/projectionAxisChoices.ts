import { chartAxisTitle } from '../../chart/core/chartLabels.ts';
import type { OverlayOption } from '../../overlay/ui/OverlayRow.tsx';
import type { ProjectionResult } from '../core/projectionResult.ts';

/**
 * The axes one picker offers, with the ones the other pickers already draw kept
 * in the list but unreachable, so the reader sees why they cannot be picked.
 * @param result - The reduced space being drawn.
 * @param taken - The axes the other pickers are showing.
 * @param takenReason - What the pointer is told about an axis already drawn.
 * @returns The choices, in the order the run produced them.
 */
export function projectionAxisChoices(
  result: ProjectionResult,
  taken: readonly number[],
  takenReason: string,
): OverlayOption[] {
  const choices: OverlayOption[] = [];
  for (let index = 0; index < result.axes.length; index++) {
    const axis = result.axes[index];
    if (axis === undefined) continue;
    const drawn = taken.includes(index);
    choices.push({
      value: String(index),
      label: chartAxisTitle(axis.name, { share: axis.share }),
      disabled: drawn,
      title: drawn ? takenReason : undefined,
    });
  }
  return choices;
}
