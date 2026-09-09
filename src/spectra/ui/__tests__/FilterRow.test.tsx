import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { problem } from '../../core/problems.ts';
import { FilterRow } from '../FilterRow.tsx';

const NOTHING = {
  problems: [],
  onChange: () => null,
  onMove: () => null,
  onDuplicate: () => null,
  onRemove: () => null,
};

test('the row numbers the step from one and names every button after it', () => {
  const html = renderToStaticMarkup(
    <FilterRow
      filter={{ name: 'fromTo' }}
      position={1}
      count={3}
      {...NOTHING}
    />,
  );

  expect(html).toContain('>2</span>');
  expect(html).toContain('>Crop</span>');
  expect(html).toContain('aria-label="Move Crop up"');
  expect(html).toContain('aria-label="Move Crop down"');
  expect(html).toContain('aria-label="Repeat Crop"');
  expect(html).toContain('aria-label="Remove Crop"');
});

test('the first step cannot be moved up', () => {
  const html = renderToStaticMarkup(
    <FilterRow
      filter={{ name: 'fromTo' }}
      position={0}
      count={3}
      {...NOTHING}
    />,
  );

  expect(html).toContain('disabled="" aria-label="Move Crop up"');
  expect(html).not.toContain('disabled="" aria-label="Move Crop down"');
});

test('the last step cannot be moved down', () => {
  const html = renderToStaticMarkup(
    <FilterRow
      filter={{ name: 'fromTo' }}
      position={2}
      count={3}
      {...NOTHING}
    />,
  );

  expect(html).toContain('disabled="" aria-label="Move Crop down"');
  expect(html).not.toContain('disabled="" aria-label="Move Crop up"');
});

test('a step whose parameters upstream fixes says so instead of drawing empty boxes', () => {
  const html = renderToStaticMarkup(
    <FilterRow
      filter={{ name: 'airPLSBaseline' }}
      position={0}
      count={1}
      {...NOTHING}
    />,
  );

  expect(html).toContain(
    'Fixed upstream: Fitted against the point index, 100 iterations, tolerance 0.001.',
  );
  expect(html).not.toContain('bp6-input-group');
});

test('a step that holds a trap draws it as a warning above its options', () => {
  const html = renderToStaticMarkup(
    <FilterRow
      filter={{ name: 'fromTo' }}
      position={0}
      count={1}
      {...NOTHING}
    />,
  );

  expect(html).toContain(
    'Give x values or point numbers, not both: a point number silently wins over an x value.',
  );
  expect(html.match(/bp6-intent-warning/g)).toHaveLength(1);
  expect(html.indexOf('bp6-intent-warning')).toBeLessThan(
    html.indexOf('From (x)'),
  );
});

test('an option-free step draws no field control at all', () => {
  const html = renderToStaticMarkup(
    <FilterRow
      filter={{ name: 'centerMean' }}
      position={0}
      count={1}
      {...NOTHING}
    />,
  );

  expect(html).toContain(
    'Subtracts the mean of y, so the spectrum sits about zero.',
  );
  expect(html).not.toContain('bp6-input-group');
  expect(html).not.toContain('bp6-html-select');
  expect(html).not.toContain('bp6-control');
});

test('the step draws every one of its options, filled in with what it holds', () => {
  const html = renderToStaticMarkup(
    <FilterRow
      filter={{ name: 'rescale', options: { min: -1, max: 4 } }}
      position={0}
      count={1}
      {...NOTHING}
    />,
  );

  expect(html.match(/<input /g)).toHaveLength(2);
  expect(html).toContain('value="-1"');
  expect(html).toContain('value="4"');
});

test('a step’s problems are drawn after its options, errors in danger and advice in warning', () => {
  const html = renderToStaticMarkup(
    <FilterRow
      filter={{ name: 'rescale', options: { min: 4, max: 1 } }}
      position={0}
      count={1}
      problems={[
        problem(
          'error',
          'Step 1 — Rescale between two values',
          'The minimum is not below the maximum.',
        ),
        problem(
          'warning',
          'Step 1 — Rescale between two values',
          'Only the last scaling shows.',
        ),
      ]}
      onChange={() => null}
      onMove={() => null}
      onDuplicate={() => null}
      onRemove={() => null}
    />,
  );

  expect(html.match(/bp6-intent-danger/g)).toHaveLength(1);
  expect(html.match(/bp6-intent-warning/g)).toHaveLength(1);
  expect(html.indexOf('Maximum')).toBeLessThan(
    html.indexOf('The minimum is not below the maximum.'),
  );
  expect(html.indexOf('The minimum is not below the maximum.')).toBeLessThan(
    html.indexOf('Only the last scaling shows.'),
  );
});
