import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { progressSummary } from '../../core/progress.ts';
import { ExerciseProgressHeader } from '../ExerciseProgressHeader.tsx';

const RECORDS = {
  one: { status: 'solved' as const },
  two: { status: 'attempted' as const },
};

test('the counts read against the whole set, not only what was touched', () => {
  const summary = progressSummary(RECORDS, ['one', 'two', 'three', 'four']);
  const html = renderToStaticMarkup(
    <ExerciseProgressHeader summary={summary} />,
  );

  expect(html).toContain('1 / 4 solved');
  expect(html).toContain('25%');
  expect(html).toContain('aria-valuenow="25"');
  expect(html).toContain('bp6-intent-primary');
});

test('a finished set turns the bar green', () => {
  const summary = progressSummary(RECORDS, ['one']);
  const html = renderToStaticMarkup(
    <ExerciseProgressHeader summary={summary} />,
  );

  expect(html).toContain('1 / 1 solved');
  expect(html).toContain('100%');
  expect(html).toContain('bp6-intent-success');
});

test('an empty set reports nothing solved rather than everything', () => {
  const html = renderToStaticMarkup(
    <ExerciseProgressHeader summary={progressSummary({}, [])} />,
  );

  expect(html).toContain('0 / 0 solved');
  expect(html).toContain('0%');
  expect(html).toContain('bp6-intent-primary');
});

test('omitting onClearAll omits the button and its dialog', () => {
  const summary = progressSummary(RECORDS, ['one', 'two']);
  const without = renderToStaticMarkup(
    <ExerciseProgressHeader summary={summary} />,
  );
  const withClear = renderToStaticMarkup(
    <ExerciseProgressHeader
      summary={summary}
      onClearAll={() => {
        // nothing to clear in a static render
      }}
    />,
  );

  expect(without).not.toContain('Clear all answers');
  expect(withClear).toContain('Clear all answers');
  expect(withClear).toContain('bp6-intent-danger');
});

test('the wipe button is dead when there is nothing stored to wipe', () => {
  const html = renderToStaticMarkup(
    <ExerciseProgressHeader
      summary={progressSummary({}, ['one'])}
      clearDisabled
      clearLabel="Start over"
      onClearAll={() => {
        // nothing to clear in a static render
      }}
    />,
  );

  expect(html).toContain('Start over');
  expect(html).toContain('disabled=""');
});
