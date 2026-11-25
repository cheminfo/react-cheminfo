import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { CapsuleFilter } from '../CapsuleFilter.tsx';

import { OPTIONS, TYPES, pressedStates } from './capsuleOptions.ts';

test('every capsule is drawn, with its count grouped in thousands', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter options={OPTIONS} value="all" onChange={() => null} />,
  );

  expect(html).toContain('All (1,204)');
  expect(html).toContain('Solved (812)');
  expect(html).toContain('Failed (17)');
});

test('the selected capsule is the filled one, the rest stay minimal', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter options={OPTIONS} value="solved" onChange={() => null} />,
  );

  const capsules = html.split('<span aria-pressed=');

  expect(capsules).toHaveLength(4);
  expect(capsules[1]).toContain('bp6-minimal');
  expect(capsules[2]).not.toContain('bp6-minimal');
  expect(capsules[3]).toContain('bp6-minimal');
});

test('a capsule keeps its semantic colour whether or not it is selected', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter options={OPTIONS} value="all" onChange={() => null} />,
  );

  expect(html).toContain('bp6-intent-success');
  expect(html).toContain('bp6-intent-danger');
});

test('the row is reachable by tab and says which capsule is selected', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter options={OPTIONS} value="failed" onChange={() => null} />,
  );

  expect(html).toContain('tabindex="0"');
  expect(html).toContain('role="button"');

  const selected = html.slice(html.lastIndexOf('<span aria-pressed='));

  expect(selected).toContain('aria-pressed="true"');
  expect(selected).toContain('Failed (17)');
});

test('the group carries the name a screen reader reads', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      options={OPTIONS}
      value="all"
      label="Outcome"
      onChange={() => null}
    />,
  );

  expect(html).toContain('aria-label="Outcome"');
  expect(html).toContain('role="group"');
});

test('a capsule with no count reads as its label alone', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      options={[{ value: 'any', label: 'Any type' }]}
      value="any"
      onChange={() => null}
    />,
  );

  expect(html).toContain('Any type');
  expect(html).not.toContain('Any type (');
});

test('a caller may write the counts its own way', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      options={OPTIONS}
      value="all"
      formatCount={(count) => `~${count}`}
      onChange={() => null}
    />,
  );

  expect(html).toContain('All (~1204)');
});

test('an empty row still renders the group it would fill', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter options={[]} value="all" onChange={() => null} />,
  );

  expect(html).toBe(
    '<div role="group" aria-label="Filter" class="capsule-filter" style="display:flex;flex-wrap:wrap;align-items:center;gap:6px"></div>',
  );
});

test('a note rides at the end of the row, after the last capsule', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={TYPES}
      values={['acidoBasic']}
      allOption={{ label: 'all types', count: 431 }}
      note="C1 and C2 picked"
      onChange={() => null}
    />,
  );

  expect(html).toContain(
    '<span class="capsule-filter__note" style="margin-left:2px;color:var(--text-muted, #5b6875);font-size:0.75rem">C1 and C2 picked</span></div>',
  );
  // The capsules still answer for themselves: the note is not one of them.
  expect(pressedStates(html)).toStrictEqual([
    'false',
    'true',
    'false',
    'false',
  ]);
});

test('a row given no note is its capsules alone', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter options={OPTIONS} value="all" onChange={() => null} />,
  );

  expect(html).not.toContain('capsule-filter__note');
});

test('the class a site gives reaches the row', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      options={OPTIONS}
      value="all"
      className="results-filter"
      onChange={() => null}
    />,
  );

  expect(html).toContain('class="capsule-filter results-filter"');
});
