// @vitest-environment jsdom
/**
 * What editing the grid stage writes into the settings a processor is built
 * with: the memory budget, the grid, the order, the excluded zones and the
 * chain.
 *
 * The whole settings panel is mounted under a parent owning the settings, as a
 * page does, so each edit is read back as the settings handed up — which is
 * also how the panel itself passes an edit of one stage up whole.
 */

import { useState } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import type {
  NormalizationSettings,
  SpectraSettings,
} from '../../core/settings.ts';
import { EMPTY_SETTINGS } from '../../core/settings.ts';
import { SpectraSettingsEditor } from '../SpectraSettingsEditor.tsx';

import type { Harness } from './settingsHarness.tsx';
import {
  createHarness,
  field,
  pick,
  press,
  toggle,
  type,
} from './settingsHarness.tsx';

let harness: Harness;
let edits: SpectraSettings[];

function Panel(props: { initial: SpectraSettings }) {
  const [settings, setSettings] = useState(props.initial);
  return (
    <SpectraSettingsEditor
      value={settings}
      onChange={(next) => {
        edits.push(next);
        setSettings(next);
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

function render(initial: SpectraSettings = EMPTY_SETTINGS): HTMLDivElement {
  harness.render(<Panel initial={initial} />);
  return harness.host;
}

function normalization(): NormalizationSettings | undefined {
  return edits.at(-1)?.processor.normalization;
}

test('the budget is typed in megabytes and kept in bytes, and emptied is gone', () => {
  const host = render();

  type(field(host, 'Budget (MB)'), '256');

  expect(edits.at(-1)?.processor).toStrictEqual({
    normalization: {},
    maxMemory: 268_435_456,
  });

  type(field(host, 'Budget (MB)'), '');

  expect(edits.at(-1)?.processor).toStrictEqual({ normalization: {} });
});

test('the grid is its two bounds and its number of points', () => {
  const host = render();

  type(field(host, 'From'), '400');
  type(field(host, 'To'), '4000');
  type(field(host, 'Number of points'), '2048');

  expect(normalization()).toStrictEqual({
    from: 400,
    to: 4000,
    numberOfPoints: 2048,
  });
  expect(edits.at(-1)?.postProcessing).toStrictEqual({});
});

test('the order control says whether the grid is applied first', () => {
  const host = render();

  press(host, 'Resample, then filter');

  expect(normalization()).toStrictEqual({ applyRangeSelectionFirst: true });
  expect(host.textContent).toContain(
    'The range and the excluded zones are read in the x the file holds',
  );

  press(host, 'Filter, then resample');

  expect(normalization()).toStrictEqual({ applyRangeSelectionFirst: false });
});

test('an excluded zone opens empty, takes its bounds, hides, and goes', () => {
  const host = render();

  press(host, 'Add a zone');

  expect(normalization()).toStrictEqual({ exclusions: [{}] });

  type(field(host, 'From', 1), '2200');
  type(field(host, 'To', 1), '2400');
  toggle(host, 'Hide on the chart only');

  expect(normalization()).toStrictEqual({
    exclusions: [{ from: 2200, to: 2400, ignore: true }],
  });

  press(host, 'Remove Excluded zones 1');

  expect(normalization()).toStrictEqual({ exclusions: [] });
  expect(host.textContent).toContain('None — the whole range is used.');
});

test('a step added to the chain is written into the normalization', () => {
  const host = render({
    ...EMPTY_SETTINGS,
    processor: { normalization: { from: 400 } },
  });

  pick(
    host.querySelector('select[aria-label="Add a step"]'),
    'rollingBallBaseline',
  );

  expect(normalization()).toStrictEqual({
    from: 400,
    filters: [{ name: 'rollingBallBaseline' }],
  });
  expect(host.textContent).toContain('1Rolling-ball baseline');
});
