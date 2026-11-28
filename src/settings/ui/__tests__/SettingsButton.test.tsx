// @vitest-environment jsdom
import { act } from 'react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { mountRoot, root, unmountRoot } from '../../../__tests__/root.ts';
import { createReactiveSystem } from '../../../state/core/__tests__/fakeSignals.ts';
import { stubIndexedDB } from '../../../storage/core/__tests__/fakeIndexedDB.ts';
import { createWorkspaces } from '../../../storage/core/createWorkspaces.ts';
import { SettingsButton } from '../SettingsButton.tsx';

beforeEach(() => {
  stubIndexedDB();
  const entries = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
    removeItem: (key: string) => {
      entries.delete(key);
    },
  });
  mountRoot();
});

afterEach(() => {
  unmountRoot();
  document.body.innerHTML = '';
  vi.unstubAllGlobals();
});

test('the gear says what the settings hold, and opens them', async () => {
  const { signal, effect } = createReactiveSystem();
  const workspaces = createWorkspaces({
    name: 'button',
    site: 'plot',
    bucket: { resolution: signal(600) },
    effect,
    builtins: [{ id: 'chart', name: 'Chart' }],
    delay: 0,
  });
  await workspaces.ready;
  act(() => {
    root.render(
      <SettingsButton
        workspaces={workspaces}
        tabs={[{ id: 'general', title: 'General', content: <p>Resolution</p> }]}
        description="Settings: the workspace and the journal"
      />,
    );
  });
  const gear = document.querySelector<HTMLButtonElement>(
    'button[aria-label="Settings"]',
  );

  expect(gear?.title).toBe('Settings: the workspace and the journal');
  expect(document.body.textContent).not.toContain('Resolution');

  act(() => {
    gear?.click();
  });

  expect(document.body.textContent).toContain('Resolution');
});
