import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import type { CapsuleOption } from '../CapsuleFilter.tsx';
import { CapsuleFilter } from '../CapsuleFilter.tsx';

const OPTIONS: readonly CapsuleOption[] = [
  { value: 'all', label: 'All', count: 1204 },
  { value: 'solved', label: 'Solved', count: 812, intent: 'success' },
  { value: 'failed', label: 'Failed', count: 17, intent: 'danger' },
];

type EquationType = 'acidoBasic' | 'complexation' | 'precipitation';

const TYPES: ReadonlyArray<CapsuleOption<EquationType>> = [
  { value: 'acidoBasic', label: 'acid-base', intent: 'primary' },
  { value: 'complexation', label: 'complexation', intent: 'success' },
  { value: 'precipitation', label: 'precipitation', intent: 'warning' },
];

// The row is a plain function of its props, so its capsules can be read and
// clicked without mounting it.
const renderRow = CapsuleFilter;

function capsulesOf(row: ReactElement): Array<ReactElement<ClickableProps>> {
  return (
    row as ReactElement<{ children: Array<ReactElement<ClickableProps>> }>
  ).props.children;
}

interface ClickableProps {
  onClick: () => void;
}

function pressedStates(html: string): Array<string | undefined> {
  return [...html.matchAll(/aria-pressed="(?<pressed>true|false)"/g)].map(
    (match) => match.groups?.pressed,
  );
}

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

test('picking a capsule of a single row reports its value', () => {
  const picked: string[] = [];
  const capsules = capsulesOf(
    renderRow({
      options: OPTIONS,
      value: 'all',
      onChange: (value) => picked.push(value),
    }),
  );

  capsules[2]?.props.onClick();

  expect(picked).toStrictEqual(['failed']);
});

test('a multiple row fills every selected capsule, and the reset only when none is', () => {
  const some = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={TYPES}
      values={['acidoBasic', 'precipitation']}
      allOption={{ label: 'all types', count: 431 }}
      onChange={() => null}
    />,
  );
  const none = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={TYPES}
      values={[]}
      allOption={{ label: 'all types', count: 431 }}
      onChange={() => null}
    />,
  );

  expect(some).toContain('all types (431)');
  expect(pressedStates(some)).toStrictEqual(['false', 'true', 'false', 'true']);
  expect(pressedStates(none)).toStrictEqual([
    'true',
    'false',
    'false',
    'false',
  ]);
});

test('a multiple row without a reset capsule draws only its options', () => {
  const html = renderToStaticMarkup(
    <CapsuleFilter
      multiple
      options={TYPES}
      values={['complexation']}
      onChange={() => null}
    />,
  );

  expect(pressedStates(html)).toStrictEqual(['false', 'true', 'false']);
  expect(html).not.toContain('all types');
});

test('a capsule toggles within the selection, kept in option order, and the reset clears it', () => {
  const picked: EquationType[][] = [];
  const capsules = capsulesOf(
    renderRow<EquationType>({
      multiple: true,
      options: TYPES,
      values: ['precipitation'],
      allOption: { label: 'all types' },
      onChange: (values) => picked.push(values),
    }),
  );

  capsules[1]?.props.onClick();
  capsules[3]?.props.onClick();
  capsules[0]?.props.onClick();

  expect(picked).toStrictEqual([['acidoBasic', 'precipitation'], [], []]);
});
