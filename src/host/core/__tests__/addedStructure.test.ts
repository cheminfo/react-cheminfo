/**
 * What chembio and wikidata hand back to a host framing their search: the
 * structure handed over last, an item of its own each time.
 */

import { expect, test } from 'vitest';

import type { AddedStructure } from '../addedStructure.ts';
import { addedStructureOutputs } from '../addedStructure.ts';

/**
 * A stand-in for the signal a site keeps the hand-over in.
 * @returns The source, and the means to hand a structure over.
 */
function source() {
  let value: AddedStructure | null = null;
  const listeners = new Set<() => void>();
  return {
    peek: () => value,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    hand: (next: AddedStructure) => {
      value = next;
      for (const listener of listeners) listener();
    },
  };
}

test('nothing goes back before a structure is handed over', () => {
  const added = source();

  expect(addedStructureOutputs(added).read()).toStrictEqual([]);
});

test('the last structure goes back as a molfile, under an id of its own each time', () => {
  const added = source();
  const outputs = addedStructureOutputs(added);
  added.hand({ count: 1, molfile: 'benzene' });
  const first = outputs.read();
  added.hand({ count: 2, molfile: 'benzene' });

  expect(first).toStrictEqual([
    {
      key: 'structure',
      kind: 'chem.molfile',
      id: '1',
      value: { molfile: 'benzene' },
    },
  ]);
  expect(outputs.read()).toStrictEqual([
    {
      key: 'structure',
      kind: 'chem.molfile',
      id: '2',
      value: { molfile: 'benzene' },
    },
  ]);
});

test('a hand-over is heard until the host stops listening', () => {
  const added = source();
  const outputs = addedStructureOutputs(added);
  let heard = 0;
  const stop = outputs.subscribe(() => {
    heard++;
  });
  added.hand({ count: 1, molfile: 'a' });
  stop();
  added.hand({ count: 2, molfile: 'b' });

  expect(heard).toBe(1);
});

test('what a host asks for is the site’s, and is absent when the site has none', async () => {
  const picked = {
    structure: () =>
      Promise.resolve({ kind: 'chem.molfile', value: { molfile: 'picked' } }),
  };
  const withRender = addedStructureOutputs(source(), picked);

  expect(withRender.render).toBe(picked);
  await expect(withRender.render?.structure?.()).resolves.toStrictEqual({
    kind: 'chem.molfile',
    value: { molfile: 'picked' },
  });
  expect('render' in addedStructureOutputs(source())).toBe(false);
});
