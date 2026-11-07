// @vitest-environment jsdom
import type { ReactElement } from 'react';
import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { useFigureSend } from '../useFigureSend.ts';
import { useFigureTask } from '../useFigureTask.ts';

let host: HTMLDivElement;
let root: Root;
let written: number;
let shared: File[];
let refusals: string[];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  written = 0;
  shared = [];
  refusals = [];
  vi.stubGlobal('navigator', {
    canShare: () => true,
    share: (data: ShareData) => {
      shared.push(...(data.files ?? []));
      const refusal = refusals.shift();
      return refusal === undefined
        ? Promise.resolve()
        : Promise.reject(new DOMException(refusal, refusal));
    },
  });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  act(() => {
    root.render(<Harness />);
  });
});

afterEach(() => {
  act(() => {
    root.unmount();
  });
  host.remove();
  vi.unstubAllGlobals();
});

test('a file written in time is sent on the press that asked for it', async () => {
  await press('send');

  expect(written).toBe(1);
  expect(shared).toHaveLength(1);
  expect(shared[0]?.name).toBe('plate.png');
  expect(notice()).toBe('sent');
});

test('a file written too late is kept, and the next press shares it at once', async () => {
  refusals.push('NotAllowedError');
  await press('send');

  expect(notice()).toBe('sendReady');

  const kept = shared[0];

  // Handed over inside the press itself, before anything is awaited: what an
  // older Safari asks for, and what every browser accepts.
  act(() => {
    button('send').click();
  });

  expect(shared).toHaveLength(2);
  expect(shared[1]).toBe(kept);
  expect(written).toBe(1);

  await act(settle);

  expect(notice()).toBe('sent');
});

test('a kept file refused again says the page cannot send it', async () => {
  refusals.push('NotAllowedError', 'NotAllowedError');
  await press('send');
  await press('send');

  expect(written).toBe(1);
  expect(notice()).toBe('sendUnsupported');
});

test('a sheet closed without picking an app leaves the panel as it was', async () => {
  refusals.push('AbortError');
  await press('send');

  expect(notice()).toBe('none');
  expect(failure()).toBe('none');
});

test('a choice changed after the file was kept writes it again', async () => {
  refusals.push('NotAllowedError');
  await press('send');
  await press('clear');
  await press('send');

  expect(written).toBe(2);
  expect(notice()).toBe('sent');
});

test('a file that could not be written reports why', async () => {
  await press('fail');

  expect(shared).toHaveLength(0);
  expect(failure()).toBe('The canvas is tainted.');
});

/**
 * The panel's send button, its notice and its failure, and nothing else.
 * @returns The buttons and what they came to.
 */
function Harness(): ReactElement {
  const task = useFigureTask();
  const send = useFigureSend(task);
  return (
    <>
      <button
        type="button"
        data-action="send"
        onClick={() => {
          send(async () => {
            written += 1;
            return new File(['png'], 'plate.png', { type: 'image/png' });
          });
        }}
      />
      <button
        type="button"
        data-action="fail"
        onClick={() => {
          send(() => Promise.reject(new Error('The canvas is tainted.')));
        }}
      />
      <button type="button" data-action="clear" onClick={task.clear} />
      <output data-field="notice">{task.notice ?? 'none'}</output>
      <output data-field="failure">{task.failure ?? 'none'}</output>
    </>
  );
}

async function press(action: string): Promise<void> {
  await act(async () => {
    button(action).click();
    await settle();
  });
}

/**
 * Let the write, the sheet and the state they set all come to rest.
 * @returns Once they have.
 */
function settle(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

function button(action: string): HTMLButtonElement {
  const found = [...host.querySelectorAll('button')].find(
    (candidate) => candidate.dataset.action === action,
  );
  if (found === undefined) throw new Error(`no ${action} button`);
  return found;
}

function notice(): string | null {
  return host.querySelector('[data-field="notice"]')?.textContent ?? null;
}

function failure(): string | null {
  return host.querySelector('[data-field="failure"]')?.textContent ?? null;
}
