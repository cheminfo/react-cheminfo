// @vitest-environment jsdom
/**
 * A panel a host adds to the viewer, behaving as the viewer's own panels do.
 *
 * Mounted rather than rendered to a string, because closing a panel and opening
 * it again from its icon are gestures, and what they answer is the point.
 */

import { Classes } from '@blueprintjs/core';
import { getByRole } from '@testing-library/dom';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { calciteSpectrum as calcite } from '../../core/__tests__/ramanFixture.ts';
import { IrEditor } from '../IrEditor.tsx';
import { RamanEditor } from '../RamanEditor.tsx';
import type { IrHostPanel } from '../irHostPanels.ts';
import { irStackPanels } from '../irHostPanels.ts';
import { useIrEditorState } from '../irStateContext.ts';

const prediction: IrHostPanel = {
  id: 'prediction',
  title: 'Prediction',
  icon: 'predictive-analysis',
  content: <p>Draw a structure, then predict its spectrum.</p>,
};

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal('ResizeObserver', NoResizeObserver);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

/**
 * The activity bar's items, top to bottom: the bar puts each panel's id on its
 * item, and nothing else in the viewer is a button carrying one.
 * @returns The items.
 */
function railButtons(): HTMLButtonElement[] {
  return [...host.querySelectorAll<HTMLButtonElement>('button[data-panel-id]')];
}

/**
 * The panel id of every item of the activity bar, top to bottom.
 * @returns The ids.
 */
function railIds(): string[] {
  return railButtons().map((button) => button.dataset.panelId ?? '');
}

/**
 * The items of the activity bar that are switched on.
 * @returns The id of each.
 */
function activeRailIds(): string[] {
  return railButtons()
    .filter((button) => button.classList.contains(Classes.ACTIVE))
    .map((button) => button.dataset.panelId ?? '');
}

/**
 * How the column the panels stand in is displayed: it is what follows the
 * splitter, which is found by the mark it draws since emotion hashes its class.
 * @returns The column's `display`, `undefined` when no splitter is drawn.
 */
function sideDisplay(): string | undefined {
  for (const element of host.querySelectorAll('div')) {
    if (element.textContent === '⋮' && element.childElementCount === 1) {
      return (element.nextElementSibling as HTMLElement | null)?.style.display;
    }
  }
  return undefined;
}

/**
 * The close button of every panel in the stack, top to bottom.
 * @returns Each button's accessible name.
 */
function closeLabels(): string[] {
  return [
    ...host.querySelectorAll(
      '[aria-label^="Close the "][aria-label$=" panel"]',
    ),
  ].map((button) => button.getAttribute('aria-label') ?? '');
}

test("a host panel's icon comes first in the activity bar", () => {
  act(() => root.render(<IrEditor panels={[prediction]} />));

  expect(railIds()).toStrictEqual([
    'prediction',
    'spectra',
    'bands',
    'metadata',
  ]);
  // Not opened unless asked for: the viewer still opens on its own two.
  expect(activeRailIds()).toStrictEqual(['spectra', 'bands']);
  expect(closeLabels()).toStrictEqual([
    'Close the spectra panel',
    'Close the bands panel',
  ]);
  // Each toggle is named by its panel's title, the host's like the viewer's.
  expect(
    getByRole(host, 'button', { name: 'Prediction' }).dataset.panelId,
  ).toBe('prediction');
  expect(
    getByRole(host, 'button', { name: 'Acquisition' }).dataset.panelId,
  ).toBe('metadata');
});

test('a host panel named in defaultPanelIds opens on its content', () => {
  act(() =>
    root.render(
      <IrEditor panels={[prediction]} defaultPanelIds={['prediction']} />,
    ),
  );

  expect(activeRailIds()).toStrictEqual(['prediction']);
  expect(closeLabels()).toStrictEqual(['Close the prediction panel']);
  expect(sideDisplay()).toBe('flex');
  expect(host.querySelector('div[role="button"]')?.textContent).toBe(
    'Prediction',
  );
  expect(host.textContent).toContain(
    'Draw a structure, then predict its spectrum.',
  );
});

test('a host panel is closed from its header and opened again from its icon', () => {
  act(() =>
    root.render(
      <IrEditor
        panels={[prediction]}
        defaultPanelIds={['spectra', 'prediction']}
      />,
    ),
  );

  // Stacked in the order of the icons, not of the ids asked for.
  expect(closeLabels()).toStrictEqual([
    'Close the prediction panel',
    'Close the spectra panel',
  ]);

  act(() =>
    getByRole(host, 'button', { name: 'Close the prediction panel' }).click(),
  );

  expect(closeLabels()).toStrictEqual(['Close the spectra panel']);
  expect(activeRailIds()).toStrictEqual(['spectra']);
  expect(host.textContent).not.toContain('predict its spectrum');

  act(() => getByRole(host, 'button', { name: 'Prediction' }).click());

  expect(closeLabels()).toStrictEqual([
    'Close the prediction panel',
    'Close the spectra panel',
  ]);
  expect(activeRailIds()).toStrictEqual(['prediction', 'spectra']);
});

test('an id in defaultPanelIds that no panel answers to is ignored', () => {
  act(() =>
    root.render(
      <IrEditor
        panels={[prediction]}
        defaultPanelIds={['nowhere', 'prediction']}
      />,
    ),
  );

  expect(activeRailIds()).toStrictEqual(['prediction']);
  expect(closeLabels()).toStrictEqual(['Close the prediction panel']);
});

test('a viewer asked only for panels nobody offers opens with its side shut', () => {
  act(() =>
    root.render(
      <IrEditor panels={[prediction]} defaultPanelIds={['nowhere']} />,
    ),
  );

  expect(activeRailIds()).toStrictEqual([]);
  expect(closeLabels()).toStrictEqual([]);
  // Shut, rather than drawn as an empty column beside the chart.
  expect(sideDisplay()).toBe('none');
});

test('a Raman viewer takes host panels, whose body reads the viewer', () => {
  act(() =>
    root.render(
      <RamanEditor
        data={[calcite()]}
        panels={[{ ...prediction, content: <SelectedName /> }]}
        defaultPanelIds={['prediction', 'bands']}
      />,
    ),
  );

  expect(railIds()).toStrictEqual([
    'prediction',
    'spectra',
    'bands',
    'metadata',
  ]);
  expect(closeLabels()).toStrictEqual([
    'Close the prediction panel',
    'Close the bands panel',
  ]);
  expect(host.textContent).toContain('Predicting for calcite');
});

test('a host panel claiming an id already taken is left out', () => {
  const ids = irStackPanels([
    prediction,
    { ...prediction, title: 'Prediction again' },
    { ...prediction, id: 'bands', title: 'Not the bands' },
  ]).map((panel) => `${panel.id}: ${panel.title}`);

  expect(ids).toStrictEqual([
    'prediction: Prediction',
    'spectra: Spectra',
    'bands: Bands',
    'metadata: Acquisition',
  ]);
});

/**
 * A host panel's body that asks the viewer it stands in what is selected.
 * @returns What it would predict for.
 */
function SelectedName() {
  const { selectedSpectrum } = useIrEditorState();
  return <p>{`Predicting for ${selectedSpectrum?.name ?? 'nothing'}`}</p>;
}

/** A `ResizeObserver` that observes nothing, for a DOM where nothing resizes. */
class NoResizeObserver implements ResizeObserver {
  public observe(): void {
    // Nothing is measured here.
  }

  public unobserve(): void {
    // Nothing was observed.
  }

  public disconnect(): void {
    // Nothing was observed.
  }
}
