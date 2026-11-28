/**
 * An editor opens the example its address names as the page starts, names an
 * example it opens in the address, and takes the name off when it clears.
 */

import { expect, test } from 'vitest';

import { createExampleMark } from '../../../share/core/exampleMark.ts';
import { createEditorExamples } from '../editorExamples.ts';

interface Bench {
  pieces: string[];
}

type Id = 'pendulum' | 'pulley';

function isId(value: unknown): value is Id {
  return value === 'pendulum' || value === 'pulley';
}

function editor(named: string | null) {
  const address = { example: named };
  const log: string[] = [];
  let shown: Bench = { pieces: [] };
  const mark = createExampleMark<Bench>();
  const examples = createEditorExamples<Id, Bench>({
    editor: {
      linkedExample: () => address.example,
      writeExample: (id) => {
        address.example = id;
      },
    },
    isExampleId: isId,
    build: (id) => ({ pieces: [id] }),
    open: (bench, { forget }) => {
      shown = bench;
      log.push(
        `open ${bench.pieces.join(',') || 'nothing'} forget=${String(forget)}`,
      );
    },
    document: () => shown,
    mark,
    empty: () => ({ pieces: [] }),
    keepNowhere: () => {
      log.push('keep nowhere');
    },
  });
  return { address, log, mark, examples, shown: () => shown };
}

test('the example the address names opens as the page starts, marked as it opened', () => {
  const page = editor('pulley');
  page.examples.openLinkedExample();

  expect(page.examples.linkedExample()).toBe('pulley');
  expect(page.log).toStrictEqual(['open pulley forget=true']);
  expect(page.mark.read(page.shown())).toStrictEqual({
    example: 'pulley',
    changed: false,
  });
});

test('an address naming no example of the site opens nothing', () => {
  const page = editor('gone');
  page.examples.openLinkedExample();

  expect(page.examples.linkedExample()).toBeNull();
  expect(page.log).toStrictEqual([]);
});

test('an example opened is named in the address, and clearing takes the name off', () => {
  const page = editor(null);
  page.examples.openExample('pendulum');

  expect(page.address.example).toBe('pendulum');

  page.examples.clear();

  expect(page.address.example).toBeNull();
  expect(page.log).toStrictEqual([
    'open pendulum forget=false',
    'keep nowhere',
    'open nothing forget=false',
    'keep nowhere',
  ]);
});
