// @vitest-environment jsdom
/**
 * What the principal-component picker hands up: the two components a score
 * plot is drawn against, and how the decomposition is asked to run.
 *
 * It is mounted under a parent owning both, as a page does, so each pick is
 * read back as the selection or the settings handed up.
 */

import { useState } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';

import type {
  PrincipalComponentSelection,
  PrincipalComponentSettings,
} from '../../core/principalComponents.ts';
import { PrincipalComponentSelect } from '../PrincipalComponentSelect.tsx';

import type { Harness } from './settingsHarness.tsx';
import {
  createHarness,
  field,
  pick,
  toggle,
  type,
} from './settingsHarness.tsx';

let harness: Harness;
let selections: PrincipalComponentSelection[];
let settingsHandedUp: PrincipalComponentSettings[];

function Picker(props: { settings: PrincipalComponentSettings }) {
  const [selection, setSelection] = useState({ x: 0, y: 1 });
  const [settings, setSettings] = useState(props.settings);
  return (
    <PrincipalComponentSelect
      value={selection}
      count={4}
      explainedVariance={[0.5, 0.25, 0.125, 0.0625]}
      settings={settings}
      onChange={(next) => {
        selections.push(next);
        setSelection(next);
      }}
      onSettingsChange={(next) => {
        settingsHandedUp.push(next);
        setSettings(next);
      }}
    />
  );
}

beforeEach(() => {
  harness = createHarness();
  selections = [];
  settingsHandedUp = [];
});

afterEach(() => {
  harness.dispose();
});

function render(settings: PrincipalComponentSettings = {}): HTMLDivElement {
  harness.render(<Picker settings={settings} />);
  return harness.host;
}

function menu(host: HTMLElement, label: string): HTMLSelectElement | null {
  const found = [...host.querySelectorAll('label')].find(
    (candidate) => candidate.querySelector('span')?.textContent === label,
  );
  return found?.querySelector('select') ?? null;
}

test('each axis takes the component picked, and the share follows', () => {
  const host = render();

  pick(menu(host, 'Horizontal axis'), '2');

  expect(selections).toStrictEqual([{ x: 2, y: 1 }]);
  expect(host.textContent).toContain(
    'Together they carry 37.5 % of the variance.',
  );

  pick(menu(host, 'Vertical axis'), '3');

  expect(selections.at(-1)).toStrictEqual({ x: 2, y: 3 });
  expect(host.textContent).toContain(
    'Together they carry 18.8 % of the variance.',
  );
});

test('NIPALS asks how many components to compute, and the others do not', () => {
  const host = render();

  expect(host.textContent).not.toContain('Components to compute');

  pick(menu(host, 'Method'), 'NIPALS');
  type(field(host, 'Components to compute'), '3');

  expect(settingsHandedUp).toStrictEqual([
    { method: 'NIPALS' },
    { method: 'NIPALS', nCompNIPALS: 3 },
  ]);

  pick(menu(host, 'Method'), 'covarianceMatrix');

  expect(settingsHandedUp.at(-1)).toStrictEqual({
    method: 'covarianceMatrix',
    nCompNIPALS: 3,
  });
  expect(host.textContent).not.toContain('Components to compute');
});

test('a method the menu does not list is not written', () => {
  const host = render({ method: 'SVD' });

  pick(menu(host, 'Method'), 'QR');

  expect(settingsHandedUp).toStrictEqual([]);
});

test('the three switches write centring, scaling and flat columns', () => {
  const host = render();

  toggle(host, 'Centre the columns (on unless turned off)');
  toggle(host, 'Scale the columns (off unless turned on)');
  toggle(host, 'Ignore flat columns (only matters while scaling)');

  expect(settingsHandedUp.at(-1)).toStrictEqual({
    center: false,
    scale: true,
    ignoreZeroVariance: true,
  });
});
