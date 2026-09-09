/**
 * What each tab answers when the reader presses the question mark.
 *
 * The viewer is meant to be embedded in somebody else's page, so the paragraph
 * that used to stand under every figure now waits behind one glyph in the bar:
 * a reader who wants it opens it, and everybody else pays no vertical space
 * for it. Not one word of it was dropped in the move — the sentences are the
 * reason a reader who has never met a component can read the figure at all —
 * so they are built here, where what a tab claims about its own numbers can be
 * checked without rendering a chart.
 */

import { chartShare } from '../../chart/core/chartLabels.ts';
import type { ExplainedShares } from '../core/explainedShares.ts';
import type { LoadingProfiles } from '../core/loadingProfiles.ts';
import type { ProjectionCopy } from '../core/projectionCopy.ts';
import { fillCopy } from '../core/projectionCopy.ts';

import { legendTitle, variablesCaption } from './projectionVariablesWords.ts';

/**
 * What the pair grid says about itself.
 * @param copy - The words the viewer writes.
 * @param groupLabel - What the set of groups is called.
 * @param colored - Whether colour stands for the group at all; uncoloured, the
 * sentence naming the colour would name something the grid is not drawing.
 * @returns The paragraph.
 */
export function projectionPairsInfo(
  copy: ProjectionCopy,
  groupLabel: string,
  colored: boolean,
): string {
  if (!colored) return copy.intro.pairs;
  const key = fillCopy(copy.legend.pairs, { groups: groupLabel });
  return `${copy.intro.pairs} ${key}`;
}

/**
 * What the "what differs" panels say about themselves.
 *
 * Both sentences are needed and neither stands in for the other: the first
 * says what a panel draws, which changes with the view, and the second says
 * what its colours mean, which is the only place the grey line is named.
 * @param profiles - The panels as they were built, or `null` when the run
 * reported no weights and there is nothing to explain.
 * @param copy - The words the viewer writes.
 * @param sample - What the one selected sample is called.
 * @returns The paragraph.
 */
export function projectionVariablesInfo(
  profiles: LoadingProfiles | null,
  copy: ProjectionCopy,
  sample: string,
): string {
  if (profiles === null) return '';
  const caption = variablesCaption(profiles, copy);
  return `${caption} ${legendTitle(profiles, copy, sample)}`;
}

/**
 * What the shares figure says about itself, including its own arithmetic.
 *
 * The computed sentence sits between the two written ones because it is the
 * answer the reader came for — how many components they have to keep — while
 * the sentences around it say what a bar is and what its colour means.
 * @param shares - The bars, already worked out.
 * @param copy - The words the viewer writes.
 * @returns The paragraph.
 */
export function projectionSharesInfo(
  shares: ExplainedShares | null,
  copy: ProjectionCopy,
): string {
  if (shares === null) return copy.intro.shares;
  const counted = projectionSharesSentence(shares, copy);
  const parts = [copy.intro.shares, counted, copy.legend.shares];
  return parts.filter((part) => part !== '').join(' ');
}

/**
 * What the shares tab says about its own numbers, in two sentences at most.
 *
 * The second is left out when the reader asked for no target, and when the
 * first component already reaches it: "the first 1 components together" is
 * both ungrammatical and a restatement of the sentence before it.
 * @param shares - The bars.
 * @param copy - The words the viewer writes.
 * @returns The sentence.
 */
export function projectionSharesSentence(
  shares: ExplainedShares,
  copy: ProjectionCopy,
): string {
  const { components, target, reachesTargetAt } = shares;
  const first = components[0];
  if (first === undefined) return '';
  const opening = fillCopy(copy.sentence.sharesFirst, {
    percent: writeShare(first.share),
  });
  if (target === 0 || reachesTargetAt === 1) return opening;
  if (reachesTargetAt !== null) {
    return `${opening} ${fillCopy(copy.sentence.sharesTarget, {
      count: String(reachesTargetAt),
      percent: writeShare(components[reachesTargetAt - 1]?.cumulative ?? 0),
    })}`;
  }
  return `${opening} ${fillCopy(copy.sentence.sharesNoTarget, {
    count: String(components.length),
    percent: writeShare(components.at(-1)?.cumulative ?? 0),
  })}`;
}

/**
 * A share written as a percentage, at the precision every other figure of the
 * family writes it at.
 *
 * The bars beside this sentence are named `PC1 — 73.0 %`, so a sentence saying
 * 72.96% would put the same quantity on screen twice in two shapes and leave
 * the reader deciding whether they are one number or two.
 * @param share - The share, between 0 and 1.
 * @returns It, written out.
 */
function writeShare(share: number): string {
  return `${chartShare(share)}%`;
}
