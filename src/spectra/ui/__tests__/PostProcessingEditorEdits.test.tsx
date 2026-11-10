// @vitest-environment jsdom
/**
 * What editing the stage run across spectra writes into the post-processing
 * settings: which spectra, the matrix steps, the scaling, the ranges and the
 * calculations.
 *
 * The stage is mounted under a parent owning its settings, as the settings
 * panel does, so each edit is read back as the settings handed up.
 */

import { useState } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import type { PostProcessingSettings } from '../../core/settings.ts';
import { PostProcessingEditor } from '../PostProcessingEditor.tsx';

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
let edits: PostProcessingSettings[];

function Stage(props: {
  initial: PostProcessingSettings;
  spectrumIds?: readonly string[];
}) {
  const [settings, setSettings] = useState(props.initial);
  return (
    <PostProcessingEditor
      value={settings}
      problems={[]}
      spectrumIds={props.spectrumIds}
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

function render(
  initial: PostProcessingSettings = {},
  spectrumIds?: readonly string[],
): HTMLDivElement {
  harness.render(<Stage initial={initial} spectrumIds={spectrumIds} />);
  return harness.host;
}

function last(): PostProcessingSettings | undefined {
  return edits.at(-1);
}

test('typed ids are a list, and an emptied box means every spectrum', () => {
  const host = render({ ids: ['old'] });
  const box = field(host, 'Spectra');

  expect(box.value).toBe('old');

  type(box, 'a, b ,, c,');

  expect(last()).toStrictEqual({ ids: ['a', 'b', 'c'] });

  type(box, ' , ');

  expect(last()).toStrictEqual({});
});

test('ticked ids name a list until every spectrum is ticked again', () => {
  const host = render({}, ['a', 'b', 'c']);

  toggle(host, 'b');

  expect(last()).toStrictEqual({ ids: ['a', 'c'] });

  toggle(host, 'b');

  expect(last()).toStrictEqual({});
});

test('an id the processor does not hold can be unticked like the others', () => {
  const host = render({ ids: ['a', 'x'] }, ['a', 'b']);

  toggle(host, 'x — not a spectrum the processor holds');

  expect(last()).toStrictEqual({ ids: ['a'] });
});

test('matrix steps are added, given options, moved and removed', () => {
  const host = render();
  const menu = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Add a matrix step"]',
  );

  pick(menu, '');

  expect(edits).toStrictEqual([]);

  pick(menu, 'pqn');
  pick(menu, 'centerMean');
  type(field(host, 'Max'), '50');

  expect(last()).toStrictEqual({
    filters: [{ name: 'pqn', options: { max: 50 } }, { name: 'centerMean' }],
  });

  press(host, 'Move matrix step 2 up');

  expect(last()?.filters?.map((step) => step.name)).toStrictEqual([
    'centerMean',
    'pqn',
  ]);

  press(host, 'Move matrix step 1 down');
  press(host, 'Remove matrix step 1');

  expect(last()).toStrictEqual({ filters: [{ name: 'centerMean' }] });
});

test('a matrix step no one knows is named, and offers no option', () => {
  const host = render({ filters: [{ name: 'whiten' }] });

  expect(host.textContent).toContain('whiten');
  expect(host.textContent).not.toContain('None — the matrix is handed on');
});

test('the scaling takes a method, a typed reference, a window and the switch', () => {
  const host = render();

  pick(host.querySelector('select[aria-label="Scaling method"]'), 'max');
  type(field(host, 'Reference spectrum'), 'blank');
  type(field(host, 'From'), '1000');
  type(field(host, 'To'), '1800');
  type(field(host, 'From point'), '2');
  type(field(host, 'To point'), '20');
  toggle(host, 'Subtract the reference spectrum');

  expect(last()).toStrictEqual({
    scale: {
      method: 'max',
      targetID: 'blank',
      range: { from: 1000, to: 1800, fromIndex: 2, toIndex: 20 },
      relative: true,
    },
  });

  pick(host.querySelector('select[aria-label="Scaling method"]'), '');
  type(field(host, 'Reference spectrum'), '');
  for (const bound of ['From', 'To', 'From point', 'To point']) {
    type(field(host, bound), '');
  }

  expect(last()).toStrictEqual({ scale: { relative: true } });
});

test('a reference picked among the ids held is named, and the first one is none', () => {
  const host = render({}, ['a', 'b']);
  const menu = host.querySelector<HTMLSelectElement>(
    'select[aria-label="Reference spectrum"]',
  );

  pick(menu, 'b');

  expect(last()).toStrictEqual({ scale: { targetID: 'b' } });

  pick(menu, '');

  expect(last()).toStrictEqual({ scale: {} });
});

test('a range is named and bounded, and removed again', () => {
  const host = render();

  press(host, 'Add a range');

  expect(last()).toStrictEqual({ ranges: [{ label: '' }] });

  type(
    host.querySelector<HTMLInputElement>('[aria-label="Name of range 1"]') ??
      document.createElement('input'),
    'amide',
  );
  type(field(host, 'From', 1), '1650');
  type(field(host, 'To', 1), '1700');

  expect(last()).toStrictEqual({
    ranges: [{ label: 'amide', from: 1650, to: 1700 }],
  });

  press(host, 'Remove range 1');

  expect(last()).toStrictEqual({ ranges: [] });
});

test('a calculation is a name and a formula', () => {
  const host = render();

  press(host, 'Add a calculation');
  type(
    host.querySelector<HTMLInputElement>(
      '[aria-label="Name of calculation 1"]',
    ) ?? document.createElement('input'),
    'share',
  );
  type(
    host.querySelector<HTMLInputElement>(
      '[aria-label="Formula of calculation 1"]',
    ) ?? document.createElement('input'),
    'amide / total',
  );

  expect(last()).toStrictEqual({
    calculations: [{ label: 'share', formula: 'amide / total' }],
  });

  press(host, 'Remove calculation 1');

  expect(last()).toStrictEqual({ calculations: [] });
});
