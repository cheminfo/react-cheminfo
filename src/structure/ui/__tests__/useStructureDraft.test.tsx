// @vitest-environment jsdom
/**
 * A drawing reported by the editor changes the draft without reloading the
 * canvas; a structure the page puts in reloads it.
 */

import { act } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { StructureDraft } from '../useStructureDraft.ts';
import { useStructureDraft } from '../useStructureDraft.ts';

let host: HTMLDivElement;
let root: Root;
const seen: Array<StructureDraft<string>> = [];

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  seen.length = 0;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

function Probe(props: { initial: string }) {
  seen.push(useStructureDraft(props.initial));
  return null;
}

function latest(): StructureDraft<string> {
  const draft = seen.at(-1);
  if (draft === undefined) throw new Error('the hook never rendered');
  return draft;
}

test('the draft opens on its first structure, at revision 0', () => {
  act(() => root.render(<Probe initial="gC`@Dij@@" />));

  expect(latest().value).toBe('gC`@Dij@@');
  expect(latest().revision).toBe(0);
});

test('a drawing keeps the revision, a load bumps it', () => {
  act(() => root.render(<Probe initial="" />));
  act(() => latest().update('gC`@Dij@@'));

  expect([latest().value, latest().revision]).toStrictEqual(['gC`@Dij@@', 0]);

  act(() => latest().load('fH@@'));

  expect([latest().value, latest().revision]).toStrictEqual(['fH@@', 1]);

  // Loading the same structure again still reloads the canvas: a Clear
  // pressed twice empties it twice.
  act(() => latest().load('fH@@'));

  expect([latest().value, latest().revision]).toStrictEqual(['fH@@', 2]);
});

test('the same drawing twice renders nothing new, and the setters stay put', () => {
  act(() => root.render(<Probe initial="fH@@" />));
  const first = latest();
  const renders = seen.length;
  act(() => first.update('fH@@'));

  expect(seen).toHaveLength(renders);

  act(() => first.load(''));

  expect(latest().load).toBe(first.load);
  expect(latest().update).toBe(first.update);
});
