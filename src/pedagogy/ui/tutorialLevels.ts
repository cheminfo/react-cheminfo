/**
 * The two shades each level of the guided tour is painted in.
 *
 * Green, amber, pink — the same three the level tags use, in the pale weights a
 * strip of buttons can sit on. They are shared so a student moving from one of
 * our tools to the next reads the shape of the course the same way.
 */

import type { ExerciseLevel } from '../core/types.ts';

/** How one level is painted. */
export interface TutorialLevelColours {
  /** Behind the whole strip. */
  background: string;
  /** Behind the step that is open, which is the darker of the two. */
  activeBackground: string;
}

/** The palette of the three levels. */
export const TUTORIAL_LEVEL_COLOURS: Record<
  ExerciseLevel,
  TutorialLevelColours
> = {
  beginner: { background: '#d1fae5', activeBackground: '#6ee7b7' },
  intermediate: { background: '#fef3c7', activeBackground: '#fcd34d' },
  advanced: { background: '#fce7f3', activeBackground: '#f9a8d4' },
};
