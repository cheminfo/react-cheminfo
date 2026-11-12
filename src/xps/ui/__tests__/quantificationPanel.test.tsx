// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { vamasFixture } from '../../core/__tests__/vamasFixture.ts';
import type { XpsSpectrum } from '../../core/xpsSpectrum.ts';
import type { XpsSettings } from '../../core/xpsState.ts';
import { QuantificationPanel } from '../QuantificationPanel.tsx';
import { XpsCommandProvider } from '../XpsCommandProvider.tsx';
import { XpsHighlightProvider } from '../XpsHighlightProvider.tsx';
import { XpsSettingsDialog } from '../XpsSettingsDialog.tsx';
import { XpsStateProvider } from '../XpsStateProvider.tsx';
import { useXpsEditor } from '../useXpsEditor.ts';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('a survey is quantified with the Kratos library and its formulas proposed', async () => {
  const { spectra } = await vamasFixture('polyethyleneglycol');
  await mount(spectra, <QuantificationPanel />);

  const rows = rowTexts();

  expect(rows).toHaveLength(2);
  expect(rows[0]).toContain('66.8%');
  expect(rows[1]).toContain('33.2%');
  expect(host.textContent).toContain(
    'Areas over a Shirley background, divided by the factors of Kratos, Al Kα.',
  );

  await vi.waitFor(() => {
    expect(host.textContent).toContain('C2O');
  });
});

test('an element typed into the field is read on its strongest line', async () => {
  const { spectra } = await vamasFixture('polyethyleneglycol');
  await mount(spectra, <QuantificationPanel />);

  const field = host.querySelector<HTMLInputElement>(
    'input[placeholder="C O N"]',
  );

  expect(field?.value).toBe('C O');

  await act(async () => {
    typeInto(field, 'C O N Xx H');
    field?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });

  expect(
    rowTexts().map((text) => text.slice(0, text.indexOf(' '))),
  ).toStrictEqual(['C', 'O', 'N']);
  expect(host.textContent).toContain('Xx is not an element symbol.');
  expect(host.textContent).toContain(
    'A survey does not see H, so it is left out.',
  );
});

test('an instrument entered in the dialog quantifies the survey', async () => {
  const { spectra } = await vamasFixture('polyethyleneglycol');
  await mount(
    spectra,
    <>
      <QuantificationPanel />
      <XpsSettingsDialog isOpen onClose={() => undefined} />
    </>,
  );

  await act(async () => {
    buttonNamed('New').click();
  });
  const line = document.querySelector<HTMLInputElement>(
    'input[placeholder="N 1s 0.477"]',
  );
  await act(async () => {
    typeInto(line, 'C 1s 0.278');
    line?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
  await act(async () => {
    buttonNamed('Quantify with it').click();
  });

  const { instruments, instrumentId } = currentSettings();

  expect(instruments.map((instrument) => instrument.name)).toStrictEqual([
    'New instrument',
  ]);
  expect(instruments[0]?.factors).toStrictEqual([
    { element: 'C', orbital: '1s', factor: 0.278 },
  ]);
  expect(instrumentId).toBe(instruments[0]?.id);

  // Carbon alone has a factor now, so it is the whole composition, and oxygen
  // says why it is left out.
  const rows = rowTexts();

  expect(rows[0]).toContain('100.0%');
  expect(rows[1]).toContain('no factor');
});

/**
 * Mount a component inside a viewer holding the given spectra, the first
 * survey among them selected.
 * @param spectra - The spectra.
 * @param children - What to mount.
 */
async function mount(spectra: XpsSpectrum[], children: ReactNode) {
  await act(async () => {
    root.render(<Viewer spectra={spectra}>{children}</Viewer>);
  });
}

/**
 * A viewer around what is tested, keeping nothing between tests.
 * @param props - The spectra, and what to mount inside.
 * @param props.spectra - The spectra it opens on; the first is selected.
 * @param props.children - What to mount.
 * @returns The viewer.
 */
function Viewer(props: { spectra: XpsSpectrum[]; children: ReactNode }) {
  const editor = useXpsEditor({ spectra: props.spectra, storageKey: null });
  return (
    <XpsStateProvider editor={editor}>
      <XpsHighlightProvider>
        <XpsCommandProvider handlers={{}}>
          <output
            hidden
            data-settings={JSON.stringify(editor.state.settings)}
          />
          {props.children}
        </XpsCommandProvider>
      </XpsHighlightProvider>
    </XpsStateProvider>
  );
}

/**
 * The workspace as the viewer last drew it.
 * @returns The settings.
 */
function currentSettings(): XpsSettings {
  const written = host.querySelector('output')?.dataset.settings;
  if (written === undefined) throw new Error('The viewer is not drawn');
  return JSON.parse(written) as XpsSettings;
}

/**
 * The text of each row of the quantification table.
 * @returns One string per row.
 */
function rowTexts(): string[] {
  const table = host.querySelector('table');
  if (table === null) return [];
  return [...table.querySelectorAll('tbody tr')].map((row) => {
    const select = row.querySelector('select');
    const level = select?.value ?? '';
    const element = select?.selectedOptions[0]?.textContent ?? level;
    return `${element} ${row.textContent ?? ''}`;
  });
}

/**
 * The button whose text is exactly the one given, wherever it is drawn.
 * @param text - Its text.
 * @returns The button.
 */
function buttonNamed(text: string): HTMLButtonElement {
  for (const button of document.querySelectorAll('button')) {
    if (button.textContent?.trim() === text) return button;
  }
  throw new Error(`No button reads ${text}`);
}

/**
 * Type into a field the way React hears it.
 * @param field - The field.
 * @param value - What it holds afterwards.
 */
function typeInto(field: HTMLInputElement | null, value: string) {
  if (field === null) throw new Error('No such field');
  // React follows the value through its own setter, which a plain assignment
  // on the element would bypass.
  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  );
  descriptor?.set?.call(field, value);
  field.dispatchEvent(new Event('input', { bubbles: true }));
}
