/**
 * The verdict on an answer, in the shape every tool reports it.
 *
 * An exercise is marked by running the answer against test cases, never by
 * comparing it to a string: two people write one molecule, one regex or one
 * formula the same way far less often than they write it differently.
 */

/** How one test case came out. */
export interface TestCaseResult {
  passed: boolean;
  /**
   * What happened, written the way a tutor would say it — `match was "cat",
   * expected "cats"`, `not matched, but this one should be found`. It is the
   * sentence the student reads when a case fails, so it names the value and
   * what was wanted; never `assertion failed`.
   */
  reason: string;
  /** What the answer actually produced, or `null` when it produced nothing. */
  actual: string | null;
}

/**
 * The verdict on one answer: whether it is right, and everything the page needs
 * to say why not.
 *
 * A tool that carries more per case — which test case it was, whether it was a
 * match or a replacement — extends {@link TestCaseResult} and passes its own
 * type through.
 */
export interface ValidationResult<
  TCase extends TestCaseResult = TestCaseResult,
> {
  passed: boolean;
  /**
   * The one thing that stopped the cases from running at all: an answer that
   * does not compile, or an empty one. `null` when the answer ran, however
   * badly it did.
   */
  error: string | null;
  cases: TCase[];
  /**
   * The options the exercise requires and the answer does not carry — a regex
   * flag, a stereo descriptor. Reported apart from the cases, because a student
   * staring at half-passing tests has no way of guessing which one is missing.
   */
  missingOptions: string[];
}

/** What {@link finishValidation} needs beyond the cases themselves. */
export interface FinishValidationOptions {
  /**
   * A message that stopped the cases from being meaningful.
   * @default null
   */
  error?: string | null;
  /**
   * Required options the answer does not carry.
   * @default []
   */
  missingOptions?: string[];
}

/**
 * Turn the cases a validator ran into the verdict on the answer.
 *
 * The answer is right only when nothing failed: no error, no missing option,
 * and every case passed. A list with no cases in it has nothing failing in it
 * and therefore passes — a validator that could not run its cases reports
 * {@link failedValidation} instead of an empty list.
 * @param cases - Every case that was run, in the order the page lists them.
 * @param options - The error and the missing options, when there are any.
 * @returns The verdict.
 */
export function finishValidation<TCase extends TestCaseResult>(
  cases: TCase[],
  options: FinishValidationOptions = {},
): ValidationResult<TCase> {
  const error = options.error ?? null;
  const missingOptions = options.missingOptions ?? [];
  return {
    passed: error === null && missingOptions.length === 0 && allPassed(cases),
    error,
    cases,
    missingOptions,
  };
}

/**
 * The verdict on an answer that never ran — it does not compile, or there is
 * nothing to mark yet.
 * @param error - What to tell the student, in their words rather than the
 * engine's whenever the engine's can be improved on.
 * @param cases - The cases, when the page still lists them as not evaluated.
 * @returns The verdict.
 */
export function failedValidation<TCase extends TestCaseResult>(
  error: string,
  cases: TCase[] = [],
): ValidationResult<TCase> {
  return { passed: false, error, cases, missingOptions: [] };
}

function allPassed(cases: readonly TestCaseResult[]): boolean {
  for (const testCase of cases) {
    if (!testCase.passed) return false;
  }
  return true;
}
