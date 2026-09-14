// tokens-ok: file — the fallbacks the checker reads are tested with literals.
import { expect, test } from 'vitest';

import { findTokenViolations } from '../checkTokens.ts';

test('a fallback is read only when the scan asks for it', () => {
  const text = [
    '.a { border: 1px solid var(--border, #d3d8de); }',
    '.b { border-radius: var(--radius, 6px); }',
    '.c { color: var(--text-muted, rgb(95 107 124)); }',
    '.d { color: var(--accent, #5f6b7c); }',
    '.e { background: var(--surface, #fff); box-shadow: var(--shadow-sm,  0 1px 2px rgb(16 32 48 / 8%)); }',
    '.f { font-family: var(--font-mono, ui-monospace, monospace); color: var(--accent, var(--text)); }',
    '',
  ].join('\n');

  expect(findTokenViolations([{ path: 'src/site.css', text }])).toStrictEqual(
    [],
  );
  expect(
    findTokenViolations([{ path: 'src/site.css', text }], {
      fallbacks: true,
    }).map((violation) => [
      violation.line,
      violation.column,
      violation.kind,
      violation.text,
    ]),
  ).toStrictEqual([
    [1, 38, 'drifted-fallback', '#d3d8de'],
    [2, 35, 'drifted-fallback', '6px'],
    [3, 31, 'drifted-fallback', 'rgb(95 107 124)'],
    [4, 27, 'blueprint-grey', '#5f6b7c'],
  ]);
});

test('a drifted fallback names the value the token holds', () => {
  expect(
    findTokenViolations(
      [
        {
          path: 'src/card.css',
          text: '.card { color: var(--text, #1c2127); }',
        },
      ],
      { fallbacks: true },
    ),
  ).toStrictEqual([
    {
      file: 'src/card.css',
      line: 1,
      column: 28,
      kind: 'drifted-fallback',
      text: '#1c2127',
      hint: '--text is #16202c in chrome.css — write TOKEN from react-cheminfo/core, or var(--text) with no fallback.',
    },
  ]);
});

test('a fallback written over several lines is reported where it starts', () => {
  const violations = findTokenViolations(
    [
      {
        path: 'src/slides.css',
        text: '.slide {\n  background: var(\n    --surface-sunken,\n    #f4f6f8\n  );\n}\n',
      },
    ],
    { fallbacks: true },
  );

  expect(
    violations.map((violation) => [
      violation.line,
      violation.column,
      violation.text,
    ]),
  ).toStrictEqual([[4, 5, '#f4f6f8']]);
});

test('the marker waives a drifted fallback like any other line', () => {
  expect(
    findTokenViolations(
      [
        {
          path: 'src/card.css',
          text: '.card { border: 1px solid var(--border, #d3d8de); } /* tokens-ok */',
        },
      ],
      { fallbacks: true },
    ),
  ).toStrictEqual([]);
});

test('a var( that a string cuts off is not read as a fallback', () => {
  expect(
    findTokenViolations(
      [
        {
          path: 'src/card.test.ts',
          text: "expect(html).not.toContain('var(--text,');\n",
        },
      ],
      { fallbacks: true },
    ),
  ).toStrictEqual([]);
});
