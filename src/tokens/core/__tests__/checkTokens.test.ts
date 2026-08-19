// tokens-ok: file — the checker is tested against the colours it catches.
import { expect, test } from 'vitest';

import { findTokenViolations } from '../checkTokens.ts';

const SITE_CSS = `:root {
  --brand: #4338ca;
}

.card {
  background: #f6f7f9;
  border: 1px solid #d3d8de;
  color: rgb(95 107 124);
  box-shadow: 0 0 0 2px #2d72d2;
}

.page {
  background: #f5f7fa;
  color: var(--brand);
}
`;

test('every kind is found where it is written', () => {
  const violations = findTokenViolations([
    { path: 'src/site.css', text: SITE_CSS },
  ]);

  expect(
    violations.map((violation) => [
      violation.line,
      violation.column,
      violation.kind,
      violation.text,
    ]),
  ).toStrictEqual([
    [2, 3, 'redeclared-brand', '--brand'],
    [6, 15, 'blueprint-grey', '#f6f7f9'],
    [7, 21, 'blueprint-grey', '#d3d8de'],
    [8, 10, 'blueprint-grey', 'rgb(95 107 124)'],
    [9, 25, 'blueprint-blue', '#2d72d2'],
    [13, 15, 'retyped-token', '#f5f7fa'],
  ]);
});

test('a violation names its file and the token to write instead', () => {
  expect(
    findTokenViolations([
      { path: 'src/card.css', text: '.card { color: #5F6B7C; }' },
    ]),
  ).toStrictEqual([
    {
      file: 'src/card.css',
      line: 1,
      column: 16,
      kind: 'blueprint-grey',
      text: '#5F6B7C',
      hint: "Blueprint's muted text — use var(--text-muted).",
    },
  ]);
});

test('the rgb() spelling is caught like the hex one', () => {
  const violations = findTokenViolations([
    {
      path: 'src/site.css',
      text: 'a { color: rgb(95, 107, 124); }\nb { color: rgb(95 107 124 / 50%); }\n',
    },
  ]);

  expect(
    violations.map((violation) => [
      violation.line,
      violation.column,
      violation.text,
    ]),
  ).toStrictEqual([
    [1, 12, 'rgb(95, 107, 124)'],
    [2, 12, 'rgb(95 107 124 / 50%)'],
  ]);
  expect(violations[0]?.kind).toBe('blueprint-grey');
  expect(violations[1]?.hint).toBe(
    "Blueprint's muted text — use var(--text-muted).",
  );
});

test('a colour the project owns is left alone, in either spelling', () => {
  const files = [
    {
      path: 'src/logo.css',
      text: '.logo { color: #5f6b7c; background: rgb(95 107 124); }',
    },
  ];

  expect(findTokenViolations(files)).toHaveLength(2);
  expect(findTokenViolations(files, { allow: ['#5f6b7c'] })).toStrictEqual([]);
});

test('the ignore marker waives the line it is on', () => {
  const files = [
    {
      path: 'src/site.css',
      text: '.a { color: #f6f7f9; } /* tokens-ok */\n.b { color: #f6f7f9; }\n',
    },
  ];

  const violations = findTokenViolations(files);

  expect(violations).toHaveLength(1);
  expect(violations[0]?.line).toBe(2);

  expect(
    findTokenViolations(files, { ignoreMarker: 'palette-ok' }),
  ).toHaveLength(2);
});

test('reading the palette is not redeclaring it', () => {
  expect(
    findTokenViolations([
      {
        path: 'src/site.css',
        text: ':root {\n  color: var(--brand);\n  border-color: var(--brand-alt, var(--accent));\n}\n',
      },
    ]),
  ).toStrictEqual([]);
});

test('each palette property is reported as itself', () => {
  const violations = findTokenViolations([
    {
      path: 'src/site.css',
      text: ':root {\n  --brand-alt: #f59e0b;\n  --accent: var(--brand);\n}\n',
    },
  ]);

  expect(
    violations.map((violation) => [violation.line, violation.text]),
  ).toStrictEqual([
    [2, '--brand-alt'],
    [3, '--accent'],
  ]);
});

test('the palette is only redeclared at :root', () => {
  expect(
    findTokenViolations([
      { path: 'src/card.css', text: '.card {\n  --brand-alt: #f59e0b;\n}\n' },
    ]),
  ).toStrictEqual([]);
});

test('a file with no colours has nothing to report', () => {
  expect(
    findTokenViolations([
      { path: 'src/format.ts', text: 'export const width = 16;\n' },
    ]),
  ).toStrictEqual([]);
  expect(findTokenViolations([])).toStrictEqual([]);
});

test('the files are reported in the order they were given', () => {
  const violations = findTokenViolations([
    { path: 'src/b.css', text: '.b { color: #16202c; }' },
    { path: 'src/a.tsx', text: "const grey = '#8a96a3';\n" },
  ]);

  expect(
    violations.map((violation) => [violation.file, violation.kind]),
  ).toStrictEqual([
    ['src/b.css', 'retyped-token'],
    ['src/a.tsx', 'retyped-token'],
  ]);
});

test("a token's own value written as its var() fallback is documentation", () => {
  const violations = findTokenViolations([
    {
      path: 'slides.css',
      text: [
        ':where(.slideshow) {',
        '  --slide-bg: var(--surface-sunken, #f5f7fa);',
        '  --slide-ink: color-mix(in oklab, var(--text, #16202c) 82%, white);',
        '}',
      ].join('\n'),
    },
  ]);

  expect(violations).toStrictEqual([]);
});

test('a colour outside a var() fallback is still caught on the same line', () => {
  const violations = findTokenViolations([
    {
      path: 'panel.css',
      text: '.panel { background: var(--surface-sunken, #f5f7fa); border: 1px solid #d3d8de; }',
    },
  ]);

  expect(violations).toHaveLength(1);
  expect(violations[0]?.text).toBe('#d3d8de');
  expect(violations[0]?.kind).toBe('blueprint-grey');
});

test('a file that defines the palette waives itself in its first lines', () => {
  const violations = findTokenViolations([
    {
      path: 'chrome.css',
      // tokens-ok: file — the token block is where these values are declared.
      text: '/* tokens-ok: file — this is the token block. */\n:root { --surface-sunken: #f5f7fa; --border: #dfe3e8; }',
    },
  ]);

  expect(violations).toStrictEqual([]);
});

test('the waiver only counts near the top, never buried in the middle', () => {
  const lines = new Array(10).fill('.rule { padding: 0 }');
  lines.push('/* tokens-ok: file */', '.late { color: #5f6b7c }');

  const violations = findTokenViolations([
    { path: 'late.css', text: lines.join('\n') },
  ]);

  expect(violations).toHaveLength(1);
  expect(violations[0]?.line).toBe(12);
});
