import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import { setFilterOption } from '../../core/filterChain.ts';
import {
  booleanField,
  enumField,
  formulaField,
  integerField,
  numberField,
  zonesField,
} from '../../core/filterFields.ts';
import { FilterFieldControl } from '../FilterFieldControl.tsx';

const DIVIDE_BY = enumField(
  'algorithm',
  'Divide by',
  [
    { value: 'absolute', label: 'Sum of absolute values' },
    { value: 'max', label: 'Largest value' },
    { value: 'sum', label: 'Signed sum' },
  ],
  'Largest value with 100 is the familiar normalization.',
);

test('a number field carries its label, upstream’s default as a placeholder, and its help line', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={numberField(
        'gsd.minMaxRatio',
        'Smallest peak kept',
        '0.1',
        'As a fraction of the tallest.',
      )}
      filter={{ name: 'calibrateX' }}
      onChange={() => null}
    />,
  );

  expect(html).toContain('>Smallest peak kept</span>');
  expect(html).toContain('placeholder="0.1"');
  expect(html).toContain('>As a fraction of the tallest.</span>');
  expect(html).toContain('inputMode="decimal"');
});

test('an integer field asks the keyboard for whole numbers', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={integerField('windowSize', 'Window size', '9')}
      filter={{ name: 'savitzkyGolay' }}
      onChange={() => null}
    />,
  );

  expect(html).toContain('inputMode="numeric"');
  expect(html).toContain('placeholder="9"');
});

test('a number field shows the value the step holds, nested keys included', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={integerField(
        'gsd.sgOptions.windowSize',
        'Peak-picking window',
        '7',
      )}
      filter={{
        name: 'calibrateX',
        options: { gsd: { sgOptions: { windowSize: 11 } } },
      }}
      onChange={() => null}
    />,
  );

  expect(html).toContain('value="11"');
});

test('a value of the wrong type is left to upstream rather than shown as it stands', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={numberField('from', 'From (x)', 'the first x')}
      filter={setFilterOption({ name: 'fromTo' }, 'from', 'nonsense')}
      onChange={() => null}
    />,
  );

  expect(html).toContain('>From (x)</span>');
  expect(html).toContain('placeholder="the first x"');
  expect(html).toContain('value=""');
  expect(html).not.toContain('nonsense');
});

test('a boolean field draws a switch that is on when the step says so', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={booleanField(
        'gsd.maxCriteria',
        'Pick maxima',
        'Off picks minima instead.',
      )}
      filter={{ name: 'calibrateX', options: { gsd: { maxCriteria: true } } }}
      onChange={() => null}
    />,
  );

  expect(html).toContain('type="checkbox" checked=""');
  expect(html).toContain('Pick maxima');
  expect(html).toContain('>Off picks minima instead.</span>');
});

test('a boolean field the step leaves unset draws the switch off', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={booleanField('gsd.smoothY', 'Smooth before picking')}
      filter={{ name: 'calibrateX' }}
      onChange={() => null}
    />,
  );

  expect(html).toContain('type="checkbox"/>');
  expect(html).not.toContain('checked');
});

test('an enum field offers Default first, then each of its choices once', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={DIVIDE_BY}
      filter={{ name: 'normed' }}
      onChange={() => null}
    />,
  );

  expect(html.match(/<option /g)).toHaveLength(4);
  expect(html).toContain('<option value="" selected="">Default</option>');
  expect(html).toContain('<option value="max">Largest value</option>');
  expect(html).toContain(
    '>Largest value with 100 is the familiar normalization.</span>',
  );
});

test('an enum field marks the choice the step holds, so Default is no longer selected', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={DIVIDE_BY}
      filter={{ name: 'normed', options: { algorithm: 'max' } }}
      onChange={() => null}
    />,
  );

  expect(html).toContain(
    '<option value="max" selected="">Largest value</option>',
  );
  expect(html).toContain('<option value="">Default</option>');
});

test('a formula field is monospace and refuses every browser correction', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={formulaField(
        'function',
        'Expression in y',
        'For instance -log10(y).',
      )}
      filter={{ name: 'yFunction', options: { function: '-log10(y)' } }}
      onChange={() => null}
    />,
  );

  expect(html).toContain('style="font-family:monospace"');
  expect(html).toContain(
    'spellCheck="false" autoCapitalize="off" autoCorrect="off" autoComplete="off"',
  );
  expect(html).toContain('value="-log10(y)"');
});

test('a zones field lists the stretches the step holds, both bounds each', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={zonesField('zones', 'Zones to keep')}
      filter={{ name: 'filterX', options: { zones: [{ from: 1, to: 2 }] } }}
      onChange={() => null}
    />,
  );

  expect(html).toContain('>Zones to keep</span>');
  expect(html).toContain('value="1"');
  expect(html).toContain('value="2"');
});

test('a zones field holding something that is not a list of zones reads as none at all', () => {
  const html = renderToStaticMarkup(
    <FilterFieldControl
      field={zonesField('exclusions', 'Zones to drop', 'Dropping wins.')}
      filter={setFilterOption({ name: 'filterX' }, 'exclusions', 'nonsense')}
      onChange={() => null}
    />,
  );

  expect(html).toContain('None — the whole range is used.');
  expect(html).toContain('>Dropping wins.</span>');
  expect(html).not.toContain('nonsense');
});
