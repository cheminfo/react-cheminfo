// @vitest-environment jsdom
/**
 * The control of a step's option that is not a number: a switch, a menu, a
 * formula, and the plain text box any other option falls back to.
 *
 * Each one hands up the value a reader set, and `undefined` once they have
 * cleared it, so the option goes back to upstream's default.
 */

import { useState } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import type { FilterField } from '../../core/filterFields.ts';
import { FilterChoiceControl } from '../FilterChoiceControl.tsx';

import type { Harness } from './settingsHarness.tsx';
import {
  createHarness,
  field,
  pick,
  toggle,
  type,
} from './settingsHarness.tsx';

let harness: Harness;
let values: unknown[];

beforeEach(() => {
  harness = createHarness();
  values = [];
});

afterEach(() => {
  harness.dispose();
});

function Option(props: { field: FilterField; initial: unknown }) {
  const [value, setValue] = useState(props.initial);
  return (
    <FilterChoiceControl
      field={props.field}
      value={value}
      onChange={(next) => {
        values.push(next);
        setValue(next);
      }}
    />
  );
}

function render(field: FilterField, initial: unknown): HTMLDivElement {
  harness.render(<Option field={field} initial={initial} />);
  return harness.host;
}

test('a switch hands up whether it is on, and says what it does', () => {
  const host = render(
    {
      key: 'smooth',
      label: 'Smooth first',
      kind: 'boolean',
      help: 'Runs a Savitzky–Golay pass before picking.',
    },
    true,
  );

  expect(host.textContent).toContain(
    'Runs a Savitzky–Golay pass before picking.',
  );

  toggle(host, 'Smooth first');

  expect(values).toStrictEqual([false]);
});

test('a menu offers the default first, and picking it clears the option', () => {
  const host = render(
    {
      key: 'algorithm',
      label: 'Divide by',
      kind: 'enum',
      choices: [{ value: 'max', label: 'Largest value' }],
    },
    'max',
  );
  const menu = host.querySelector('select');

  expect(menu?.value).toBe('max');

  pick(menu, '');

  expect(values).toStrictEqual([undefined]);
});

test('an option of any other kind is typed as text, and emptied is cleared', () => {
  const host = render(
    { key: 'label', label: 'Label', kind: 'number', help: 'Free text.' },
    42,
  );

  expect(field(host, 'Label').value).toBe('');
  expect(host.textContent).toContain('Free text.');

  type(field(host, 'Label'), 'blank');
  type(field(host, 'Label'), '');

  expect(values).toStrictEqual(['blank', undefined]);
});
