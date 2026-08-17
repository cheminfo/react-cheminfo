/**
 * The spine every pedagogic tool shares: a level, a status, an exercise, a set
 * of them, and one stop of a guided tour. What a given tool asks of a student
 * differs — a regex, a SMILES, a formula — so those parts stay generic and the
 * site adds them.
 */

/**
 * How hard a step or an exercise is, which is also how it is coloured: green
 * for a beginner, yellow for an intermediate, pink for an advanced one.
 */
export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Where a student stands on one exercise: never handed in, handed in and not
 * right yet, or right. The three are exclusive — a solved exercise is no longer
 * an attempted one.
 */
export type ExerciseStatus = 'idle' | 'attempted' | 'solved';

/**
 * What every exercise carries, whatever it asks for.
 *
 * A tool extends it with the shape of its own question and its own test cases.
 */
export interface BaseExercise {
  /** Stable and URL-safe: it is what `/exercises/<id>` carries. */
  id: string;
  /** How the exercise is listed. */
  title: string;
  level: ExerciseLevel;
  /** What to do, in a few sentences; may carry `[[term]]` markers. */
  description: string;
  /**
   * Ordered from a nudge to almost the answer, revealed one at a time. Two to
   * four is the useful range: never one, never six.
   */
  hints: string[];
  /** A sample answer, shown only when the student asks to see it. */
  solution: string;
}

/**
 * A named list of exercises, which is what a link hands out.
 *
 * The exercise type is the tool's own, so a set of SMARTS questions and a set
 * of LaTeX formulas are the same structure holding different questions.
 */
export interface ExerciseSet<TExercise = BaseExercise> {
  /** Stable and URL-safe. */
  id: string;
  title: string;
  /** One line on what the set drills. */
  description: string;
  /**
   * The level of the set as a whole, when it has one. A set whose level is read
   * off its questions rather than written down leaves it out.
   * @default undefined
   */
  level?: ExerciseLevel;
  exercises: TExercise[];
}

/**
 * One stop in the guided tour, plus whatever the tool preloads into its live
 * playground — a pattern and its flags, a SMILES, a structure and a layer.
 *
 * A step is a working configuration the student is free to edit, never a slide.
 */
export type TutorialStep<TPayload = unknown> = {
  /** Stable and URL-safe: it is what a link to the step carries. */
  id: string;
  title: string;
  /** One short paragraph; may carry `[[term]]` markers. */
  description: string;
  /** Which coloured group the step is listed under. */
  level: ExerciseLevel;
} & TPayload;
