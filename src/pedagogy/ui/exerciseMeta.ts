/**
 * What a level and a status look like, in one place.
 *
 * A level means the same thing in the tutorial, in the exercise list and on the
 * cheatsheet, so it is coloured from here rather than decided again per page.
 */

import type { IconName, Intent } from '@blueprintjs/core';

import type { ExerciseLevel, ExerciseStatus } from '../core/types.ts';

/** Green for a beginner, amber for an intermediate, red for an advanced one. */
export const LEVEL_INTENT: Record<ExerciseLevel, Intent> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
};

/** The three levels in teaching order, for a page listing all of them. */
export const LEVEL_ORDER: readonly ExerciseLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
];

/** An empty circle, a warning sign, a tick: untouched, handed in, right. */
export const STATUS_ICON: Record<ExerciseStatus, IconName> = {
  idle: 'circle',
  attempted: 'warning-sign',
  solved: 'tick-circle',
};

/**
 * Colour per status.
 *
 * `idle` is the one uncoloured value in the package: an exercise nobody has
 * opened has nothing to report, and painting it would make a fresh list read as
 * a list of mistakes. Every other value keeps its colour wherever it is shown,
 * including on a tag that is switched off.
 */
export const STATUS_INTENT: Record<ExerciseStatus, Intent> = {
  idle: 'none',
  attempted: 'warning',
  solved: 'success',
};
