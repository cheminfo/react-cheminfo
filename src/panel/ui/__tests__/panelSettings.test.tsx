// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { act, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PanelSettingsButton } from '../PanelSettingsButton.tsx';
import { usePanelSettings } from '../usePanelSettings.ts';

interface Settings {
  volume: number;
}

const restored: Settings[] = [];
let host: HTMLDivElement;
let root: Root;

function Panel(): ReactElement {
  const [volume, setVolume] = useState(50);
  const panelSettings = usePanelSettings<Settings>({
    read: () => ({ volume }),
    restore: (values) => {
      restored.push(values);
      setVolume(values.volume);
    },
  });
  return (
    <>
      <PanelSettingsButton panel="Glassware" {...panelSettings} />
      <output>{volume}</output>
      {panelSettings.isOpen ? (
        <button
          type="button"
          data-testid="change"
          onClick={() => {
            setVolume(volume * 2);
          }}
        />
      ) : null}
    </>
  );
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  restored.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(<Panel />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

function labels(): string[] {
  return [...host.querySelectorAll('button[aria-label]')].map(
    (button) => button.getAttribute('aria-label') ?? '',
  );
}

function volume(): string {
  return host.querySelector('output')?.textContent ?? '';
}

function click(selector: string): void {
  const button = host.querySelector<HTMLButtonElement>(selector);
  if (!button) throw new Error(`no ${selector}`);
  act(() => {
    button.click();
  });
}

test('the gear gives way to keep and cancel while the settings are open', () => {
  expect(labels()).toStrictEqual(['Glassware settings']);

  click('[aria-label="Glassware settings"]');

  expect(labels()).toStrictEqual([
    'Keep the changes to the Glassware settings',
    'Cancel the changes to the Glassware settings',
  ]);
  expect(host.querySelector('[data-testid="change"]')).not.toBeNull();
});

test('cancelling puts back the settings as they were opened', () => {
  click('[aria-label="Glassware settings"]');
  click('[data-testid="change"]');
  click('[data-testid="change"]');

  expect(volume()).toBe('200');

  click('[aria-label="Cancel the changes to the Glassware settings"]');

  expect(restored).toStrictEqual([{ volume: 50 }]);
  expect(volume()).toBe('50');
  expect(labels()).toStrictEqual(['Glassware settings']);
});

test('keeping leaves the settings as they were changed', () => {
  click('[aria-label="Glassware settings"]');
  click('[data-testid="change"]');
  click('[aria-label="Keep the changes to the Glassware settings"]');

  expect(restored).toStrictEqual([]);
  expect(volume()).toBe('100');
  expect(labels()).toStrictEqual(['Glassware settings']);
});

test('a second opening remembers the settings kept by the first', () => {
  click('[aria-label="Glassware settings"]');
  click('[data-testid="change"]');
  click('[aria-label="Keep the changes to the Glassware settings"]');
  click('[aria-label="Glassware settings"]');
  click('[data-testid="change"]');
  click('[aria-label="Cancel the changes to the Glassware settings"]');

  expect(restored).toStrictEqual([{ volume: 100 }]);
  expect(volume()).toBe('100');
});
