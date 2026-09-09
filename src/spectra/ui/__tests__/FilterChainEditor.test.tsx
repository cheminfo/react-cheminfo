import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { FILTER_NAMES } from '../../core/filterCatalog.ts';
import type { SpectrumFilter } from '../../core/settings.ts';
import { FilterChainEditor } from '../FilterChainEditor.tsx';

const THREE: readonly SpectrumFilter[] = [
  { name: 'rollingBallBaseline' },
  { name: 'savitzkyGolay' },
  { name: 'centerMean' },
];

test('every one of the twenty-three steps is offered exactly once', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor value={[]} onChange={() => null} />,
  );

  expect(FILTER_NAMES).toHaveLength(23);

  for (const name of FILTER_NAMES) {
    expect(html.match(new RegExp(`<option value="${name}"`, 'g'))).toHaveLength(
      1,
    );
  }

  expect(html.match(/<option value="/g)).toHaveLength(24);
});

test('the menu is cut into the six groups, each named after what it touches', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor value={[]} onChange={() => null} />,
  );

  expect(html.match(/<optgroup/g)).toHaveLength(6);
  expect(html).toContain('<optgroup label="Baseline">');
  expect(html).toContain('<optgroup label="Smoothing and derivatives">');
  expect(html).toContain('<optgroup label="Scaling">');
  expect(html).toContain('<optgroup label="y axis">');
  expect(html).toContain('<optgroup label="x axis">');
  expect(html).toContain('<optgroup label="Housekeeping">');
});

test('the add control is a menu, not a value: it sits on its placeholder', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor value={THREE} onChange={() => null} />,
  );

  expect(html).toContain('<option value="" selected="">Add a step…</option>');
  expect(html).toContain('aria-label="Add a step"');
});

test('an empty chain says the spectra are only put on the shared grid', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor value={[]} onChange={() => null} />,
  );

  expect(html).toContain(
    'No steps — every spectrum is only brought onto the shared x grid.',
  );
});

test('three steps are numbered one to three, in the order they run', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor value={THREE} onChange={() => null} />,
  );

  expect(html).toContain('>1</span>');
  expect(html).toContain('>2</span>');
  expect(html).toContain('>3</span>');
  expect(html.indexOf('Rolling-ball baseline')).toBeLessThan(
    html.indexOf('Savitzky–Golay smoothing'),
  );
  expect(html.indexOf('Savitzky–Golay smoothing')).toBeLessThan(
    html.indexOf('Centre on the mean'),
  );
});

test('neither end of the chain can be moved past itself', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor value={THREE} onChange={() => null} />,
  );

  expect(html).toContain(
    'disabled="" aria-label="Move Rolling-ball baseline up"',
  );
  expect(html).toContain(
    'disabled="" aria-label="Move Centre on the mean down"',
  );
  expect(html.match(/bp6-disabled/g)).toHaveLength(2);
});

test('calibrateX draws all twelve of its options, the nested peak-picking ones included', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor
      value={[{ name: 'calibrateX' }]}
      onChange={() => null}
    />,
  );

  for (const label of [
    'From (x)',
    'To (x)',
    'Peaks to find',
    'Move them to',
    'Smooth before picking',
    'Pick maxima',
    'Smallest peak kept',
    'Noise level',
    'Refine the summit',
    'Peak-picking window',
    'Peak-picking polynomial',
    'Detected on',
  ]) {
    expect(html).toContain(label);
  }

  expect(html.match(/<input /g)).toHaveLength(11);
});

test('a step that holds a trap draws its caution', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor
      value={[{ name: 'equallySpaced' }]}
      onChange={() => null}
    />,
  );

  expect(html).toContain(
    'The settings above already resample once, so this resamples twice; whichever of the two runs last sets the point count.',
  );
});

test('an option-free step such as centerMean draws no field control', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor
      value={[{ name: 'centerMean' }]}
      onChange={() => null}
    />,
  );

  expect(html).not.toContain('bp6-input-group');
  expect(html).not.toContain('bp6-control');
  expect(html.match(/<select/g)).toHaveLength(1);
});

test('a step’s advice is drawn on that step’s row, not collected at the foot of the list', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor
      value={[{ name: 'reverseIfNeeded' }, { name: 'centerMean' }]}
      onChange={() => null}
    />,
  );

  expect(html).toContain(
    'The chain already turns a descending axis round before every step, so this one does nothing.',
  );
  expect(
    html.indexOf('The chain already turns a descending axis round'),
  ).toBeLessThan(html.indexOf('Centre on the mean'));
});

test('resampling first turns a crop into an error rather than advice', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor
      value={[{ name: 'fromTo' }]}
      onChange={() => null}
      resampleFirst
    />,
  );

  expect(html).toContain(
    'This step reads x as a typed array, and resampling or cropping has already turned it into a plain one, so the processor throws. Move it before them, or turn resampling back to last.',
  );
  expect(html.match(/bp6-intent-danger/g)).toHaveLength(1);
});

test('what the whole chain gets wrong is drawn once, under the last step', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor
      value={[
        { name: 'rollingBallBaseline' },
        { name: 'rollingMedianBaseline' },
      ]}
      onChange={() => null}
    />,
  );

  const message =
    '2 baselines are subtracted one after another, each estimated from what the last one left.';

  expect(html.match(/2 baselines are subtracted/g)).toHaveLength(1);
  expect(html.indexOf('Rolling-median baseline')).toBeLessThan(
    html.indexOf(message),
  );
});

test('a panel that has already checked the settings may hand over an empty list', () => {
  const html = renderToStaticMarkup(
    <FilterChainEditor
      value={[{ name: 'reverseIfNeeded' }]}
      onChange={() => null}
      problems={[]}
    />,
  );

  expect(html).toContain('Turns a descending axis the right way round.');
  expect(html).not.toContain(
    'The chain already turns a descending axis round before every step, so this one does nothing.',
  );
});
