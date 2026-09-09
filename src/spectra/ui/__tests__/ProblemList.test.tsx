import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { SettingsProblem } from '../../core/problems.ts';
import { ProblemList } from '../ProblemList.tsx';

const ADVICE: SettingsProblem = {
  severity: 'warning',
  where: 'Scaling',
  message: 'The difference is taken against the first spectrum.',
};

const PROBLEMS: readonly SettingsProblem[] = [
  {
    severity: 'error',
    where: 'Memory',
    message: 'The budget must be a number above zero.',
  },
  ADVICE,
  { severity: 'error', where: 'Range 1', message: 'From is not below to.' },
];

test('nothing at all is drawn when the settings have nothing wrong with them', () => {
  const html = renderToStaticMarkup(<ProblemList problems={[]} />);

  expect(html).toBe('');
});

test('errors and advice are kept apart, because only one of them has to be fixed', () => {
  const html = renderToStaticMarkup(<ProblemList problems={PROBLEMS} />);

  expect(html).toContain('The processor would fail on this');
  expect(html).toContain('Worth a look');
  expect(html.match(/<li>/g)).toHaveLength(3);
});

test('every line names the part before saying what is wrong with it', () => {
  const html = renderToStaticMarkup(<ProblemList problems={PROBLEMS} />);

  expect(html).toContain('Memory — The budget must be a number above zero.');
  expect(html).toContain('Range 1 — From is not below to.');
  expect(html).toContain(
    'Scaling — The difference is taken against the first spectrum.',
  );
});

test('a part carrying only advice draws no errors callout at all', () => {
  const html = renderToStaticMarkup(<ProblemList problems={[ADVICE]} />);

  expect(html).not.toContain('The processor would fail on this');
  expect(html).toContain('Worth a look');
  expect(html.match(/<li>/g)).toHaveLength(1);
});

test('the errors heading is chosen by the part, so it can name the stage that would fail', () => {
  const html = renderToStaticMarkup(
    <ProblemList problems={PROBLEMS} title="Resampling would throw" />,
  );

  expect(html).toContain('Resampling would throw');
  expect(html).not.toContain('The processor would fail on this');
});
