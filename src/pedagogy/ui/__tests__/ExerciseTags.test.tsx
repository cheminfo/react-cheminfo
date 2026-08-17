import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { ExerciseLevelTag, ExerciseStatusIcon } from '../ExerciseTags.tsx';
import {
  LEVEL_INTENT,
  LEVEL_ORDER,
  STATUS_ICON,
  STATUS_INTENT,
} from '../exerciseMeta.ts';

test('a level is green, amber or red, and a status has its own glyph', () => {
  expect(LEVEL_INTENT).toStrictEqual({
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'danger',
  });
  expect(STATUS_ICON).toStrictEqual({
    idle: 'circle',
    attempted: 'warning-sign',
    solved: 'tick-circle',
  });
  expect(STATUS_INTENT).toStrictEqual({
    idle: 'none',
    attempted: 'warning',
    solved: 'success',
  });
  expect(LEVEL_ORDER).toStrictEqual(['beginner', 'intermediate', 'advanced']);
});

test('a tag that is switched off keeps the colour of its level', () => {
  const off = renderToStaticMarkup(<ExerciseLevelTag level="advanced" />);
  const on = renderToStaticMarkup(<ExerciseLevelTag level="advanced" active />);

  expect(off).toContain('bp6-intent-danger');
  expect(off).toContain('bp6-minimal');
  expect(on).toContain('bp6-intent-danger');
  expect(on).not.toContain('bp6-minimal');
  expect(off).toContain('>advanced</span>');
});

test('a level tag can be relabelled without losing its colour', () => {
  const html = renderToStaticMarkup(
    <ExerciseLevelTag level="intermediate" label="π bonds" />,
  );

  expect(html).toContain('bp6-intent-warning');
  expect(html).toContain('π bonds');
});

test('an untouched exercise is the one uncoloured status', () => {
  const idle = renderToStaticMarkup(<ExerciseStatusIcon status="idle" />);
  const solved = renderToStaticMarkup(<ExerciseStatusIcon status="solved" />);
  const attempted = renderToStaticMarkup(
    <ExerciseStatusIcon status="attempted" title="handed in" />,
  );

  expect(idle).toContain('bp6-icon-circle');
  expect(idle).not.toContain('bp6-intent-');
  expect(solved).toContain('bp6-icon-tick-circle');
  expect(solved).toContain('bp6-intent-success');
  expect(attempted).toContain('bp6-icon-warning-sign');
  expect(attempted).toContain('bp6-intent-warning');
  expect(attempted).toContain('handed in');
});
