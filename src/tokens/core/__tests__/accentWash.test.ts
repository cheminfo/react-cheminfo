// tokens-ok: file — the checker is tested against the colours it catches.
import { expect, test } from 'vitest';

import { findTokenViolations } from '../checkTokens.ts';

test('the accent wash written out is the token re-typed, over any ground', () => {
  const text = [
    '.row--selected { background: color-mix(in oklab, var(--accent) 12%, white); }',
    ".chip { background: 'color-mix(in oklab, var(--accent) 12%, transparent)' }",
    '.handle:active { background: color-mix(in oklab, var(--accent) 28%, white); }',
    '.tag { background: var(--accent-wash); }',
  ].join('\n');

  expect(
    findTokenViolations([{ path: 'src/rows.css', text }]).map((violation) => [
      violation.line,
      violation.column,
      violation.kind,
      violation.text,
      violation.hint,
    ]),
  ).toStrictEqual([
    [
      1,
      30,
      'retyped-token',
      'color-mix(in oklab, var(--accent) 12%',
      'the accent wash — use var(--accent-wash), or var(--accent-wash-clear) over a ground that shows through.',
    ],
    [
      2,
      22,
      'retyped-token',
      'color-mix(in oklab, var(--accent) 12%',
      'the accent wash — use var(--accent-wash), or var(--accent-wash-clear) over a ground that shows through.',
    ],
  ]);
});
