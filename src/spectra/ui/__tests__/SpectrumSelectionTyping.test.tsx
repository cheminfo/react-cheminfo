// @vitest-environment jsdom
/**
 * The ids typed into the box, one key at a time, under a parent that owns them.
 *
 * The parent hands the list back on every keystroke, and the box must keep
 * what was typed rather than be rewritten under the caret in the form the
 * list is shown in.
 */

import { useState } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import { SpectrumSelection } from '../SpectrumSelection.tsx';

import type { Harness } from './settingsHarness.tsx';
import { createHarness, field, type } from './settingsHarness.tsx';

let harness: Harness;
const handed: Array<string[] | undefined> = [];

function Owner(props: { initial?: string[] }) {
  const [value, setValue] = useState(props.initial);
  return (
    <SpectrumSelection
      value={value}
      onChange={(ids) => {
        handed.push(ids);
        setValue(ids);
      }}
    />
  );
}

beforeEach(() => {
  handed.length = 0;
  harness = createHarness();
});

afterEach(() => {
  harness.dispose();
});

test('the box keeps what was typed while the parent hands each list back', () => {
  harness.render(<Owner />);
  const box = field(harness.host, 'Spectra');

  for (const text of ['a', 'a,', 'a,b', 'a,b ', 'a,b ,c']) {
    type(box, text);

    expect(box.value).toBe(text);
  }

  expect(handed).toStrictEqual([
    ['a'],
    ['a'],
    ['a', 'b'],
    ['a', 'b'],
    ['a', 'b', 'c'],
  ]);
});

test('emptying the box hands up every spectrum, and leaves it empty', () => {
  harness.render(<Owner initial={['x', 'y']} />);
  const box = field(harness.host, 'Spectra');

  expect(box.value).toBe('x, y');

  type(box, '');

  expect(box.value).toBe('');
  expect(handed).toStrictEqual([undefined]);
});
