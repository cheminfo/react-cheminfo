// @vitest-environment jsdom
/**
 * What each control of the chain editor does to the chain: the moves, the
 * repeat, the removal, the add menu, and the options typed into a step.
 *
 * The editor is mounted under a parent owning the chain, as a settings panel
 * does, so every edit is read back as the chain it handed up.
 */

import { useState } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import type { SpectrumFilter } from '../../core/settings.ts';
import { FilterChainEditor } from '../FilterChainEditor.tsx';

import type { Harness } from './settingsHarness.tsx';
import {
  createHarness,
  field,
  pick,
  press,
  toggle,
  type,
} from './settingsHarness.tsx';

const THREE: SpectrumFilter[] = [
  { name: 'rollingBallBaseline' },
  { name: 'savitzkyGolay', options: { windowSize: 9 } },
  { name: 'centerMean' },
];

let harness: Harness;
let edits: SpectrumFilter[][];

function Chain(props: { initial: SpectrumFilter[] }) {
  const [chain, setChain] = useState(props.initial);
  return (
    <FilterChainEditor
      value={chain}
      onChange={(next) => {
        edits.push(next);
        setChain(next);
      }}
    />
  );
}

beforeEach(() => {
  harness = createHarness();
  edits = [];
});

afterEach(() => {
  harness.dispose();
});

function render(initial: SpectrumFilter[]): HTMLDivElement {
  harness.render(<Chain initial={initial} />);
  return harness.host;
}

function names(): string[] {
  return (edits.at(-1) ?? []).map((step) => step.name);
}

test('a step moves up and down the chain', () => {
  const host = render(THREE);

  press(host, 'Move Centre on the mean up');

  expect(names()).toStrictEqual([
    'rollingBallBaseline',
    'centerMean',
    'savitzkyGolay',
  ]);

  press(host, 'Move Rolling-ball baseline down');

  expect(names()).toStrictEqual([
    'centerMean',
    'rollingBallBaseline',
    'savitzkyGolay',
  ]);
});

test('a step repeated lands just after itself, as a copy of its options', () => {
  const host = render(THREE);

  press(host, 'Repeat Savitzky–Golay smoothing');
  const chain = edits.at(-1) ?? [];

  expect(chain).toStrictEqual([
    { name: 'rollingBallBaseline' },
    { name: 'savitzkyGolay', options: { windowSize: 9 } },
    { name: 'savitzkyGolay', options: { windowSize: 9 } },
    { name: 'centerMean' },
  ]);
  expect(chain[2]).not.toBe(chain[1]);
});

test('a step removed leaves the others in their order', () => {
  const host = render(THREE);

  press(host, 'Remove Rolling-ball baseline');

  expect(names()).toStrictEqual(['savitzkyGolay', 'centerMean']);
  expect(host.textContent).toContain('1Savitzky–Golay smoothing');
});

test('a step picked from the menu is added at the end, with its defaults', () => {
  const host = render([]);
  const menu = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Add a step"]',
  );

  pick(menu, '');

  expect(edits).toStrictEqual([]);

  pick(menu, 'calibrateX');

  expect(edits).toStrictEqual([
    [
      {
        name: 'calibrateX',
        options: {
          gsd: {
            maxCriteria: true,
            minMaxRatio: 0.1,
            realTopDetection: true,
            smoothY: true,
            sgOptions: { windowSize: 7, polynomial: 3 },
          },
        },
      },
    ],
  ]);
  expect(menu?.value).toBe('');
});

test('a number typed into a step is its option, and emptied takes it away', () => {
  const host = render([{ name: 'setMinY' }]);

  type(field(host, 'Smallest y'), '-2.5');

  expect(edits.at(-1)).toStrictEqual([
    { name: 'setMinY', options: { min: -2.5 } },
  ]);

  type(field(host, 'Smallest y'), '');

  expect(edits.at(-1)).toStrictEqual([{ name: 'setMinY' }]);
});

test('a switch, a menu and a formula each write their option', () => {
  const host = render([
    { name: 'normed' },
    { name: 'yFunction' },
    { name: 'calibrateX' },
  ]);

  pick(host.querySelector('select:not([aria-label])'), 'max');

  expect(edits.at(-1)?.[0]).toStrictEqual({
    name: 'normed',
    options: { algorithm: 'max' },
  });

  pick(host.querySelector('select:not([aria-label])'), '');

  expect(edits.at(-1)?.[0]).toStrictEqual({ name: 'normed' });

  type(field(host, 'Expression in y'), '-log10(y)');

  expect(edits.at(-1)?.[1]).toStrictEqual({
    name: 'yFunction',
    options: { function: '-log10(y)' },
  });

  type(field(host, 'Expression in y'), '');

  expect(edits.at(-1)?.[1]).toStrictEqual({ name: 'yFunction' });

  toggle(host, 'Smooth before picking');

  expect(edits.at(-1)?.[2]).toStrictEqual({
    name: 'calibrateX',
    options: { gsd: { smoothY: true } },
  });
});

test('a step keeps its zones as a list, and no list once the last is removed', () => {
  const host = render([{ name: 'filterX' }]);

  press(host, 'Add a zone');

  expect(edits.at(-1)).toStrictEqual([
    { name: 'filterX', options: { zones: [{}] } },
  ]);

  type(field(host, 'From'), '400');

  expect(edits.at(-1)).toStrictEqual([
    { name: 'filterX', options: { zones: [{ from: 400 }] } },
  ]);

  press(host, 'Remove Zones to keep 1');

  expect(edits.at(-1)).toStrictEqual([{ name: 'filterX' }]);
});

test('a number half typed stays with its step when the step above goes', () => {
  const host = render([{ name: 'setMinY' }, { name: 'setMinY' }]);

  type(field(host, 'Smallest y', 1), '2.');

  expect(field(host, 'Smallest y', 1).value).toBe('2.');

  press(host, 'Remove Shift y to start at a value');

  expect(names()).toStrictEqual(['setMinY']);
  expect(field(host, 'Smallest y').value).toBe('2.');
});
