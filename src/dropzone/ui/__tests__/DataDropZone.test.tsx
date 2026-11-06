// @vitest-environment jsdom
/**
 * The three ways into a page waiting for data.
 *
 * Each of them starts from a browser event, and a paste is heard on the whole
 * document, so what matters is which events the zone takes and which it leaves
 * to the page around it.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { DataDropZoneProps } from '../DataDropZone.tsx';
import { DataDropZone } from '../DataDropZone.tsx';

const SPECTRUM = new File(['100 1'], 'spectrum.jdx');

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

function render(props: Partial<DataDropZoneProps> = {}) {
  const handlers = { onFiles: vi.fn(), onText: vi.fn(), ...props };
  act(() => {
    root.render(<DataDropZone title="Drop a spectrum" {...handlers} />);
  });
  return handlers;
}

function button(name: string): HTMLButtonElement | undefined {
  return Array.from(host.querySelectorAll('button')).find(
    (candidate) => candidate.textContent === name,
  );
}

function paste(
  data: { files?: File[]; text?: string },
  target: EventTarget = document.body,
): Event {
  const event = new Event('paste', { bubbles: true, cancelable: true });
  Object.assign(event, {
    clipboardData: {
      files: data.files ?? [],
      getData: () => data.text ?? '',
    },
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

function drag(
  type: string,
  target: Element,
  data: { types: string[]; files?: File[]; text?: string },
): void {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, {
    dataTransfer: {
      types: data.types,
      files: data.files ?? [],
      getData: () => data.text ?? '',
      dropEffect: 'none',
    },
  });
  act(() => {
    target.dispatchEvent(event);
  });
}

function takeEvent(event: Event): void {
  event.preventDefault();
}

function zone(): Element {
  return host.querySelector('.data-drop-zone') as Element;
}

function veil(): Element | null {
  return host.querySelector('[data-testid="structure-drop-overlay"]');
}

test('Open asks for a file and hands over the ones chosen', () => {
  const { onFiles } = render({ accept: '.jdx,.txt' });
  const input = host.querySelector('input[type="file"]') as HTMLInputElement;
  const picker = vi.spyOn(input, 'click');

  act(() => {
    button('Open')?.click();
  });

  expect(picker).toHaveBeenCalledOnce();
  expect(input.accept).toBe('.jdx,.txt');
  expect(input.multiple).toBe(true);

  Object.defineProperty(input, 'files', { value: [SPECTRUM], writable: true });
  act(() => {
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });

  expect(onFiles).toHaveBeenCalledExactlyOnceWith([SPECTRUM]);
});

test('Paste is offered only when the page says what it does', () => {
  render();

  expect(button('Paste')).toBeUndefined();

  const onPasteClick = vi.fn();
  render({ onPasteClick });
  act(() => {
    button('Paste')?.click();
  });

  expect(onPasteClick).toHaveBeenCalledOnce();
});

test('a click on the zone itself asks for nothing, so it can focus a frame', () => {
  const onPasteClick = vi.fn();
  const { onFiles, onText } = render({ onPasteClick });
  const input = host.querySelector('input[type="file"]') as HTMLInputElement;
  const picker = vi.spyOn(input, 'click');

  act(() => {
    (zone() as HTMLElement).click();
  });

  expect(picker).toHaveBeenCalledTimes(0);
  expect(onPasteClick).toHaveBeenCalledTimes(0);
  expect(onFiles).toHaveBeenCalledTimes(0);
  expect(onText).toHaveBeenCalledTimes(0);
});

test('text pasted anywhere on the page is taken, trimmed', () => {
  const { onFiles, onText } = render();

  const event = paste({ text: ' 100 1\n ' });

  expect(onText).toHaveBeenCalledWith('100 1');
  expect(onFiles).toHaveBeenCalledTimes(0);
  expect(event.defaultPrevented).toBe(true);
});

test('files pasted win over the name they carry as text', () => {
  const { onFiles, onText } = render();

  paste({ files: [SPECTRUM], text: 'spectrum.jdx' });

  expect(onFiles).toHaveBeenCalledWith([SPECTRUM]);
  expect(onText).toHaveBeenCalledTimes(0);
});

test('a paste into a field belongs to the field', () => {
  const { onText } = render();
  const field = document.createElement('input');
  document.body.append(field);

  const event = paste({ text: '100 1' }, field);
  field.remove();

  expect(onText).toHaveBeenCalledTimes(0);
  expect(event.defaultPrevented).toBe(false);
});

test('a paste the page already took is left alone', () => {
  const { onText } = render();
  document.body.addEventListener('paste', takeEvent);

  paste({ text: '100 1' });
  document.body.removeEventListener('paste', takeEvent);

  expect(onText).toHaveBeenCalledTimes(0);
});

test('a zone taking files only leaves pasted text to the page', () => {
  const { onFiles } = render({ onText: undefined });

  const event = paste({ text: '100 1' });

  expect(onFiles).toHaveBeenCalledTimes(0);
  expect(event.defaultPrevented).toBe(false);
});

test('a paste stops being heard with the zone gone', () => {
  const { onText } = render();
  act(() => {
    root.render(null);
  });

  paste({ text: '100 1' });

  expect(onText).toHaveBeenCalledTimes(0);
});

test('a dragged file raises the veil and is handed over when dropped', () => {
  const { onFiles } = render();
  const data = { types: ['Files'], files: [SPECTRUM] };

  drag('dragenter', zone(), data);

  expect(veil()?.textContent).toBe('Drop here');
  expect(zone().className).toBe('data-drop-zone data-drop-zone--over');

  drag('drop', veil() as Element, data);

  expect(veil()).toBeNull();
  expect(onFiles).toHaveBeenCalledWith([SPECTRUM]);
});

test('dragged text reaches a zone that takes text', () => {
  const { onText } = render();
  const data = { types: ['text/plain'], text: '100 1' };

  drag('dragenter', zone(), data);
  drag('drop', veil() as Element, data);

  expect(onText).toHaveBeenCalledWith('100 1');
});

test('dragged text raises no veil over a zone taking files only', () => {
  render({ onText: undefined });

  drag('dragenter', zone(), { types: ['text/plain'], text: '100 1' });

  expect(veil()).toBeNull();
});
